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
        ('University Pizza', '3623 Shaganappi Trail NW, Calgary, AB', 51.0887, -114.1345, 4.3, 1),
        ('Pizza Hut - University District', '3630 Brentwood Rd NW, Calgary, AB', 51.0923, -114.1289, 4.0, 2),
        ('Domino''s Pizza - Brentwood', '3630 Brentwood Rd NW, Calgary, AB', 51.0920, -114.1285, 3.9, 1),
        ('Boston Pizza - Crowfoot', '150 Crowfoot Cres NW, Calgary, AB', 51.1218, -114.2078, 4.2, 2),
        ('Panago Pizza - Brentwood', '3630 Brentwood Rd NW #308, Calgary, AB', 51.0925, -114.1291, 4.1, 2),
        ('Chicago Deep Dish Pizza Co', '3608 Brentwood Rd NW, Calgary, AB', 51.0915, -114.1280, 4.4, 2),
        ('Pizza 73 - University Heights', '3410 20 St NW, Calgary, AB', 51.0762, -114.0890, 3.8, 1),
        ('Famoso Neapolitan Pizzeria - Market Mall', '3625 Shaganappi Trail NW, Calgary, AB', 51.0895, -114.1352, 4.3, 2),
        ('Pulcinella - Kensington', '1147 Kensington Cres NW, Calgary, AB', 51.0525, -114.0862, 4.5, 2),
        ('Noble Pie Parlour', '2418 4 St NW, Calgary, AB', 51.0627, -114.0745, 4.6, 2),
        ('UNA Pizza + Wine - Brentwood', '3630 Brentwood Rd NW, Calgary, AB', 51.0918, -114.1287, 4.5, 3),
        ('Village Flatbread Co', '4600 Crowchild Trail NW, Calgary, AB', 51.0835, -114.1512, 4.4, 2),
        ('Red Swan Pizza - Varsity', '4607 Varsity Dr NW, Calgary, AB', 51.0898, -114.1456, 4.2, 2),
        ('Canadian Pizza Unlimited - U of C', '3355 University Dr NW, Calgary, AB', 51.0795, -114.1275, 4.0, 1),
        ('Blaze Pizza - Market Mall', '3625 Shaganappi Trail NW, Calgary, AB', 51.0893, -114.1348, 4.2, 2),
        ('Spacca Napoli Pizzeria', '4322 16 Ave NW, Calgary, AB', 51.0680, -114.1145, 4.7, 3),
        ('Inglewood Drive-In', '2422 Crowchild Trail NW, Calgary, AB', 51.0632, -114.1098, 4.1, 1),
        ('Double Zero - Market Mall', '3625 Shaganappi Trail NW, Calgary, AB', 51.0896, -114.1350, 4.4, 3),
        ('Nikos Pizza - Montgomery', '5005 16 Ave NW, Calgary, AB', 51.0682, -114.1412, 3.9, 1),
        ('Za Pizza Bistro', '3904 Edmonton Trail NE, Calgary, AB', 51.0738, -114.0515, 4.3, 2),
        ('Without Papers Pizza - Hillhurst', '1216 Kensington Rd NW, Calgary, AB', 51.0528, -114.0868, 4.6, 2),
        ('Sal''s Pizzeria', '5005 20 St NW, Calgary, AB', 51.0680, -114.0893, 4.2, 2),
        ('Mountain Mike''s Pizza', '5333 Northland Dr NW, Calgary, AB', 51.0975, -114.1125, 4.1, 2),
        ('La Pizzeria Napoletana', '3702 17 Ave SW, Calgary, AB', 51.0368, -114.1035, 4.5, 2),
        ('The Pie Hole Pizza', '4739 17 Ave SE, Calgary, AB', 51.0365, -113.9715, 4.3, 2)
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
