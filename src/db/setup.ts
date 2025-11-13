import { Pool } from "pg";

export const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "pizzaparty",
  password: process.env.DB_PASSWORD || "postgres",
  port: parseInt(process.env.DB_PORT || "5432"),
});

export async function initDatabase() {
  const client = await pool.connect();
  try {
    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        lat DECIMAL(10, 7),
        lng DECIMAL(10, 7),
        profile_pic_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS pizzas (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        lat DECIMAL(10, 7) NOT NULL,
        lng DECIMAL(10, 7) NOT NULL,
        rating DECIMAL(2, 1) DEFAULT 4.5,
        price_range INTEGER DEFAULT 2,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Check if users exist
    const userCount = await client.query("SELECT COUNT(*) FROM users");
    if (parseInt(userCount.rows[0].count) === 0) {
      // Seed users
      await client.query(`
        INSERT INTO users (email, password, name, address, lat, lng, profile_pic_url) VALUES
        ('alice@example.com', 'password123', 'Alice Johnson', '123 Main St, Calgary, AB', 51.0447, -114.0719, 'https://i.pravatar.cc/150?img=1'),
        ('bob@example.com', 'password456', 'Bob Smith', '456 Elm St, Calgary, AB', 51.0486, -114.0708, 'https://i.pravatar.cc/150?img=2'),
        ('charlie@example.com', 'password789', 'Charlie Brown', '789 Oak Ave, Calgary, AB', 51.0451, -114.0892, 'https://i.pravatar.cc/150?img=3')
      `);
    }

    // Check if pizzas exist
    const pizzaCount = await client.query("SELECT COUNT(*) FROM pizzas");
    if (parseInt(pizzaCount.rows[0].count) === 0) {
      // Seed pizza shops near University of Calgary
      await client.query(`
        INSERT INTO pizzas (name, address, lat, lng, rating, price_range) VALUES
        ('Una Pizza + Wine', '618 17 Ave SW, Calgary, AB T2S 0B1', 51.0370, -114.0780, 4.6, 3),
        ('Pizzeria Grano', '1625 11 Ave SW, Calgary, AB T3C 0N8', 51.0390, -114.1020, 4.5, 2),
        ('Without Papers Pizza', '1216 9 Ave SE, Calgary, AB T2G 0T1', 51.0425, -114.0560, 4.7, 2),
        ('Pulcinella', '1722 4 St SW, Calgary, AB T2S 1W4', 51.0380, -114.0750, 4.4, 2),
        ('Nicli Antica Pizzeria', '524 11 Ave SW, Calgary, AB T2R 0C8', 51.0420, -114.0740, 4.5, 2),
        ('Pizzeria Bravo', '1924 4 St SW, Calgary, AB T2S 1W7', 51.0352, -114.0748, 4.3, 2),
        ('Famoso Neapolitan Pizzeria', '519 17 Ave SW, Calgary, AB T2S 0B1', 51.0372, -114.0742, 4.2, 2),
        ('Double Zero Neapolitan Pizza', '805 17 Ave SW, Calgary, AB T2T 0A4', 51.0369, -114.0842, 4.6, 3)
      `);
    }

    // Check if posts exist
    const postCount = await client.query("SELECT COUNT(*) FROM posts");
    if (parseInt(postCount.rows[0].count) === 0) {
      // Seed some initial posts
      await client.query(`
        INSERT INTO posts (user_id, content, created_at) VALUES
        (1, 'Just tried the margherita at Una Pizza + Wine and it was absolutely incredible! 🍕✨', NOW() - INTERVAL '2 hours'),
        (2, 'Hot take: pineapple on pizza is actually good. Fight me. 🍍', NOW() - INTERVAL '5 hours'),
        (3, 'Does anyone know a good spot for late-night pizza near campus?', NOW() - INTERVAL '1 day'),
        (1, 'Trying to decide between Nicli and Without Papers tonight... recommendations?', NOW() - INTERVAL '2 days')
      `);
    }

    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("❌ Database initialization error:", error);
    throw error;
  } finally {
    client.release();
  }
}

// Helper to calculate distance (Haversine formula)
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
