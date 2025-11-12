# Pizza Party - Security Workshop App

A deliberately vulnerable social app demonstrating SQL Injection, Broken Access Control, and Vulnerable Components exploits for educational purposes.

## Quick Start

### Prerequisites
- Node.js/Bun runtime installed
- Modern web browser (Chrome recommended for DevTools)

### Running the App

```bash
# Install dependencies (if needed)
bun install

# Start the development server
bun --hot src/index.ts
```

The app will start at **http://localhost:3000/**

## Demo Credentials

Three test users are available:

| Email | Password | User ID |
|-------|----------|---------|
| alice@example.com | password123 | 1 |
| bob@example.com | password456 | 2 |
| charlie@example.com | password789 | 3 |

## Pizza Shops (Around U of C)

The app includes 5 mock pizza shops:

1. **Vendome Cafe** - 10105 104 St NW
2. **Pizzerias Defatti** - 517 2 Ave SW
3. **Paparazzi's Pizzeria** - 207 Stephen Ave SW
4. **Gravity Espresso Bar** - Multiple Locations
5. **Forno Pizzeria** - 3rd Ave SW

## Vulnerability Demonstrations

### 1. SQL Injection (Search Page)
- **Endpoint:** `/api/search/pizzas?q=[injection]`
- **Demo:** 
  - Try searching with: `'` (see SQL error)
  - Try searching with: `' OR '1'='1` (bypass filter)
- **Details:** See `EXPLOIT_GUIDE.md` section 1

### 2. Broken Access Control (Profile Page)
- **Endpoints:** 
  - `GET /api/users/:id` (view any user)
  - `PUT /api/users/:id` (edit any user)
  - `POST /api/posts` (post as any user)
- **Demo:**
  - Login as Alice (User 1)
  - Change User ID to 2 (Bob) and view/edit their profile
  - Create posts as other users in the Feed
- **Details:** See `EXPLOIT_GUIDE.md` section 2

### 3. Vulnerable Components
- Not currently implemented (see EXPLOIT_GUIDE.md section 3 for options)
- Can demonstrate with `npm audit` or add outdated dependency

## Architecture

### Frontend
- **Framework:** React 19 (Bun + Vite)
- **Styling:** Tailwind CSS 4.1 + shadcn/ui
- **Routing:** React Router v7
- **Icons:** Lucide React

### Backend
- **Runtime:** Bun
- **Type:** Single-file Express-like server
- **Database:** In-memory mock data (no persistent storage)

## File Structure

```
src/
├── index.ts              # Backend server + API endpoints (VULNERABLE CODE)
├── App.tsx               # Main app component with routing
├── pages/
│   ├── LoginPage.tsx     # Authentication page
│   ├── SearchPage.tsx    # Pizza search (SQL injection demo)
│   ├── ProfilePage.tsx   # User profiles (BAC demo)
│   ├── FeedPage.tsx      # Social feed (BAC demo)
│   └── AppLayout.tsx     # Navigation & layout
├── components/ui/        # shadcn/ui components
├── index.html            # HTML entry point
├── index.ts              # React entry point
└── index.css             # Global styles

EXPLOIT_GUIDE.md          # Detailed exploitation instructions for presenter
```

## Security Notes (Educational Context)

⚠️ **This app is intentionally vulnerable and should ONLY be used for educational purposes in controlled environments.**

**DO NOT:**
- Deploy to production
- Use with real user data
- Expose to untrusted networks
- Use credentials from this app anywhere else

**Key Vulnerabilities (Intentional):**
- SQL queries built via string concatenation
- No authorization checks on user endpoints
- No validation of request ownership
- Errors reveal SQL structure
- No HTTPS in dev mode
- Mock authentication only

## Learning Resources

### During the Workshop:
1. Show `EXPLOIT_GUIDE.md` to students
2. Live-demonstrate each vulnerability
3. Show the vulnerable code in `src/index.ts`
4. Discuss proper fixes and secure practices

### After the Workshop:
- Students can review the code to understand vulnerabilities
- Use as a reference for what NOT to do
- Compare with secure implementation patterns

## Browser DevTools Tips

**For Network Analysis:**
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Perform actions in the app
4. Click requests to inspect:
   - Headers (auth tokens, user IDs)
   - Request body (unvalidated data)
   - Response (sensitive data exposure)

**To Replay Requests:**
1. Right-click a request
2. Select "Copy as cURL"
3. Modify parameters (user IDs, etc.)
4. Paste in terminal to re-execute

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3000 already in use | Change in `src/index.ts` or kill existing process |
| Module not found errors | Run `bun install` |
| Build errors | Check that file paths in imports are correct |
| Geolocation not working | Browser may block - check privacy settings |

## Advanced: Adding a Real CVE Demo

To demonstrate a real vulnerable package:

1. Add to `package.json`:
   ```json
   "js-yaml": "^3.13.0"
   ```

2. Run `bun install`

3. Create an endpoint that triggers the CVE:
   ```typescript
   import YAML from 'js-yaml';
   // YAML.load() with untrusted input = code execution
   ```

4. Document the attack and fix in workshop

---

**Questions?** Refer to `EXPLOIT_GUIDE.md` for detailed demonstrations and teaching points.
