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
        photo_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        content TEXT NOT NULL,
        photo_url TEXT,
        pizza_id INTEGER REFERENCES pizzas(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Migration: Add photo_url column to pizzas table if it doesn't exist
    await client.query(`
      ALTER TABLE pizzas ADD COLUMN IF NOT EXISTS photo_url TEXT;
    `);

    // Migration: Add photo_url column to posts table if it doesn't exist
    await client.query(`
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS photo_url TEXT;
    `);

    // Migration: Add pizza_id column to posts table if it doesn't exist
    await client.query(`
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS pizza_id INTEGER REFERENCES pizzas(id);
    `);

    // Check if users exist
    const userCount = await client.query("SELECT COUNT(*) FROM users");
    if (parseInt(userCount.rows[0].count) === 0) {
      // Seed users
      await client.query(`
        INSERT INTO users (email, password, name, address, lat, lng, profile_pic_url) VALUES
        ('sarah.chen@example.com', 'password123', 'Sarah Maxwell', '2845 University Dr NW, Calgary, AB', 51.0825, -114.1290, 'https://i.pravatar.cc/150?img=47'),
        ('marcus.reid@example.com', 'password456', 'Marcus Reid', '3424 Crowchild Trail NW, Calgary, AB', 51.0715, -114.1385, 'https://i.pravatar.cc/150?img=33'),
        ('emily.park@example.com', 'password789', 'Emily Park', '4515 Varsity Dr NW, Calgary, AB', 51.0892, -114.1425, 'https://i.pravatar.cc/150?img=29'),
        ('david.kumar@example.com', 'password101', 'David Kumar', '3630 Brentwood Rd NW, Calgary, AB', 51.0920, -114.1288, 'https://i.pravatar.cc/150?img=68'),
        ('jessica.taylor@example.com', 'password202', 'Jessica Taylor', '2418 4 St NW, Calgary, AB', 51.0627, -114.0745, 'https://i.pravatar.cc/150?img=20')
      `);
    }

    // Check if pizzas exist
    const pizzaCount = await client.query("SELECT COUNT(*) FROM pizzas");
    if (parseInt(pizzaCount.rows[0].count) === 0) {
      // Seed pizza shops near University of Calgary
      await client.query(`
        INSERT INTO pizzas (name, address, lat, lng, rating, price_range, photo_url) VALUES
        ('University Pizza', '3623 Shaganappi Trail NW, Calgary, AB', 51.0887, -114.1345, 4.3, 1, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop'),
        ('Pizza Hut - University District', '3630 Brentwood Rd NW, Calgary, AB', 51.0923, -114.1289, 4.0, 2, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop'),
        ('Domino''s Pizza - Brentwood', '3630 Brentwood Rd NW, Calgary, AB', 51.0920, -114.1285, 3.9, 1, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop'),
        ('Boston Pizza - Crowfoot', '150 Crowfoot Cres NW, Calgary, AB', 51.1218, -114.2078, 4.2, 2, 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop'),
        ('Panago Pizza - Brentwood', '3630 Brentwood Rd NW #308, Calgary, AB', 51.0925, -114.1291, 4.1, 2, 'https://images.unsplash.com/photo-1590534047230-c8e4e9ec04e0?w=400&h=300&fit=crop'),
        ('Chicago Deep Dish Pizza Co', '3608 Brentwood Rd NW, Calgary, AB', 51.0915, -114.1280, 4.4, 2, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop'),
        ('Pizza 73 - University Heights', '3410 20 St NW, Calgary, AB', 51.0762, -114.0890, 3.8, 1, 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400&h=300&fit=crop'),
        ('Famoso Neapolitan Pizzeria - Market Mall', '3625 Shaganappi Trail NW, Calgary, AB', 51.0895, -114.1352, 4.3, 2, 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400&h=300&fit=crop'),
        ('Pulcinella - Kensington', '1147 Kensington Cres NW, Calgary, AB', 51.0525, -114.0862, 4.5, 2, 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&h=300&fit=crop'),
        ('Noble Pie Parlour', '2418 4 St NW, Calgary, AB', 51.0627, -114.0745, 4.6, 2, 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400&h=300&fit=crop'),
        ('UNA Pizza + Wine - Brentwood', '3630 Brentwood Rd NW, Calgary, AB', 51.0918, -114.1287, 4.5, 3, 'https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?w=400&h=300&fit=crop'),
        ('Village Flatbread Co', '4600 Crowchild Trail NW, Calgary, AB', 51.0835, -114.1512, 4.4, 2, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'),
        ('Red Swan Pizza - Varsity', '4607 Varsity Dr NW, Calgary, AB', 51.0898, -114.1456, 4.2, 2, 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop'),
        ('Canadian Pizza Unlimited - U of C', '3355 University Dr NW, Calgary, AB', 51.0795, -114.1275, 4.0, 1, 'https://images.unsplash.com/photo-1576458088443-04a19bb13da6?w=400&h=300&fit=crop'),
        ('Blaze Pizza - Market Mall', '3625 Shaganappi Trail NW, Calgary, AB', 51.0893, -114.1348, 4.2, 2, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop&q=80'),
        ('Spacca Napoli Pizzeria', '4322 16 Ave NW, Calgary, AB', 51.0680, -114.1145, 4.7, 3, 'https://images.unsplash.com/photo-1571407970349-bc81e7e96c47?w=400&h=300&fit=crop'),
        ('Inglewood Drive-In', '2422 Crowchild Trail NW, Calgary, AB', 51.0632, -114.1098, 4.1, 1, 'https://images.unsplash.com/photo-1598023696416-0193a0bcd302?w=400&h=300&fit=crop'),
        ('Double Zero - Market Mall', '3625 Shaganappi Trail NW, Calgary, AB', 51.0896, -114.1350, 4.4, 3, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop&q=80'),
        ('Nikos Pizza - Montgomery', '5005 16 Ave NW, Calgary, AB', 51.0682, -114.1412, 3.9, 1, 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=400&h=300&fit=crop'),
        ('Za Pizza Bistro', '3904 Edmonton Trail NE, Calgary, AB', 51.0738, -114.0515, 4.3, 2, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop'),
        ('Without Papers Pizza - Hillhurst', '1216 Kensington Rd NW, Calgary, AB', 51.0528, -114.0868, 4.6, 2, 'https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?w=400&h=300&fit=crop'),
        ('Sal''s Pizzeria', '5005 20 St NW, Calgary, AB', 51.0680, -114.0893, 4.2, 2, 'https://images.unsplash.com/photo-1571407970349-bc81e7e96c47?w=400&h=300&fit=crop&q=80'),
        ('Mountain Mike''s Pizza', '5333 Northland Dr NW, Calgary, AB', 51.0975, -114.1125, 4.1, 2, 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=400&h=300&fit=crop'),
        ('La Pizzeria Napoletana', '3702 17 Ave SW, Calgary, AB', 51.0368, -114.1035, 4.5, 2, 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400&h=300&fit=crop&q=80'),
        ('The Pie Hole Pizza', '4739 17 Ave SE, Calgary, AB', 51.0365, -113.9715, 4.3, 2, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop&q=80')
      `);
    }

    // Check if posts exist
    const postCount = await client.query("SELECT COUNT(*) FROM posts");
    if (parseInt(postCount.rows[0].count) === 0) {
      // Seed some initial posts
      await client.query(`
        INSERT INTO posts (user_id, content, photo_url, pizza_id, created_at) VALUES
        (1, 'Just picked up this beauty from Spacca Napoli! The crust is perfection 😍🍕', 'https://images.unsplash.com/photo-1598610089897-a1b0557c95d8?w=600&h=600&fit=crop', 16, NOW() - INTERVAL '2 hours'),
        (3, 'Study break = pizza break! Blaze Pizza never disappoints 📚✨', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=600&fit=crop', 15, NOW() - INTERVAL '10 hours'),
        (2, 'Date night at UNA Pizza + Wine was incredible! That truffle mushroom pizza though... 🔥', 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=600&h=600&fit=crop', 11, NOW() - INTERVAL '12 hours'),
        (4, 'Chicago deep dish hitting different on a Friday night! Who else is team thick crust? 🍕💯', 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&h=600&fit=crop', 6, NOW() - INTERVAL '15 hours'),
        (5, 'Trying Without Papers Pizza for the first time and WOW! Best margherita in Calgary? 🤔', 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&h=600&fit=crop', 21, NOW() - INTERVAL '16 hours'),
        (1, 'Late night cravings satisfied! Nothing beats a classic pepperoni 🌙🍕', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=600&fit=crop', 1, NOW() - INTERVAL '18 hours'),
        (3, 'Found this gem near campus! Noble Pie Parlour is my new favorite spot 💜', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=600&fit=crop', 10, NOW() - INTERVAL '1 day'),
        (2, 'Sunday funday with friends and pizza! Can''t go wrong with Famoso 🙌', 'https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?w=600&h=600&fit=crop', 8, NOW() - INTERVAL '1 day 6 hours'),
        (4, 'That wood-fired flavor from Pulcinella is unmatched! Fresh basil makes everything better 🌿', 'https://images.unsplash.com/photo-1590534047230-c8e4e9ec04e0?w=600&h=600&fit=crop', 9, NOW() - INTERVAL '2 days'),
        (5, 'Pizza party for the win! Thanks Village Flatbread for feeding the whole crew 🎉', 'https://images.unsplash.com/photo-1571407970349-bc81e7e96c47?w=600&h=600&fit=crop', 12, NOW() - INTERVAL '2 days 8 hours')
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
