import { PROFILE_PIC_URL } from "@/config/general";
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
        profile_pic_data BYTEA,
        favorite_pizza VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Migration: Add profile_pic_data column if it doesn't exist
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_pic_data BYTEA;
    `);

    // Migration: Add favorite_pizza column if it doesn't exist
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS favorite_pizza VARCHAR(255);
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
        happiness_rating INTEGER CHECK (happiness_rating BETWEEN 1 AND 5),
        rizz_rating INTEGER CHECK (rizz_rating BETWEEN 1 AND 5),
        experience_rating INTEGER CHECK (experience_rating BETWEEN 1 AND 5),
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

    // Migrations: Add rating columns if not exist
    await client.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS happiness_rating INTEGER CHECK (happiness_rating BETWEEN 1 AND 5);`);
    await client.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS rizz_rating INTEGER CHECK (rizz_rating BETWEEN 1 AND 5);`);
    await client.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS experience_rating INTEGER CHECK (experience_rating BETWEEN 1 AND 5);`);

    // Create or replace the pizza info view
    await client.query(`
      CREATE OR REPLACE VIEW pizza_info AS
      SELECT 
        p.*,
        ROUND(AVG(posts.happiness_rating)::numeric, 1) AS avg_happiness,
        ROUND(AVG(posts.rizz_rating)::numeric, 1) AS avg_rizz,
        ROUND(AVG(posts.experience_rating)::numeric, 1) AS avg_experience,
        COUNT(*) FILTER (WHERE posts.happiness_rating IS NOT NULL OR posts.rizz_rating IS NOT NULL OR posts.experience_rating IS NOT NULL) AS review_count
      FROM pizzas p
      LEFT JOIN posts ON posts.pizza_id = p.id
      GROUP BY p.id, p.name, p.address, p.lat, p.lng, p.rating, p.price_range, p.photo_url, p.created_at
    `);

    // Create the trigger function for updating through the view
    await client.query(`
      CREATE OR REPLACE FUNCTION update_pizza_info()
      RETURNS TRIGGER AS $$
      BEGIN
        UPDATE pizzas
        SET
          name = NEW.name,
          address = NEW.address,
          lat = NEW.lat,
          lng = NEW.lng,
          rating = NEW.rating,
          price_range = NEW.price_range,
          photo_url = NEW.photo_url
        WHERE id = NEW.id;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create the instead of update trigger
    await client.query(`
      DROP TRIGGER IF EXISTS pizza_info_update ON pizza_info;
      CREATE TRIGGER pizza_info_update
      INSTEAD OF UPDATE ON pizza_info
      FOR EACH ROW
      EXECUTE FUNCTION update_pizza_info();
    `);

    // Check if users exist
    const userCount = await client.query("SELECT COUNT(*) FROM users");
    if (parseInt(userCount.rows[0].count) === 0) {
      // Set the sequence to start at 1624
      await client.query(`ALTER SEQUENCE users_id_seq START WITH 1624 RESTART;`);
      
      // Download profile pictures and store as binary
      const users = [
        { email: 'andrewl19488@yahoo.com', password: 'password123', name: 'Andrew L', address: '2845 University Dr NW, Calgary, AB', lat: 51.0825, lng: -114.1290, picUrl: PROFILE_PIC_URL, favPizza: 'Truffle Mushroom with Extra Cheese' },
        { email: 'iluvfootball599@gmail.com', password: 'password456', name: 'Marcus Reid', address: '3424 Crowchild Trail NW, Calgary, AB', lat: 51.0715, lng: -114.1385, picUrl: 'https://i.pravatar.cc/150?img=33', favPizza: 'Meat Lovers Supreme' },
        { email: 'emily.park@example.com', password: 'password789', name: 'Emily Park', address: '4515 Varsity Dr NW, Calgary, AB', lat: 51.0892, lng: -114.1425, picUrl: 'https://i.pravatar.cc/150?img=29', favPizza: 'Margherita with Fresh Basil' },
        { email: 'david.kumar@example.com', password: 'password101', name: 'David Kumar', address: '3630 Brentwood Rd NW, Calgary, AB', lat: 51.0920, lng: -114.1288, picUrl: 'https://i.pravatar.cc/150?img=68', favPizza: 'Spicy Pepperoni & Jalapeño' },
        { email: 'jessica.taylor@example.com', password: 'password202', name: 'Jessica Taylor', address: '2418 4 St NW, Calgary, AB', lat: 51.0627, lng: -114.0745, picUrl: 'https://i.pravatar.cc/150?img=20', favPizza: 'Hawaiian (fight me!)' }
      ];

      for (const user of users) {
        try {
          // Download the image
          const response = await fetch(user.picUrl);
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          // Insert user with binary data
          await client.query(
            `INSERT INTO users (email, password, name, address, lat, lng, profile_pic_url, profile_pic_data, favorite_pizza) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [user.email, user.password, user.name, user.address, user.lat, user.lng, user.picUrl, buffer, user.favPizza]
          );
          console.log(`✅ Downloaded and stored profile picture for ${user.name}`);
        } catch (error) {
          console.error(`❌ Failed to download profile picture for ${user.name}:`, error);
          // Insert without image data if download fails
          await client.query(
            `INSERT INTO users (email, password, name, address, lat, lng, profile_pic_url, favorite_pizza) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [user.email, user.password, user.name, user.address, user.lat, user.lng, user.picUrl, user.favPizza]
          );
        }
      }
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
      // Seed posts with varied ratings across different shops
      // Top tier shops (Spacca Napoli #16, Noble Pie #10, Pulcinella #9, UNA Pizza #11, Without Papers #21)
      // Mid tier shops (Blaze #15, Famoso #8, Chicago Deep Dish #6, Village Flatbread #12)
      // Lower tier shops (University Pizza #1, Pizza 73 #7, Domino's #3)
      await client.query(`
        INSERT INTO posts (user_id, content, photo_url, pizza_id, happiness_rating, rizz_rating, experience_rating, created_at) VALUES
        -- Spacca Napoli (Top Tier - Amazing taste, great vibe, good service - 8 reviews)
        (1624, 'Just picked up this beauty from Spacca Napoli! The crust is perfection 😍🍕', 'https://images.unsplash.com/photo-1673993386955-45fc437f5de9?w=600&h=600&fit=crop', 16, 5, 5, 4, NOW() - INTERVAL '10 hours'),
        (1626, 'Spacca Napoli is my weekly go-to. Never disappoints!', NULL, 16, 5, 4, 3, NOW() - INTERVAL '3 days'),
        (1625, 'The Neapolitan style at Spacca is authentic and amazing', NULL, 16, 5, 5, 4, NOW() - INTERVAL '5 days'),
        (1627, 'Best pizza in Calgary hands down. Spacca Napoli 🔥', 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600&h=600&fit=crop', 16, 5, 5, 3, NOW() - INTERVAL '1 week'),
        (1628, 'Had a pizza party catered by Spacca - everyone loved it!', NULL, 16, 5, 4, 4, NOW() - INTERVAL '10 days'),
        (1624, 'Wood fired perfection. Their margherita is unreal', NULL, 16, 5, 5, 3, NOW() - INTERVAL '2 weeks'),
        (1626, 'Spacca Napoli never misses. The atmosphere is great too', NULL, 16, 4, 5, 4, NOW() - INTERVAL '3 weeks'),
        (1625, 'Got the quattro formaggi - incredible cheese blend!', 'https://images.unsplash.com/photo-1571407970349-bc81e7e96c47?w=600&h=600&fit=crop', 16, 5, 4, 3, NOW() - INTERVAL '1 month'),
        
        -- Noble Pie Parlour (Top Tier - Great taste, amazing atmosphere/date spot, excellent service - 7 reviews)
        (1626, 'Found this gem near campus! Noble Pie Parlour is my new favorite spot 💜', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=600&fit=crop', 10, 4, 5, 5, NOW() - INTERVAL '1 day'),
        (1624, 'Noble Pie has the best crust in the city', NULL, 10, 5, 5, 5, NOW() - INTERVAL '4 days'),
        (1627, 'Love the creative toppings at Noble Pie!', NULL, 10, 4, 5, 5, NOW() - INTERVAL '6 days'),
        (1628, 'Their seasonal pizzas are always incredible', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=600&fit=crop', 10, 5, 5, 4, NOW() - INTERVAL '9 days'),
        (1625, 'Noble Pie never disappoints. Great vibes too', NULL, 10, 4, 5, 5, NOW() - INTERVAL '2 weeks'),
        (1626, 'The honey drizzle on their pizza is chef''s kiss', NULL, 10, 5, 5, 4, NOW() - INTERVAL '3 weeks'),
        (1624, 'Perfect date night spot. Amazing pizza and wine selection', NULL, 10, 4, 5, 5, NOW() - INTERVAL '1 month'),
        
        -- Pulcinella (Top Tier - Exceptional taste, cozy vibe, decent service - 6 reviews)
        (1627, 'That wood-fired flavor from Pulcinella is unmatched! Fresh basil makes everything better 🌿', 'https://images.unsplash.com/photo-1590534047230-c8e4e9ec04e0?w=600&h=600&fit=crop', 9, 5, 4, 3, NOW() - INTERVAL '2 days'),
        (1625, 'Pulcinella has the most authentic Italian pizza', NULL, 9, 5, 4, 4, NOW() - INTERVAL '5 days'),
        (1628, 'Their prosciutto e rucola is incredible', 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&h=600&fit=crop', 9, 5, 4, 3, NOW() - INTERVAL '8 days'),
        (1624, 'Love the cozy atmosphere at Pulcinella', NULL, 9, 4, 5, 4, NOW() - INTERVAL '12 days'),
        (1626, 'Best pizza in Kensington. Period.', NULL, 9, 5, 4, 3, NOW() - INTERVAL '2 weeks'),
        (1627, 'Their tiramisu is also amazing btw', NULL, 9, 5, 5, 4, NOW() - INTERVAL '3 weeks'),
        
        -- UNA Pizza + Wine (Top Tier - Excellent taste, premium atmosphere, outstanding service - 6 reviews)
        (1625, 'Date night at UNA Pizza + Wine was incredible! That truffle mushroom pizza though... 🔥', 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=600&h=600&fit=crop', 11, 5, 5, 5, NOW() - INTERVAL '1 hour'),
        (1628, 'UNA is upscale but so worth it. Amazing quality', NULL, 11, 4, 5, 5, NOW() - INTERVAL '4 days'),
        (1624, 'Their wine pairing is perfect. And the pizza? *chef''s kiss*', NULL, 11, 4, 5, 5, NOW() - INTERVAL '7 days'),
        (1626, 'UNA Pizza has the best truffle pizza in Calgary', 'https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?w=600&h=600&fit=crop', 11, 5, 5, 4, NOW() - INTERVAL '11 days'),
        (1627, 'Classy spot, incredible flavors. A bit pricey but worth it', NULL, 11, 4, 5, 5, NOW() - INTERVAL '2 weeks'),
        (1625, 'Their burrata appetizer + pizza combo is perfect', NULL, 11, 5, 5, 5, NOW() - INTERVAL '3 weeks'),
        
        -- Without Papers Pizza (Top Tier - Outstanding taste, simple/minimalist vibe, basic service - 5 reviews)
        (1628, 'Trying Without Papers Pizza for the first time and WOW! Best margherita in Calgary? 🤔', 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&h=600&fit=crop', 21, 5, 3, 3, NOW() - INTERVAL '16 hours'),
        (1624, 'Without Papers lives up to the hype. That crust!', NULL, 21, 5, 3, 4, NOW() - INTERVAL '5 days'),
        (1626, 'Simple menu but everything is executed perfectly', NULL, 21, 5, 3, 3, NOW() - INTERVAL '9 days'),
        (1627, 'Their marinara is so good it doesn''t even need cheese', NULL, 21, 5, 2, 3, NOW() - INTERVAL '2 weeks'),
        (1625, 'Hillhurst''s best kept secret. Don''t sleep on this place', NULL, 21, 5, 3, 4, NOW() - INTERVAL '3 weeks'),
        
        -- Blaze Pizza (Mid Tier - Decent taste, fun build-your-own vibe, fast service - 5 reviews)
        (1626, 'Study break = pizza break! Blaze Pizza never disappoints 📚✨', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=600&fit=crop', 15, 3, 4, 5, NOW() - INTERVAL '2 hours'),
        (1625, 'Blaze is great when you want to customize everything', NULL, 15, 3, 4, 4, NOW() - INTERVAL '3 days'),
        (1628, 'Fast, affordable, and tasty. Perfect for lunch', NULL, 15, 3, 3, 5, NOW() - INTERVAL '6 days'),
        (1624, 'Love that you can build your own at Blaze', NULL, 15, 3, 4, 4, NOW() - INTERVAL '10 days'),
        (1627, 'Decent pizza for the price. Nothing mind-blowing', NULL, 15, 3, 3, 4, NOW() - INTERVAL '2 weeks'),
        
        -- Famoso (Mid Tier - Good taste, casual group vibe, average service - 5 reviews)
        (1625, 'Sunday funday with friends and pizza! Can''t go wrong with Famoso 🙌', 'https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?w=600&h=600&fit=crop', 8, 4, 4, 3, NOW() - INTERVAL '1 day 6 hours'),
        (1627, 'Famoso is consistently good. Their pepperoni is solid', NULL, 8, 4, 3, 3, NOW() - INTERVAL '5 days'),
        (1624, 'Good for groups. Reliable quality', NULL, 8, 4, 4, 3, NOW() - INTERVAL '8 days'),
        (1626, 'Famoso hits the spot when you need something quick', NULL, 8, 3, 3, 4, NOW() - INTERVAL '12 days'),
        (1628, 'Their gluten-free options are pretty good', NULL, 8, 4, 3, 3, NOW() - INTERVAL '2 weeks'),
        
        -- Chicago Deep Dish Pizza Co (Mid Tier - Hearty/filling, casual vibe, okay service - 4 reviews)
        (1627, 'Chicago deep dish hitting different on a Friday night! Who else is team thick crust? 🍕💯', 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&h=600&fit=crop', 6, 4, 3, 3, NOW() - INTERVAL '15 hours'),
        (1625, 'If you like deep dish, this is your spot', NULL, 6, 4, 2, 3, NOW() - INTERVAL '4 days'),
        (1624, 'Heavy but delicious. Come hungry!', NULL, 6, 4, 3, 2, NOW() - INTERVAL '8 days'),
        (1628, 'Not traditional but satisfying in its own way', NULL, 6, 3, 3, 3, NOW() - INTERVAL '2 weeks'),
        
        -- Village Flatbread (Mid Tier - Tasty/unique, fun party vibe, good service - 4 reviews)
        (1628, 'Pizza party for the win! Thanks Village Flatbread for feeding the whole crew 🎉', 'https://images.unsplash.com/photo-1571407970349-bc81e7e96c47?w=600&h=600&fit=crop', 12, 3, 5, 4, NOW() - INTERVAL '2 days 8 hours'),
        (1626, 'Village Flatbread is great for casual dining', NULL, 12, 3, 4, 4, NOW() - INTERVAL '6 days'),
        (1624, 'Their flatbreads are unique and tasty', NULL, 12, 4, 4, 3, NOW() - INTERVAL '10 days'),
        (1627, 'Good spot for families. Nice variety', NULL, 12, 3, 5, 4, NOW() - INTERVAL '2 weeks'),
        
        -- University Pizza (Lower Tier - Meh taste, no vibe, convenient late night - 4 reviews)
        (1624, 'Late night cravings satisfied! Nothing beats a classic pepperoni 🌙🍕', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=600&fit=crop', 1, 2, 2, 4, NOW() - INTERVAL '18 hours'),
        (1626, 'University Pizza is cheap and open late. That''s about it', NULL, 1, 2, 1, 4, NOW() - INTERVAL '4 days'),
        (1625, 'It''s fine for a late night student meal', NULL, 1, 2, 2, 3, NOW() - INTERVAL '7 days'),
        (1628, 'Not great but gets the job done when you''re desperate', NULL, 1, 2, 1, 3, NOW() - INTERVAL '2 weeks'),
        
        -- Pizza 73 (Lower Tier - Below average taste, no ambiance, fast delivery - 3 reviews)
        (1627, 'Pizza 73 delivered fast but quality is meh', NULL, 7, 2, 1, 4, NOW() - INTERVAL '3 days'),
        (1624, 'Convenient delivery option but wouldn''t be my first choice', NULL, 7, 2, 2, 4, NOW() - INTERVAL '8 days'),
        (1625, 'It''s pizza. It exists. That''s all I can say', NULL, 7, 2, 1, 3, NOW() - INTERVAL '2 weeks'),
        
        -- Domino''s (Lower Tier - Mediocre taste, corporate vibe, consistent/reliable - 3 reviews)
        (1626, 'Domino''s for when you just need something quick and cheap', NULL, 3, 2, 2, 3, NOW() - INTERVAL '5 days'),
        (1628, 'Expected Domino''s quality. Got exactly that', NULL, 3, 2, 1, 4, NOW() - INTERVAL '9 days'),
        (1624, 'Does the job but nothing special', NULL, 3, 2, 2, 3, NOW() - INTERVAL '2 weeks'),
        
        -- Additional reviews for variety across other shops
        -- Boston Pizza (Mid Tier - Okay taste, sports bar vibe, good for groups)
        (1625, 'Boston Pizza is reliable for game nights', NULL, 4, 3, 4, 4, NOW() - INTERVAL '6 days'),
        -- Panago (Mid Tier - Decent taste, no atmosphere, good deals)
        (1627, 'Panago has good deals on Tuesdays', NULL, 5, 3, 2, 4, NOW() - INTERVAL '7 days'),
        -- Red Swan (Mid-Upper - Good specialty pizzas, hip vibe, decent service)
        (1624, 'Red Swan has interesting specialty pizzas', NULL, 13, 4, 4, 3, NOW() - INTERVAL '9 days'),
        -- Canadian Pizza Unlimited (Lower-Mid - Basic taste, student vibe, cheap/fast)
        (1626, 'Canadian Pizza Unlimited - decent campus option', NULL, 14, 2, 3, 4, NOW() - INTERVAL '11 days'),
        -- Double Zero (Upper-Mid - Tasty Italian style, trendy spot, excellent service)
        (1628, 'Double Zero has amazing Italian-style pizza', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=600&fit=crop', 18, 4, 5, 5, NOW() - INTERVAL '13 days'),
        -- Nikos Pizza (Mid - Solid neighborhood pizza, local vibe, friendly)
        (1625, 'Nikos Pizza is a solid neighborhood spot', NULL, 19, 3, 3, 3, NOW() - INTERVAL '15 days')
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
