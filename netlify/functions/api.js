const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize database table if it doesn't exist
const initDb = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        uid TEXT PRIMARY KEY,
        name TEXT,
        score INTEGER DEFAULT 0,
        character_data JSONB,
        settings JSONB,
        gamestate JSONB,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } finally {
    client.release();
  }
};

exports.handler = async (event, context) => {
  await initDb();
  
  const path = event.path.replace(/\.netlify\/functions\/api\/?/, '');
  const method = event.httpMethod;

  try {
    if (path.includes('save-profile') && method === 'POST') {
      const { uid, name, score, character_data, settings, gamestate } = JSON.parse(event.body);
      
      const query = `
        INSERT INTO users (uid, name, score, character_data, settings, gamestate, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
        ON CONFLICT (uid) DO UPDATE
        SET name = EXCLUDED.name,
            score = EXCLUDED.score,
            character_data = EXCLUDED.character_data,
            settings = EXCLUDED.settings,
            gamestate = EXCLUDED.gamestate,
            updated_at = CURRENT_TIMESTAMP;
      `;
      
      await pool.query(query, [uid, name, score, character_data, settings, gamestate]);
      
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Profile saved successfully' }),
      };
    }

    if (path.includes('load-profile') && method === 'GET') {
      const uid = event.queryStringParameters.uid;
      
      const res = await pool.query('SELECT * FROM users WHERE uid = $1', [uid]);
      
      if (res.rows.length > 0) {
        return {
          statusCode: 200,
          body: JSON.stringify(res.rows[0]),
        };
      } else {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: 'User not found' }),
        };
      }
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'Not Found' }),
    };
  } catch (error) {
    console.error('Database error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error', details: error.message }),
    };
  }
};
