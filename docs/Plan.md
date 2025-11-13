## Plan: Build Pizza Party Security Workshop App

Build a deliberately vulnerable Pizza Party social app to demonstrate three key security vulnerabilities—SQL Injection, Broken Access Control, and Vulnerable Components—for second-year CS/SE students. The app will feature a searchable pizza database, user profiles, and social feed, with intentional flaws in the backend API for live hacking demonstrations.

### Steps

1. **Set up backend API structure** in `src/index.ts` with vulnerable endpoints for `/api/search/pizzas`, `/api/users/:id`, `PUT /api/users/:id`, and `/api/posts`.

2. **Implement geolocation-based pizza search** - Backend serves mock data of real pizza shops around University of Calgary (coordinates, names, ratings, distance). Frontend includes geolocation permission flow and real-time distance calculation to match search results.

3. **Build modern, hip frontend** - Sleek UI with glassmorphism effects, smooth animations, gradient accents, card-based layouts, and refined Tailwind styling to feel like a production social app.

4. **Create Supabase database schema** with Users, Pizzas, and Posts tables; seed realistic test data including multiple users and pizza shops positioned geographically near U of C.

5. **Implement SQL Injection vulnerability** in pizza search endpoint using string concatenation (no parameterized queries) to allow exception messages and malicious SQL injection.

6. **Implement Broken Access Control vulnerabilities**: profile endpoint returns any user's data without verification; profile update endpoint allows changing any user's data; post creation doesn't validate user ownership.

7. **Build React frontend pages**: Login, Pizza Search with geolocation, User Profile (editable/viewable), Social Feed with post composer, Post cards with details—all with modern styling.

8. **Add client-side routing** (React Router) and state management to handle navigation, user sessions, geolocation, and data fetching from vulnerable endpoints.

7. **Implement Vulnerable Components CVE** - Include an outdated dependency with a known CVE and demonstrate its exploitation in a clear, repeatable way within the app context.

8. **Create minimal documentation** - Add brief exploit guides (SQL payloads, curl commands, network replay steps) for presenter reference, but keep code comments minimal.

### Implementation Notes

**Geolocation & Search:**
- Mock pizza shop data includes real coordinates around U of C campus (latitude/longitude pairs)
- Frontend requests geolocation permission on app load; displays user's approximate location
- Search results sorted by distance; API endpoint calculates distance server-side or client-side
- Vulnerable SQL query filters by coordinates with string concatenation injection point

**Modern UI/Styling:**
- Glassmorphism cards with backdrop blur and semi-transparent backgrounds
- Gradient accents (purple/pink or blue/cyan) on CTAs and highlights
- Smooth animations on scroll, hover, and transitions (Tailwind animations + custom CSS)
- Map-like display of pizza shops with location pins and distance badges
- Dark mode ready with high contrast text and refined color palette
- Consistent spacing, typography hierarchy, and component reusability

**Environment Setup (Presenter-Focused):**
- App runs locally on presenter's machine during workshop
- Students observe only—no hands-on access to code or running instance
- Supabase database seeded with realistic test data for demo purposes
- API endpoints exposed at `localhost:3000` or similar for live exploitation

**Code & Documentation (Minimal):**
- Minimal code comments; intentional vulnerabilities are self-evident in implementation
- Keep a separate `EXPLOIT_GUIDE.md` with clear steps, payloads, and expected results for each vulnerability
- Include curl commands and network tab instructions for BAC demonstration
