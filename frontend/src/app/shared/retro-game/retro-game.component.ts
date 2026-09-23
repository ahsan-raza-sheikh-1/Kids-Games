import { Component, HostListener, OnDestroy, OnInit, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { GameDefinition } from '../../core/models/game.models';
import { ProgressService } from '../../core/services/progress.service';
import { SoundService } from '../../core/services/sound.service';

type RetroStatus = 'ready' | 'playing' | 'won' | 'lost';
type Direction = { row: number; col: number };
type CellCoordinate = { row: number; col: number };
type ChessColor = 'white' | 'black';
type ChessPieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
type CheckersColor = 'red' | 'black';
type SnakeComplexity = 'starter' | 'explorer' | 'challenger';

interface MineCell {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacent: number;
}

interface ChessPiece {
  type: ChessPieceType;
  color: ChessColor;
}

interface CheckersPiece {
  color: CheckersColor;
  king: boolean;
}

interface CheckersMove extends CellCoordinate {
  capture?: CellCoordinate;
}

interface SnakeComplexityOption {
  id: SnakeComplexity;
  label: string;
  target: number;
  description: string;
  tickMilliseconds: number;
}

const EMPTY_DIRECTION: Direction = { row: 0, col: 0 };

function sameCell(first: CellCoordinate, second: CellCoordinate): boolean {
  return first.row === second.row && first.col === second.col;
}

@Component({
  selector: 'kids-retro-game',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './retro-game.component.html',
  styleUrl: './retro-game.component.scss',
})
export class RetroGameComponent implements OnInit, OnDestroy {
  readonly game = input.required<GameDefinition>();

  private readonly progress = inject(ProgressService);
  private readonly sound = inject(SoundService);
  private snakeTimer?: ReturnType<typeof setInterval>;
  private computerTimer?: ReturnType<typeof setTimeout>;
  private mineStarted = false;

  readonly status = signal<RetroStatus>('ready');
  readonly finalStars = signal(0);
  readonly mode = computed(() => this.game().interaction);
  readonly boardSize = computed(() => this.game().settings?.boardSize ?? 8);
  readonly gridCells = computed(() => Array.from(
    { length: this.boardSize() * this.boardSize() },
    (_, index) => index,
  ));

  readonly snakeBody = signal<CellCoordinate[]>([]);
  readonly snakeFood = signal<CellCoordinate>({ row: 0, col: 0 });
  readonly snakeScore = signal(0);
  readonly snakeDirection = signal<Direction>({ row: 0, col: 1 });
  readonly snakeNextDirection = signal<Direction>({ row: 0, col: 1 });
  private readonly snakeComplexityOptions: readonly SnakeComplexityOption[] = [
    { id: 'starter', label: 'Starter', target: 5, description: 'A quick warm-up', tickMilliseconds: 200 },
    { id: 'explorer', label: 'Explorer', target: 10, description: 'A longer route', tickMilliseconds: 175 },
    { id: 'challenger', label: 'Challenger', target: 20, description: 'The full trail', tickMilliseconds: 150 },
  ];
  readonly snakeComplexities = computed(() => this.snakeComplexityOptions.filter(option =>
    option.target <= (this.game().settings?.maxTargetScore ?? 20)));
  readonly snakeComplexity = signal<SnakeComplexity>('starter');
  readonly selectedSnakeComplexity = computed(() => this.snakeComplexities().find(option =>
    option.id === this.snakeComplexity()) ?? this.snakeComplexities()[0] ?? this.snakeComplexityOptions[0]);
  readonly snakeTarget = computed(() => this.selectedSnakeComplexity().target);
  readonly snakeTickMilliseconds = computed(() => this.selectedSnakeComplexity().tickMilliseconds);

  readonly mineCells = signal<MineCell[]>([]);
  readonly mineFlagMode = signal(false);
  readonly mineCount = computed(() => this.game().settings?.mineCount ?? 7);
  readonly minesRemaining = computed(() => Math.max(
    0,
    this.mineCount() - this.mineCells().filter(cell => cell.flagged).length,
  ));

  readonly chessBoard = signal<(ChessPiece | null)[][]>([]);
  readonly chessSelected = signal<CellCoordinate | null>(null);
  readonly chessTurn = signal<ChessColor>('white');
  readonly chessLegalMoves = computed(() => {
    const selected = this.chessSelected();
    return selected ? this.getChessMoves(this.chessBoard(), selected.row, selected.col) : [];
  });

  readonly checkersBoard = signal<(CheckersPiece | null)[][]>([]);
  readonly checkersSelected = signal<CellCoordinate | null>(null);
  readonly checkersTurn = signal<CheckersColor>('red');
  readonly checkersLegalMoves = computed(() => {
    const selected = this.checkersSelected();
    return selected ? this.getCheckersMoves(this.checkersBoard(), selected.row, selected.col) : [];
  });

  ngOnInit(): void {
    this.setupMode();
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    if (this.mode() !== 'snake' || this.status() !== 'playing') {
      return;
    }

    const directions: Record<string, Direction | undefined> = {
      ArrowUp: { row: -1, col: 0 },
      ArrowDown: { row: 1, col: 0 },
      ArrowLeft: { row: 0, col: -1 },
      ArrowRight: { row: 0, col: 1 },
    };
    const direction = directions[event.key];
    if (direction) {
      event.preventDefault();
      this.changeSnakeDirection(direction);
    }
  }

  beginGame(): void {
    this.status.set('playing');
    this.finalStars.set(0);

    switch (this.mode()) {
      case 'snake':
        this.setupSnake();
        this.snakeTimer = setInterval(() => this.tickSnake(), this.snakeTickMilliseconds());
        break;
      case 'mines':
        this.setupMines();
        break;
      case 'chess':
        this.setupChess();
        break;
      case 'checkers':
        this.setupCheckers();
        break;
    }
  }

  restartGame(): void {
    this.clearTimers();
    this.setupMode();
    this.beginGame();
  }

  selectSnakeComplexity(complexity: SnakeComplexity): void {
    if (this.snakeComplexities().some(option => option.id === complexity)) {
      this.snakeComplexity.set(complexity);
      this.sound.play('tap');
    }
  }

  resetToStart(): void {
    this.clearTimers();
    this.setupMode();
  }

  rowFromIndex(index: number): number {
    return Math.floor(index / this.boardSize());
  }

  colFromIndex(index: number): number {
    return index % this.boardSize();
  }

  isDarkCell(index: number): boolean {
    return (this.rowFromIndex(index) + this.colFromIndex(index)) % 2 === 1;
  }

  isSnakeCell(index: number): boolean {
    const coordinate = { row: this.rowFromIndex(index), col: this.colFromIndex(index) };
    return this.snakeBody().some(cell => sameCell(cell, coordinate));
  }

  isSnakeHead(index: number): boolean {
    const head = this.snakeBody()[0];
    return Boolean(head && sameCell(head, {
      row: this.rowFromIndex(index),
      col: this.colFromIndex(index),
    }));
  }

  isSnakeFood(index: number): boolean {
    return sameCell(this.snakeFood(), {
      row: this.rowFromIndex(index),
      col: this.colFromIndex(index),
    });
  }

  changeSnakeDirection(direction: Direction): void {
    const current = this.snakeDirection();
    if (current.row + direction.row === 0 && current.col + direction.col === 0) {
      return;
    }
    this.snakeNextDirection.set(direction);
  }

  mineCell(index: number): MineCell {
    return this.mineCells()[index] ?? {
      mine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    };
  }

  mineCellDisplay(index: number): string {
    const cell = this.mineCell(index);
    if (cell.flagged && !cell.revealed) {
      return '⚑';
    }
    if (!cell.revealed) {
      return '';
    }
    if (cell.mine) {
      return '✹';
    }
    return cell.adjacent > 0 ? String(cell.adjacent) : '·';
  }

  mineCellLabel(index: number): string {
    const cell = this.mineCell(index);
    if (cell.flagged && !cell.revealed) {
      return `Cell ${index + 1}, flagged`;
    }
    if (!cell.revealed) {
      return `Cell ${index + 1}, hidden`;
    }
    if (cell.mine) {
      return `Cell ${index + 1}, mine`;
    }
    return `Cell ${index + 1}, ${cell.adjacent} nearby mines`;
  }

  toggleMineFlagMode(): void {
    this.mineFlagMode.update(value => !value);
    this.sound.play('tap');
  }

  handleMineCell(index: number): void {
    if (this.status() !== 'playing') {
      return;
    }

    if (this.mineFlagMode()) {
      this.toggleMineFlag(index);
      return;
    }

    let cells = this.mineCells().map(cell => ({ ...cell }));
    if (!this.mineStarted) {
      this.initializeMines(index);
      cells = this.mineCells().map(cell => ({ ...cell }));
    }

    const selected = cells[index];
    if (!selected || selected.flagged || selected.revealed) {
      return;
    }

    if (selected.mine) {
      cells = cells.map(cell => cell.mine ? { ...cell, revealed: true } : cell);
      this.mineCells.set(cells);
      this.loseGame();
      return;
    }

    this.revealMineRegion(cells, index);
    this.mineCells.set(cells);
    if (cells.every(cell => cell.mine || cell.revealed)) {
      this.winGame();
    } else {
      this.sound.play('tap');
    }
  }

  handleChessCell(row: number, col: number): void {
    if (this.status() !== 'playing' || this.chessTurn() !== 'white') {
      return;
    }

    const selected = this.chessSelected();
    const piece = this.chessBoard()[row]?.[col];
    if (selected && this.chessLegalMoves().some(move => sameCell(move, { row, col }))) {
      this.moveChessPiece(selected, { row, col });
      return;
    }

    this.chessSelected.set(piece?.color === 'white' ? { row, col } : null);
  }

  chessPieceAt(row: number, col: number): string {
    const piece = this.chessBoard()[row]?.[col];
    if (!piece) {
      return '';
    }
    return {
      white: { p: '♙', r: '♖', n: '♘', b: '♗', q: '♕', k: '♔' },
      black: { p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚' },
    }[piece.color][piece.type];
  }

  chessCellLabel(row: number, col: number): string {
    const piece = this.chessBoard()[row]?.[col];
    return piece ? `${piece.color} ${piece.type} at row ${row + 1}, column ${col + 1}` : `Empty square, row ${row + 1}, column ${col + 1}`;
  }

  isChessSelected(row: number, col: number): boolean {
    const selected = this.chessSelected();
    return Boolean(selected && selected.row === row && selected.col === col);
  }

  isChessMove(row: number, col: number): boolean {
    return this.chessLegalMoves().some(move => move.row === row && move.col === col);
  }

  handleCheckersCell(row: number, col: number): void {
    if (this.status() !== 'playing' || this.checkersTurn() !== 'red' || !this.isDarkCell(row * 8 + col)) {
      return;
    }

    const selected = this.checkersSelected();
    const piece = this.checkersBoard()[row]?.[col];
    if (selected && this.checkersLegalMoves().some(move => sameCell(move, { row, col }))) {
      this.moveCheckersPiece(selected, { row, col });
      return;
    }

    this.checkersSelected.set(piece?.color === 'red' ? { row, col } : null);
  }

  checkersPieceAt(row: number, col: number): string {
    const piece = this.checkersBoard()[row]?.[col];
    if (!piece) {
      return '';
    }
    return piece.king ? '♛' : '●';
  }

  isCheckersRedPiece(row: number, col: number): boolean {
    return this.checkersBoard()[row]?.[col]?.color === 'red';
  }

  isCheckersBlackPiece(row: number, col: number): boolean {
    return this.checkersBoard()[row]?.[col]?.color === 'black';
  }

  checkersCellLabel(row: number, col: number): string {
    const piece = this.checkersBoard()[row]?.[col];
    return piece ? `${piece.color}${piece.king ? ' king' : ''} piece at row ${row + 1}, column ${col + 1}` : `Empty square, row ${row + 1}, column ${col + 1}`;
  }

  isCheckersSelected(row: number, col: number): boolean {
    const selected = this.checkersSelected();
    return Boolean(selected && selected.row === row && selected.col === col);
  }

  isCheckersMove(row: number, col: number): boolean {
    return this.checkersLegalMoves().some(move => move.row === row && move.col === col);
  }

  private setupMode(): void {
    this.status.set('ready');
    this.finalStars.set(0);
    switch (this.mode()) {
      case 'snake':
        this.setupSnake();
        break;
      case 'mines':
        this.setupMines();
        break;
      case 'chess':
        this.setupChess();
        break;
      case 'checkers':
        this.setupCheckers();
        break;
    }
  }

  private setupSnake(): void {
    const center = Math.floor(this.boardSize() / 2);
    const body = Array.from({ length: 4 }, (_, index) => ({ row: center, col: center - index }));
    this.snakeBody.set(body);
    this.snakeDirection.set({ row: 0, col: 1 });
    this.snakeNextDirection.set({ row: 0, col: 1 });
    this.snakeScore.set(0);
    this.snakeFood.set(this.randomEmptyCell(body));
  }

  private tickSnake(): void {
    if (this.status() !== 'playing') {
      return;
    }

    const direction = this.snakeNextDirection();
    this.snakeDirection.set(direction);
    const head = this.snakeBody()[0];
    const size = this.boardSize();
    const next = {
      row: (head.row + direction.row + size) % size,
      col: (head.col + direction.col + size) % size,
    };
    const ateFood = sameCell(next, this.snakeFood());
    const occupied = this.snakeBody().slice(0, ateFood ? this.snakeBody().length : -1);
    if (occupied.some(cell => sameCell(cell, next))) {
      this.loseGame();
      return;
    }

    const nextBody = [next, ...this.snakeBody()];
    if (!ateFood) {
      nextBody.pop();
    }
    this.snakeBody.set(nextBody);

    if (ateFood) {
      const score = this.snakeScore() + 1;
      this.snakeScore.set(score);
      this.sound.play('correct');
      if (score >= this.snakeTarget()) {
        this.winGame();
      } else {
        this.snakeFood.set(this.randomEmptyCell(nextBody));
      }
    }
  }

  private randomEmptyCell(occupied: CellCoordinate[]): CellCoordinate {
    const size = this.boardSize();
    const available = this.gridCells()
      .map(index => ({ row: Math.floor(index / size), col: index % size }))
      .filter(cell => !occupied.some(item => sameCell(item, cell)));
    return available[Math.floor(Math.random() * available.length)] ?? { row: 0, col: 0 };
  }

  private setupMines(): void {
    this.mineStarted = false;
    this.mineFlagMode.set(false);
    this.mineCells.set(Array.from({ length: this.boardSize() ** 2 }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    })));
  }

  private initializeMines(firstIndex: number): void {
    const cells = this.mineCells();
    const excluded = new Set([firstIndex, ...this.neighborIndexes(firstIndex)]);
    const flagged = new Set(cells.flatMap((cell, index) => cell.flagged ? [index] : []));
    const available = this.gridCells().filter(index => !excluded.has(index) && !flagged.has(index));
    const mines = new Set(available.sort(() => Math.random() - 0.5).slice(0, this.mineCount()));
    const prepared = cells.map((cell, index) => ({ ...cell, mine: mines.has(index) }));

    prepared.forEach((cell, index) => {
      cell.adjacent = this.neighborIndexes(index).filter(neighbor => prepared[neighbor]?.mine).length;
    });
    this.mineStarted = true;
    this.mineCells.set(prepared);
  }

  private toggleMineFlag(index: number): void {
    const cells = this.mineCells().map(cell => ({ ...cell }));
    const cell = cells[index];
    if (!cell || cell.revealed) {
      return;
    }
    if (!cell.flagged && this.minesRemaining() === 0) {
      return;
    }
    cell.flagged = !cell.flagged;
    this.mineCells.set(cells);
    this.sound.play('tap');
  }

  private revealMineRegion(cells: MineCell[], startIndex: number): void {
    const queue = [startIndex];
    const visited = new Set<number>();
    while (queue.length > 0) {
      const index = queue.shift();
      if (index === undefined || visited.has(index)) {
        continue;
      }
      visited.add(index);
      const cell = cells[index];
      if (!cell || cell.mine || cell.flagged || cell.revealed) {
        continue;
      }
      cell.revealed = true;
      if (cell.adjacent === 0) {
        queue.push(...this.neighborIndexes(index));
      }
    }
  }

  private neighborIndexes(index: number): number[] {
    const size = this.boardSize();
    const row = Math.floor(index / size);
    const col = index % size;
    const neighbors: number[] = [];
    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
      for (let colOffset = -1; colOffset <= 1; colOffset++) {
        if (rowOffset === 0 && colOffset === 0) {
          continue;
        }
        const nextRow = row + rowOffset;
        const nextCol = col + colOffset;
        if (nextRow >= 0 && nextRow < size && nextCol >= 0 && nextCol < size) {
          neighbors.push(nextRow * size + nextCol);
        }
      }
    }
    return neighbors;
  }

  private setupChess(): void {
    const board = this.emptyChessBoard();
    const backRank: ChessPieceType[] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
    for (let col = 0; col < 8; col++) {
      board[0][col] = { type: backRank[col], color: 'black' };
      board[1][col] = { type: 'p', color: 'black' };
      board[6][col] = { type: 'p', color: 'white' };
      board[7][col] = { type: backRank[col], color: 'white' };
    }
    this.chessBoard.set(board);
    this.chessSelected.set(null);
    this.chessTurn.set('white');
  }

  private emptyChessBoard(): (ChessPiece | null)[][] {
    return Array.from({ length: 8 }, () => new Array<ChessPiece | null>(8).fill(null));
  }

  private moveChessPiece(from: CellCoordinate, to: CellCoordinate): void {
    const board = this.chessBoard().map(row => row.map(piece => piece ? { ...piece } : null));
    const piece = board[from.row][from.col];
    const target = board[to.row][to.col];
    if (!piece) {
      return;
    }
    board[to.row][to.col] = piece;
    board[from.row][from.col] = null;
    this.chessBoard.set(board);
    this.chessSelected.set(null);
    if (target?.type === 'k') {
      this.winGame();
      return;
    }
    this.chessTurn.set('black');
    this.sound.play('tap');
    this.computerTimer = setTimeout(() => this.makeChessComputerMove(), 450);
  }

  private makeChessComputerMove(): void {
    if (this.status() !== 'playing') {
      return;
    }
    const moves: Array<{ from: CellCoordinate; to: CellCoordinate }> = [];
    const board = this.chessBoard();
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (board[row][col]?.color === 'black') {
          this.getChessMoves(board, row, col).forEach(to => moves.push({ from: { row, col }, to }));
        }
      }
    }
    if (moves.length === 0) {
      this.winGame();
      return;
    }
    const captures = moves.filter(move => Boolean(board[move.to.row][move.to.col]));
    const move = captures[0] ?? moves[Math.floor(Math.random() * moves.length)];
    const nextBoard = board.map(row => row.map(piece => piece ? { ...piece } : null));
    const piece = nextBoard[move.from.row][move.from.col];
    const target = nextBoard[move.to.row][move.to.col];
    if (!piece) {
      return;
    }
    nextBoard[move.to.row][move.to.col] = piece;
    nextBoard[move.from.row][move.from.col] = null;
    this.chessBoard.set(nextBoard);
    if (target?.type === 'k') {
      this.loseGame();
      return;
    }
    this.chessTurn.set('white');
    this.sound.play('tap');
  }

  private getChessMoves(board: (ChessPiece | null)[][], row: number, col: number): CellCoordinate[] {
    const piece = board[row]?.[col];
    if (!piece) {
      return [];
    }
    const moves: CellCoordinate[] = [];
    const inBounds = (nextRow: number, nextCol: number) => nextRow >= 0 && nextRow < 8 && nextCol >= 0 && nextCol < 8;
    const empty = (nextRow: number, nextCol: number) => inBounds(nextRow, nextCol) && !board[nextRow][nextCol];
    const enemy = (nextRow: number, nextCol: number) => inBounds(nextRow, nextCol) && Boolean(board[nextRow][nextCol] && board[nextRow][nextCol]?.color !== piece.color);

    if (piece.type === 'p') {
      const direction = piece.color === 'white' ? -1 : 1;
      if (empty(row + direction, col)) {
        moves.push({ row: row + direction, col });
      }
      if (enemy(row + direction, col - 1)) {
        moves.push({ row: row + direction, col: col - 1 });
      }
      if (enemy(row + direction, col + 1)) {
        moves.push({ row: row + direction, col: col + 1 });
      }
    } else if (piece.type === 'n') {
      [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]].forEach(([rowOffset, colOffset]) => {
        if (empty(row + rowOffset, col + colOffset) || enemy(row + rowOffset, col + colOffset)) {
          moves.push({ row: row + rowOffset, col: col + colOffset });
        }
      });
    } else if (piece.type === 'k') {
      this.addChessLinearMoves(moves, board, row, col, [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]], piece.color, true);
    } else if (piece.type === 'r') {
      this.addChessLinearMoves(moves, board, row, col, [[0, 1], [0, -1], [1, 0], [-1, 0]], piece.color, false);
    } else if (piece.type === 'b') {
      this.addChessLinearMoves(moves, board, row, col, [[1, 1], [1, -1], [-1, 1], [-1, -1]], piece.color, false);
    } else {
      this.addChessLinearMoves(moves, board, row, col, [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]], piece.color, false);
    }
    return moves;
  }

  private addChessLinearMoves(
    moves: CellCoordinate[],
    board: (ChessPiece | null)[][],
    row: number,
    col: number,
    directions: number[][],
    color: ChessColor,
    singleStep: boolean,
  ): void {
    directions.forEach(([rowOffset, colOffset]) => {
      let nextRow = row + rowOffset;
      let nextCol = col + colOffset;
      while (nextRow >= 0 && nextRow < 8 && nextCol >= 0 && nextCol < 8) {
        const target = board[nextRow][nextCol];
        if (!target) {
          moves.push({ row: nextRow, col: nextCol });
        } else {
          if (target.color !== color) {
            moves.push({ row: nextRow, col: nextCol });
          }
          break;
        }
        if (singleStep) {
          break;
        }
        nextRow += rowOffset;
        nextCol += colOffset;
      }
    });
  }

  private setupCheckers(): void {
    const board = Array.from({ length: 8 }, () => new Array<CheckersPiece | null>(8).fill(null));
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          board[row][col] = { color: 'black', king: false };
        }
      }
    }
    for (let row = 5; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          board[row][col] = { color: 'red', king: false };
        }
      }
    }
    this.checkersBoard.set(board);
    this.checkersSelected.set(null);
    this.checkersTurn.set('red');
  }

  private moveCheckersPiece(from: CellCoordinate, to: CellCoordinate): void {
    const move = this.checkersLegalMoves().find(candidate => sameCell(candidate, to));
    if (!move) {
      return;
    }
    const board = this.checkersBoard().map(row => row.map(piece => piece ? { ...piece } : null));
    const piece = board[from.row][from.col];
    if (!piece) {
      return;
    }
    board[to.row][to.col] = piece;
    board[from.row][from.col] = null;
    if (move.capture) {
      board[move.capture.row][move.capture.col] = null;
    }
    if (piece.color === 'red' && to.row === 0) {
      piece.king = true;
    }
    this.checkersBoard.set(board);
    this.checkersSelected.set(null);
    if (this.evaluateCheckersBoard(board, 'black')) {
      return;
    }
    this.checkersTurn.set('black');
    this.sound.play('tap');
    this.computerTimer = setTimeout(() => this.makeCheckersComputerMove(), 450);
  }

  private getCheckersMoves(board: (CheckersPiece | null)[][], row: number, col: number): CheckersMove[] {
    const piece = board[row]?.[col];
    if (!piece) {
      return [];
    }
    const directions: number[][] = [];
    if (piece.color === 'red' || piece.king) {
      directions.push([-1, -1], [-1, 1]);
    }
    if (piece.color === 'black' || piece.king) {
      directions.push([1, -1], [1, 1]);
    }
    const jumps: CheckersMove[] = [];
    const simpleMoves: CheckersMove[] = [];
    directions.forEach(([rowOffset, colOffset]) => {
      const nextRow = row + rowOffset;
      const nextCol = col + colOffset;
      if (this.isCheckersInBounds(nextRow, nextCol) && !board[nextRow][nextCol]) {
        simpleMoves.push({ row: nextRow, col: nextCol });
      }
      const jumpRow = row + rowOffset * 2;
      const jumpCol = col + colOffset * 2;
      const middle = board[nextRow]?.[nextCol];
      if (this.isCheckersInBounds(jumpRow, jumpCol) && middle && middle.color !== piece.color && !board[jumpRow][jumpCol]) {
        jumps.push({ row: jumpRow, col: jumpCol, capture: { row: nextRow, col: nextCol } });
      }
    });
    return jumps.length > 0 ? jumps : simpleMoves;
  }

  private makeCheckersComputerMove(): void {
    if (this.status() !== 'playing') {
      return;
    }
    const board = this.checkersBoard();
    const moves: Array<{ from: CellCoordinate; to: CheckersMove }> = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (board[row][col]?.color === 'black') {
          this.getCheckersMoves(board, row, col).forEach(to => moves.push({ from: { row, col }, to }));
        }
      }
    }
    if (moves.length === 0) {
      this.winGame();
      return;
    }
    const captures = moves.filter(move => Boolean(move.to.capture));
    const selected = captures[0] ?? moves[Math.floor(Math.random() * moves.length)];
    const nextBoard = board.map(row => row.map(piece => piece ? { ...piece } : null));
    const piece = nextBoard[selected.from.row][selected.from.col];
    if (!piece) {
      return;
    }
    nextBoard[selected.to.row][selected.to.col] = piece;
    nextBoard[selected.from.row][selected.from.col] = null;
    if (selected.to.capture) {
      nextBoard[selected.to.capture.row][selected.to.capture.col] = null;
    }
    if (piece.color === 'black' && selected.to.row === 7) {
      piece.king = true;
    }
    this.checkersBoard.set(nextBoard);
    if (this.evaluateCheckersBoard(nextBoard, 'red')) {
      return;
    }
    this.checkersTurn.set('red');
    this.sound.play('tap');
  }

  private evaluateCheckersBoard(board: (CheckersPiece | null)[][], nextTurn: CheckersColor): boolean {
    const redPieces = board.flat().filter(piece => piece?.color === 'red').length;
    const blackPieces = board.flat().filter(piece => piece?.color === 'black').length;
    if (redPieces === 0) {
      this.loseGame();
      return true;
    }
    if (blackPieces === 0 || !this.hasCheckersMoves(board, nextTurn)) {
      if (nextTurn === 'black') {
        this.winGame();
      } else {
        this.loseGame();
      }
      return true;
    }
    return false;
  }

  private hasCheckersMoves(board: (CheckersPiece | null)[][], color: CheckersColor): boolean {
    return board.some((row, rowIndex) => row.some((piece, colIndex) => piece?.color === color && this.getCheckersMoves(board, rowIndex, colIndex).length > 0));
  }

  private isCheckersInBounds(row: number, col: number): boolean {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }

  private winGame(): void {
    if (this.status() === 'won') {
      return;
    }
    this.clearTimers();
    this.status.set('won');
    this.finalStars.set(this.progress.completeGame(this.game().id, 1, 1).stars);
    this.sound.play('complete');
  }

  private loseGame(): void {
    if (this.status() === 'lost') {
      return;
    }
    this.clearTimers();
    this.status.set('lost');
    this.sound.play('wrong');
  }

  private clearTimers(): void {
    if (this.snakeTimer) {
      clearInterval(this.snakeTimer);
      this.snakeTimer = undefined;
    }
    if (this.computerTimer) {
      clearTimeout(this.computerTimer);
      this.computerTimer = undefined;
    }
  }
}
