# Pizza Party Security Workshop - Implementation Summary

## ✅ Completed

### 1. Backend API (src/index.ts)
- ✅ Authentication endpoint: `POST /api/auth/login`
- ✅ Pizza search endpoint: `GET /api/search/pizzas` **[SQL INJECTION VULNERABLE]**
  - Uses string concatenation to build SQL queries
  - Shows SQL error messages with full query
  - Mock database of 5 pizza shops around U of C
- ✅ User profile endpoints: `GET /api/users/:id`, `PUT /api/users/:id` **[BAC VULNERABLE]**
  - No authorization checks - any user can view/edit any profile
  - Returns private user data without verification
- ✅ Post creation endpoint: `POST /api/posts` **[BAC VULNERABLE]**
  - No validation of user ownership
  - Can post as any user by changing userId in request body
- ✅ Post retrieval endpoint: `GET /api/posts`

### 2. Frontend Pages
- ✅ **LoginPage** (`src/pages/LoginPage.tsx`)
  - Modern glassmorphism UI with gradients
  - Pre-filled demo credentials (alice@example.com / password123)
  - Integrated with actual API endpoint
  
- ✅ **SearchPage** (`src/pages/SearchPage.tsx`)
  - Geolocation support (falls back to U of C coordinates)
  - Live pizza shop search with SQL injection demo
  - Shows SQL error messages when injection is attempted
  - Search hint shows example SQL injection payload: `' OR 1=1;--`
  - Displays pizza shops with distance calculations
  
- ✅ **ProfilePage** (`src/pages/ProfilePage.tsx`)
  - User ID selector to demonstrate BAC vulnerability
  - Can view/edit any user's profile
  - Vulnerability demo box explains how to exploit
  - Shows user IDs 1-3 for easy switching
  
- ✅ **FeedPage** (`src/pages/FeedPage.tsx`)
  - Post composition with user impersonation demo
  - User ID selector to post as different users
  - Shows vulnerability in action
  - Modern card-based design
  
- ✅ **AppLayout** (`src/pages/AppLayout.tsx`)
  - Responsive navigation with mobile menu
  - Glassmorphic design with blur effects
  - Routes to Search, Feed, and Profile pages

### 3. Styling & Design
- ✅ Modern, hip aesthetic with:
  - Glassmorphism (backdrop blur, semi-transparent cards)
  - Gradient accents (purple/pink color scheme)
  - Smooth animations and transitions
  - Dark mode with high contrast text
  - Responsive layout (mobile, tablet, desktop)
  - Professional component design

### 4. Mock Data
- ✅ 3 test users (Alice, Bob, Charlie) with:
  - Email/password credentials
  - Unique IDs for URL-based BAC demos
  - Avatar images
  - Geographic coordinates near U of C
  
- ✅ 5 pizza shops with:
  - Real names and addresses around Calgary
  - Latitude/longitude coordinates
  - Distance calculation from user location

### 5. Documentation
- ✅ **EXPLOIT_GUIDE.md** (comprehensive presenter guide)
  - Step-by-step SQL injection demos
  - Broken Access Control attack scenarios
  - Vulnerable components guidance
  - Teaching points and discussion questions
  - Curl commands for API-level testing
  - Real-world impact explanation
  
- ✅ **README_WORKSHOP.md** (quick reference guide)
  - Quick start instructions
  - Demo credentials table
  - Vulnerability summaries
  - Architecture overview
  - Browser DevTools tips
  - Troubleshooting guide

---

## 🎯 Vulnerability Demonstrations

### SQL Injection (Search Page)
**How to exploit:**
1. Login with any credential
2. Go to Search page
3. Enter: `'` → See SQL error
4. Enter: `' OR '1'='1` → Bypass filter, get all results

**Teaching value:**
- Shows real SQL error messages (information disclosure)
- Demonstrates how injection modifies query logic
- Shows need for parameterized queries

### Broken Access Control - Profile Viewing
**How to exploit:**
1. Login as Alice (User 1)
2. Go to Profile page
3. Change User ID input to 2 → See Bob's full profile
4. Change to 3 → See Charlie's profile

**Teaching value:**
- No authorization verification
- Private data exposed
- User can access any account information

### Broken Access Control - Profile Editing
**How to exploit:**
1. Login as Alice
2. Go to Profile page, set User ID to 2
3. Click "Edit Profile"
4. Modify Bob's name, email, address
5. Save → Changes persist

**Teaching value:**
- Any authenticated user can modify any account
- No ownership validation
- Persistent unauthorized changes

### Broken Access Control - Impersonating Users (Posts)
**How to exploit:**
1. Login as Alice
2. Go to Feed page
3. Note the User ID selector (set to 1)
4. Change to User ID 2 (Bob)
5. Write a post and submit
6. Post appears as if Bob created it

**Teaching value:**
- No validation of user ownership
- Can impersonate other users
- Trust in client-supplied user ID

---

## 🛠️ Tech Stack

**Frontend:**
- React 19 with TypeScript
- React Router v7 for navigation
- Tailwind CSS 4.1 for styling
- shadcn/ui for components
- Lucide React for icons

**Backend:**
- Bun runtime
- Single-file server (src/index.ts)
- In-memory mock data
- Intentionally vulnerable query builders

**Tooling:**
- Bun for build, dev, and package management
- TypeScript for type safety
- Tailwind CSS for modern styling

---

## 📋 Features Implemented

| Feature | Status | Notes |
|---------|--------|-------|
| User Authentication | ✅ | Mock auth with hardcoded users |
| Geolocation Support | ✅ | Falls back to U of C campus |
| Pizza Search | ✅ | With SQL injection vulnerability |
| Profile Viewing | ✅ | BAC allows viewing any user |
| Profile Editing | ✅ | BAC allows editing any user |
| Social Feed | ✅ | BAC allows posting as any user |
| Modern UI/UX | ✅ | Glassmorphism, gradients, animations |
| Exploit Hints | ✅ | Hints shown in UI for demos |
| Documentation | ✅ | Comprehensive guides included |

---

## 🚀 Running the App

```bash
# Start development server
bun --hot src/index.ts

# Visit in browser
http://localhost:3000
```

## 📊 Expected Workshop Flow

1. **Introduction (5 min)**
   - Show app, explain it's intentionally vulnerable
   - Distribute credentials

2. **SQL Injection Demo (10 min)**
   - Live search demonstration
   - Show error messages
   - Explain parameterized queries

3. **Broken Access Control Demo (15 min)**
   - View other user profiles
   - Edit other user data
   - Post as different users
   - Show Network tab requests

4. **Vulnerable Components (5 min)**
   - Discuss dependency vulnerabilities
   - Show npm audit output (optional)

5. **Discussion & Q&A (15 min)**
   - Real-world examples
   - How to prevent these issues
   - Security best practices

---

## 🔒 Security Reminders

- **DO NOT** deploy this app to production
- **DO NOT** use with real user data
- **DO NOT** expose to untrusted networks
- **ONLY** use in controlled classroom environments
- **ALWAYS** teach students the proper secure alternatives

---

## 📝 Notes for Instructor

- App runs on `http://localhost:3000`
- No database setup required (in-memory mock data)
- All data resets on server restart
- Browser DevTools (F12) can inspect API calls and requests
- Chrome DevTools Network tab useful for showing BAC exploits
- Can pause/restart server for fresh demos

---

**Ready for your security workshop!** 🍕🔒
