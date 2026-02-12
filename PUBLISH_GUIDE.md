# 🚀 How to Publish Your Game

The repository root now contains everything you need to run the game with cloud syncing.

## Option 1: Manual Drag & Drop (Easiest)
1.  Zip all files in this directory (e.g., `index.html`, `game.js`, `netlify/`, `netlify.toml`).
2.  Go to [Netlify Drop](https://app.netlify.com/drop).
3.  Drag and drop your zip file there.
4.  **Important**: Since you have the Neon integration, Netlify already added the database URLs!
    - If you see `NETLIFY_DATABASE_URL` in your Netlify site settings, you are ready to go.
    - If it's missing, add it manually under **Site Settings > Build & deploy > Environment variables**.

## Option 2: GitHub Connect
If you connect your GitHub repository to Netlify, it will automatically detect `netlify.toml` and deploy the site using `npm install`.

## Folder Structure Explained
- `index.html`, `game.js`, `styles.css`: The core game files (at root for easy deployment).
- `netlify/functions/`: The "Brain" that talks securely to your PostgreSQL database.
- `netlify.toml`: Instructions for Netlify (auto-installs dependencies).
- `.env`: Your local database configuration (excluded from Git/Deploys for security).

## Support
The game uses the **Web Speech API** for narration and **PostgreSQL** for cloud saving. When deployed, it will automatically connect to your Neon database! 🚀✨
