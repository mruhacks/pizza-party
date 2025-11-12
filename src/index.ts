import { serve } from "bun";
import index from "./index.html";

// Mock data
const users = [
  {
    id: 1,
    email: "alice@example.com",
    password: "password123",
    name: "Alice Johnson",
    address: "123 Main St, Calgary, AB",
    lat: 51.1304,
    lng: -114.1267,
    profile_pic_url: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: 2,
    email: "bob@example.com",
    password: "password456",
    name: "Bob Smith",
    address: "456 Elm St, Calgary, AB",
    lat: 51.1542,
    lng: -114.1234,
    profile_pic_url: "https://i.pravatar.cc/150?img=2",
  },
  {
    id: 3,
    email: "charlie@example.com",
    password: "password789",
    name: "Charlie Brown",
    address: "789 Oak Ave, Calgary, AB",
    lat: 51.1105,
    lng: -114.1599,
    profile_pic_url: "https://i.pravatar.cc/150?img=3",
  },
];

const pizzaShops = [
  {
    id: 1,
    name: "Vendome Cafe",
    lat: 51.1304,
    lng: -114.1267,
    address: "10105 104 St NW, Edmonton, AB",
  },
  {
    id: 2,
    name: "Pizzerias Defatti",
    lat: 51.1542,
    lng: -114.1234,
    address: "517 2 Ave SW, Calgary, AB",
  },
  {
    id: 3,
    name: "Paparazzi's Pizzeria",
    lat: 51.1105,
    lng: -114.1599,
    address: "207 Stephen Ave SW, Calgary, AB",
  },
  {
    id: 4,
    name: "Gravity Espresso Bar",
    lat: 51.1200,
    lng: -114.1400,
    address: "Multiple Locations, Calgary, AB",
  },
  {
    id: 5,
    name: "Forno Pizzeria",
    lat: 51.1450,
    lng: -114.1100,
    address: "3rd Ave SW, Calgary, AB",
  },
];

const posts: any[] = [];

// Helper to calculate distance (Haversine formula)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Vulnerable SQL query builder (string concatenation)
function buildSearchQuery(searchTerm: string): string {
  return `SELECT * FROM pizzas WHERE name LIKE '%${searchTerm}%' OR address LIKE '%${searchTerm}%'`;
}

// Mock SQL execution with vulnerability
function executeMockQuery(query: string): any[] {
  // Simulate SQL error if query is malformed
  if (query.includes("';") || query.includes("--") || query.includes("/*")) {
    throw new Error(`SQL Error: ${query}`);
  }
  
  const searchTerm = query.match(/%([^%]*)%/)?.[1] || "";
  return pizzaShops.filter(
    (shop) => shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.address.toLowerCase().includes(searchTerm.toLowerCase())
  );
}

const server = serve({
  routes: {
    "/*": index,

    "/api/auth/login": {
      async POST(req) {
        try {
          const body = await req.json();
          const { email, password } = body;

          const user = users.find((u) => u.email === email && u.password === password);
          if (!user) {
            return Response.json({ error: "Invalid credentials" }, { status: 401 });
          }

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
        try {
          const url = new URL(req.url);
          const q = url.searchParams.get("q") || "";
          
          // VULNERABLE: String concatenation (SQL injection)
          const query = buildSearchQuery(q);
          const results = executeMockQuery(query);

          return Response.json({
            success: true,
            query: query,
            results: results.map((shop) => ({
              ...shop,
              distance: calculateDistance(51.1304, -114.1267, shop.lat, shop.lng),
            })),
          });
        } catch (error) {
          return Response.json(
            {
              error: "Search failed",
              sqlError: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
          );
        }
      },
    },

    "/api/users/:id": {
      async GET(req) {
        const userId = parseInt(req.params.id);
        const user = users.find((u) => u.id === userId);

        if (!user) {
          return Response.json({ error: "User not found" }, { status: 404 });
        }

        // VULNERABLE: No authorization checks (BAC)
        return Response.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            address: user.address,
            lat: user.lat,
            lng: user.lng,
            profile_pic_url: user.profile_pic_url,
          },
        });
      },

      async PUT(req) {
        try {
          const userId = parseInt(req.params.id);
          const body = await req.json();
          const user = users.find((u) => u.id === userId);

          if (!user) {
            return Response.json({ error: "User not found" }, { status: 404 });
          }

          // VULNERABLE: No authorization checks (BAC) - anyone can update any user
          if (body.email) user.email = body.email;
          if (body.name) user.name = body.name;
          if (body.address) user.address = body.address;
          if (body.lat) user.lat = body.lat;
          if (body.lng) user.lng = body.lng;
          if (body.profile_pic_url) user.profile_pic_url = body.profile_pic_url;

          return Response.json({
            success: true,
            message: "User updated successfully",
            user,
          });
        } catch (error) {
          return Response.json({ error: "Update failed" }, { status: 400 });
        }
      },
    },

    "/api/posts": {
      async GET(req) {
        try {
          return Response.json({
            success: true,
            posts: posts,
          });
        } catch (error) {
          return Response.json({ error: "Failed to fetch posts" }, { status: 400 });
        }
      },

      async POST(req) {
        try {
          const body = await req.json();
          const { userId, content } = body;

          // VULNERABLE: No validation of user ownership
          const post = {
            id: posts.length + 1,
            userId,
            content,
            createdAt: new Date().toISOString(),
          };

          posts.push(post);

          return Response.json({
            success: true,
            message: "Post created successfully",
            post,
          });
        } catch (error) {
          return Response.json({ error: "Post creation failed" }, { status: 400 });
        }
      },
    },

    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world! Awesome",
          method: "GET",
        });
      },
      async PUT(req) {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        });
      },
    },

    "/api/hello/:name": async (req) => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
