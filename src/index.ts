import { serve } from "bun";
import index from "./index.html";
import { pool, initDatabase, calculateDistance } from "./db/setup";

// Initialize database on startup
await initDatabase();

// Helper function to check authentication
function isAuthenticated(req: Request): boolean {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.substring(7);
  // Basic token validation (checking it exists and has expected structure)
  return token.startsWith("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.");
}

const server = serve({
  routes: {
    "/*": index,

    "/api/auth/login": {
      async POST(req) {
        try {
          const body = await req.json();
          const { email, password } = body;

          const result = await pool.query(
            "SELECT * FROM users WHERE email = $1 AND password = $2",
            [email, password]
          );

          if (result.rows.length === 0) {
            return Response.json({ error: "Invalid credentials" }, { status: 401 });
          }

          const user = result.rows[0];
          const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${Buffer.from(
            JSON.stringify({ id: user.id, email: user.email })
          ).toString("base64")}.mock_signature`;

          return Response.json({
            success: true,
            token,
            user: { id: user.id, email: user.email, name: user.name },
          });
        } catch (error) {
          return Response.json({ error: "Login failed" }, { status: 400 });
        }
      },
    },

    "/api/search/pizzas": {
      async GET(req) {
        // Check authentication
        if (!isAuthenticated(req)) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        let query: string = "";
        try {
          const url = new URL(req.url);
          const q = url.searchParams.get("q") || "";
          const userLat = parseFloat(url.searchParams.get("lat") || "51.0447");
          const userLng = parseFloat(url.searchParams.get("lng") || "-114.0719");

          // Secure, parameterized search (case-insensitive). Empty query returns all.
          let result;
          if (q.trim() === "") {
            query = `SELECT * FROM pizza_info`;
            result = await pool.query(query);
          } else {
            query = `SELECT * FROM pizza_info WHERE name ILIKE '%${q}%'`;
            result = await pool.query(query);
          }

          // Map and calculate distances
          const shopsWithDistance = result.rows.map((shop) => ({
            ...shop,
            lat: parseFloat(shop.lat),
            lng: parseFloat(shop.lng),
            rating: parseFloat(shop.rating),
            distance: calculateDistance(userLat, userLng, parseFloat(shop.lat), parseFloat(shop.lng)),
            avg_happiness: shop.avg_happiness ? parseFloat(shop.avg_happiness) : null,
            avg_rizz: shop.avg_rizz ? parseFloat(shop.avg_rizz) : null,
            avg_experience: shop.avg_experience ? parseFloat(shop.avg_experience) : null,
            review_count: parseInt(shop.review_count) || 0,
          }));

          // Sort by distance (closest first)
          shopsWithDistance.sort((a, b) => a.distance - b.distance);

          return Response.json({
            success: true,
            query: query,
            results: shopsWithDistance,
          });
        } catch (error) {
          console.log(error);
          return Response.json(
            {
              error: "Search failed",
              query: query,
              sqlError: error instanceof Error ? error.message : "Unknown error",
              detail: error instanceof Error && 'detail' in error ? (error as any).detail : undefined,
            },
            { status: 500 }
          );
        }
      },
    },

    "/api/users/:id": {
      async GET(req) {
        // Check authentication
        if (!isAuthenticated(req)) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
          const userId = parseInt(req.params.id);

          // VULNERABLE: No authorization checks (Broken Access Control)
          const result = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);

          if (result.rows.length === 0) {
            return Response.json({ error: "User not found" }, { status: 404 });
          }

          const user = result.rows[0];
          return Response.json({
            success: true,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              address: user.address,
              lat: parseFloat(user.lat),
              lng: parseFloat(user.lng),
              profilePic: `/api/users/${user.id}/profile-pic`,
              favoritePizza: user.favorite_pizza,
            },
          });
        } catch (error) {
          return Response.json({ error: "Failed to fetch user" }, { status: 400 });
        }
      },

      async PUT(req) {
        // Check authentication
        if (!isAuthenticated(req)) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
          const userId = parseInt(req.params.id);
          const body = await req.json();

          // VULNERABLE: No authorization checks (Broken Access Control)
          // Anyone can update any user's data!
          const updates: string[] = [];
          const values: any[] = [];
          let paramCount = 1;

          if (body.email !== undefined) {
            updates.push(`email = $${paramCount++}`);
            values.push(body.email);
          }
          if (body.name !== undefined) {
            updates.push(`name = $${paramCount++}`);
            values.push(body.name);
          }
          if (body.address !== undefined) {
            updates.push(`address = $${paramCount++}`);
            values.push(body.address);
          }
          if (body.lat !== undefined) {
            updates.push(`lat = $${paramCount++}`);
            values.push(body.lat);
          }
          if (body.lng !== undefined) {
            updates.push(`lng = $${paramCount++}`);
            values.push(body.lng);
          }
          if (body.profile_pic_url !== undefined) {
            updates.push(`profile_pic_url = $${paramCount++}`);
            values.push(body.profile_pic_url);
          }
          if (body.favorite_pizza !== undefined) {
            updates.push(`favorite_pizza = $${paramCount++}`);
            values.push(body.favorite_pizza);
          }

          if (updates.length === 0) {
            return Response.json({ error: "No fields to update" }, { status: 400 });
          }

          values.push(userId);
          const query = `UPDATE users SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`;

          const result = await pool.query(query, values);

          if (result.rows.length === 0) {
            return Response.json({ error: "User not found" }, { status: 404 });
          }

          const user = result.rows[0];
          return Response.json({
            success: true,
            message: "User updated successfully",
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              address: user.address,
              lat: parseFloat(user.lat),
              lng: parseFloat(user.lng),
              profilePic: `/api/users/${user.id}/profile-pic`,
              favoritePizza: user.favorite_pizza,
            },
          });
        } catch (error) {
          return Response.json({ error: "Update failed" }, { status: 400 });
        }
      },
    },

    "/api/users/:id/profile-pic": {
      async GET(req) {
        try {
          const userId = parseInt(req.params.id);

          const result = await pool.query(
            "SELECT profile_pic_data FROM users WHERE id = $1",
            [userId]
          );

          if (result.rows.length === 0 || !result.rows[0].profile_pic_data) {
            return Response.json({ error: "Profile picture not found" }, { status: 404 });
          }

          const imageBuffer = result.rows[0].profile_pic_data;
          
          // Return image with appropriate content type
          return new Response(imageBuffer, {
            headers: {
              "Content-Type": "image/jpeg",
              "Cache-Control": "public, max-age=3600",
            },
          });
        } catch (error) {
          return Response.json({ error: "Failed to fetch profile picture" }, { status: 400 });
        }
      },

      async PUT(req) {
        // Check authentication
        if (!isAuthenticated(req)) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
          const userId = parseInt(req.params.id);
          
          // Get the raw body as array buffer
          const arrayBuffer = await req.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          // VULNERABLE: No authorization checks (Broken Access Control)
          // Anyone can update any user's profile picture!
          const result = await pool.query(
            "UPDATE users SET profile_pic_data = $1 WHERE id = $2 RETURNING id",
            [buffer, userId]
          );

          if (result.rows.length === 0) {
            return Response.json({ error: "User not found" }, { status: 404 });
          }

          return Response.json({
            success: true,
            message: "Profile picture updated successfully",
            profilePic: `/api/users/${userId}/profile-pic`,
          });
        } catch (error) {
          console.error("Profile picture upload error:", error);
          return Response.json({ error: "Upload failed" }, { status: 400 });
        }
      },
    },

    "/api/posts": {
      async GET(req) {
        // Check authentication
        if (!isAuthenticated(req)) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
          const result = await pool.query(`
            SELECT 
              posts.id,
              posts.user_id,
              posts.content,
              posts.photo_url,
              posts.pizza_id,
              posts.happiness_rating,
              posts.rizz_rating,
              posts.experience_rating,
              posts.created_at,
              users.name as author_name,
              users.profile_pic_url as author_pic
              , pizzas.name as pizza_name,
              pizzas.lat as pizza_lat,
              pizzas.lng as pizza_lng
            FROM posts
            LEFT JOIN users ON posts.user_id = users.id
            LEFT JOIN pizzas ON posts.pizza_id = pizzas.id
            ORDER BY posts.created_at DESC
          `);

          return Response.json({
            success: true,
            posts: result.rows.map((row) => ({
              id: row.id,
              userId: row.user_id,
              content: row.content,
              photo_url: row.photo_url,
              createdAt: row.created_at,
              ratings: {
                happiness: row.happiness_rating,
                rizz: row.rizz_rating,
                experience: row.experience_rating,
              },
              pizza: row.pizza_id ? {
                id: row.pizza_id,
                name: row.pizza_name,
                lat: row.pizza_lat ? parseFloat(row.pizza_lat) : undefined,
                lng: row.pizza_lng ? parseFloat(row.pizza_lng) : undefined,
              } : undefined,
              author: {
                id: row.user_id,
                name: row.author_name,
                profile_pic_url: row.user_id ? `/api/users/${row.user_id}/profile-pic` : null,
              },
            })),
          });
        } catch (error) {
          return Response.json({ error: "Failed to fetch posts" }, { status: 400 });
        }
      },

      async POST(req) {
        // Check authentication
        if (!isAuthenticated(req)) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
          const body = await req.json();
          const { userId, content, pizzaId, happinessRating, rizzRating, experienceRating } = body;

          // VULNERABLE: No validation of user ownership
          // Anyone can post as any user!
          const result = await pool.query(
            `INSERT INTO posts (user_id, content, pizza_id, happiness_rating, rizz_rating, experience_rating)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [userId, content, pizzaId || null, happinessRating || null, rizzRating || null, experienceRating || null]
          );

          const post = result.rows[0];
          const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
          const user = userResult.rows[0];
          let pizzaMeta: any = undefined;
          if (post.pizza_id) {
            const pizzaRes = await pool.query("SELECT id, name, lat, lng FROM pizzas WHERE id = $1", [post.pizza_id]);
            if (pizzaRes.rows.length > 0) {
              const p = pizzaRes.rows[0];
              pizzaMeta = { id: p.id, name: p.name, lat: p.lat ? parseFloat(p.lat) : undefined, lng: p.lng ? parseFloat(p.lng) : undefined };
            }
          }

          return Response.json({
            success: true,
            message: "Post created successfully",
            post: {
              id: post.id,
              userId: post.user_id,
              content: post.content,
              createdAt: post.created_at,
              ratings: {
                happiness: post.happiness_rating,
                rizz: post.rizz_rating,
                experience: post.experience_rating,
              },
              pizza: pizzaMeta,
              author: user ? {
                id: user.id,
                name: user.name,
                profile_pic_url: `/api/users/${user.id}/profile-pic`,
              } : undefined,
            },
          });
        } catch (error) {
          console.log(error);
          return Response.json({ error: "Post creation failed" }, { status: 400 });
        }
      },
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
