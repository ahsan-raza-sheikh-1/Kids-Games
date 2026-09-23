const fs = require('node:fs');
const path = require('node:path');

const catalogPath = path.join(__dirname, '../../backend/Data/game-catalog.json');
let cachedCatalog;

function getCatalog() {
  if (!cachedCatalog) {
    cachedCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  }
  return cachedCatalog;
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=60'
    },
    body: JSON.stringify(body)
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return json(405, { message: 'Only GET requests are supported.' });
  }

  try {
    const requestPath = (event.path || '')
      .replace(/^\/(?:\.netlify\/functions\/api|api)\/?/, '')
      .replace(/^\/+|\/+$/g, '');
    const segments = requestPath.split('/').filter(Boolean);
    const catalog = getCatalog();

    if (segments[0] === 'catalog' || requestPath === '') {
      return json(200, catalog);
    }

    if (segments[0] !== 'games') {
      return json(404, { message: 'Not found.' });
    }

    if (segments[1]) {
      const game = catalog.games.find((entry) => entry.id.toLowerCase() === segments[1].toLowerCase());
      return game ? json(200, game) : json(404, { message: 'Game not found.' });
    }

    const params = event.queryStringParameters || {};
    const games = catalog.games.filter((game) => {
      const matchesAge = !params.ageBand || game.ageBand.toLowerCase() === params.ageBand.toLowerCase();
      const matchesCategory = !params.category || game.category.toLowerCase() === params.category.toLowerCase();
      return matchesAge && matchesCategory;
    });

    return json(200, { version: catalog.version, games });
  } catch (error) {
    console.error('Catalog API error:', error);
    return json(500, { message: 'Catalog unavailable.' });
  }
};
