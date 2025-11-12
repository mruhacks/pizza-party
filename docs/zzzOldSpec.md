IGNORE THIS FILE

# Pizza Party Application Specification

## Project Overview

### Purpose
Pizza Party is an engaging web application designed to demonstrate security vulnerabilities to students at the University of Calgary. The application serves as an interactive learning tool where students can explore real-world security issues in a controlled, educational environment.

For starters, this app will be demonstrated through a presentation - students won't be able to use it hands-on.

### Target Audience
- Second-year students studying Computer Science or Software Engineering

### Core Features
Pizza Party provides a comprehensive platform for discovering and discussing pizzas through two main interfaces:
1. **Pizza Search Engine** - Find the best pizzas with search functionality
2. **Social Feed** - Share and engage with pizza-related content

---

## Feature Specifications

### 1. Authentication & User Management

#### 1.1 Login System
- **Requirement**: Basic login capability required
- **Details to define**:
  - Email/password authentication (store credentials in database)
  - Basic password requirements
  - Simplest session management strategy

#### 1.2 User Profiles
- Accessed through {baseurl}/user/{id}
- Store full name, address, profile picture
- Users can edit their profile and upload a profile pic
- Address should not be publicly visible but other details should be

#### 1.3 Security Vulnerabilities (Educational)
- Broken Access Control:
    - The User Profile page will incorrectly allow users to go to another profile page by simply changing the id.

---

### 2. Pizza Search Engine

#### 2.1 Search Functionality
- **URL Query Parameters**: Search criteria are encoded as URL query parameters to demonstrate SQL injection
- **Search Fields**:
  - [FILL IN: Pizza name/type search]
  - [FILL IN: Restaurant/location search]
  - [FILL IN: Price range filtering]
  - [FILL IN: Dietary filters (vegetarian, vegan, gluten-free, etc.)]
  - [FILL IN: Rating/review filtering]
  - [FILL IN: Any other search criteria?]

#### 2.2 Search Results Display
- [FILL IN: How many results per page?]
- [FILL IN: Sorting options (by rating, price, relevance, recency)]
- [FILL IN: What information is shown in search results?]
  - Pizza name, restaurant, price, image thumbnail, rating
  - [FILL IN: Additional fields?]

#### 2.3 Pizza Detail View
- [FILL IN: Full pizza details displayed when clicking on a result]
- [FILL IN: Related pizzas or recommendations]

#### 2.4 Security Vulnerability - SQL Injection
- **Vulnerability Type**: Direct SQL query construction without parameterization
- **Implementation Details**:
  - Search parameters from URL query strings are directly concatenated into SQL queries
  - [FILL IN: Which endpoint(s) will be vulnerable?]
  - [FILL IN: Specific SQL query construction example]
  - [FILL IN: How will this vulnerability be safely demonstrated to students?]
  - [FILL IN: Are there safeguards or warnings in place?]

---

### 3. Social Feed (Timeline)

#### 3.1 Post Creation
- **Post Content**:
  - [FILL IN: Text content requirements and limitations]
  - [FILL IN: Image upload support?]
  - [FILL IN: Can posts reference pizzas from search engine?]
  - [FILL IN: Hashtag support?]

#### 3.2 Feed Display
- **Timeline View**:
  - [FILL IN: Chronological order or algorithmic?]
  - [FILL IN: Pagination or infinite scroll?]
  - [FILL IN: Posts per page/load?]

#### 3.3 Social Interactions
- [FILL IN: Like/reaction system?]
- [FILL IN: Comment functionality?]
- [FILL IN: Share/retweet functionality?]
- [FILL IN: Follow/unfollow users?]

#### 3.4 Content Moderation
- [FILL IN: Who can delete posts?]
- [FILL IN: Reporting mechanism for inappropriate content?]
- [FILL IN: Admin moderation features?]

---

## Technical Architecture

### Technology Stack
- **Frontend**: React with [FILL IN: state management library?]
- **Frontend Build**: Bun
- **Backend**: Node.js API
- **Database**: PostgreSQL via Supabase
- **Deployment**: Vercel
- **Authentication**: [FILL IN: service/method]

### Frontend Structure
- **Entry Point**: `src/index.ts`
- **Main App**: `src/frontend.tsx`
- **Components**: 
  - `src/components/ui/` - Reusable UI components
  - [FILL IN: Feature-specific component structure?]
- **Styling**: CSS modules/Tailwind/[FILL IN: CSS solution]

### Backend Structure
- **Base URL**: [FILL IN: API endpoint URL]
- **Authentication Endpoints**:
  - [FILL IN: Login endpoint]
  - [FILL IN: Register endpoint]
  - [FILL IN: Logout endpoint]
  - [FILL IN: Session validation]
- **Pizza Search Endpoints**:
  - [FILL IN: GET /api/pizzas/search - vulnerable endpoint]
  - [FILL IN: GET /api/pizzas/:id - get pizza details]
- **Social Feed Endpoints**:
  - [FILL IN: GET /api/feed - get timeline]
  - [FILL IN: POST /api/posts - create post]
  - [FILL IN: GET /api/posts/:id - get post details]
  - [FILL IN: POST/DELETE /api/posts/:id/likes - like/unlike]
  - [FILL IN: POST /api/posts/:id/comments - add comment]

### Database Schema
#### Users Table
- `id` (UUID, primary key)
- `email` (string, unique)
- `username` (string)
- [FILL IN: password_hash or auth provider ID]
- [FILL IN: profile_picture_url?]
- [FILL IN: bio?]
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### Pizzas Table
- `id` (UUID, primary key)
- `name` (string)
- `description` (string)
- `restaurant` (string)
- `price` (decimal)
- [FILL IN: image_url?]
- [FILL IN: location/latitude/longitude?]
- [FILL IN: dietary_info?]
- [FILL IN: ingredients?]
- `created_at` (timestamp)
- [FILL IN: Additional fields?]

#### Posts Table
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key)
- `content` (text)
- [FILL IN: pizza_id (foreign key)?]
- [FILL IN: image_url?]
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### [FILL IN: Additional tables needed?]
- Reviews/Ratings table?
- Comments table?
- Likes table?
- Follows table?
- [FILL IN: Others?]

---

## Security Considerations

### Intentional Vulnerabilities (For Educational Purposes)
1. **SQL Injection**
   - Pizza search endpoint accepts unsanitized query parameters
   - Backend constructs SQL queries via string concatenation
   - [FILL IN: Specific vulnerable query example]

2. [FILL IN: Additional intentional vulnerabilities to demonstrate?]
   - XSS vulnerabilities?
   - CSRF token bypass?
   - Weak authentication?
   - Insecure direct object references?
   - Sensitive data exposure?

### Security Controls
- [FILL IN: What controls are in place to prevent misuse?]
- [FILL IN: Rate limiting?]
- [FILL IN: Input validation on frontend (educational only)?]
- [FILL IN: Logging and monitoring?]

---

## User Interface Specifications

### Pages/Views

#### Authentication Pages
- **Login Page**: Email and password input, submit button
  - [FILL IN: Additional fields or options?]
  - [FILL IN: Error message display?]
  - [FILL IN: Forgot password flow?]

- **Registration Page**: [FILL IN: If applicable, user registration details]

#### Pizza Search Page
- **Layout**: 
  - Search bar with query parameter builder
  - [FILL IN: Advanced filter options?]
  - Results grid/list
- **Components**:
  - Search input field
  - Filter/refine options
  - Pizza result cards
  - Pagination/load more

#### Pizza Detail Page
- [FILL IN: Layout and components]
- [FILL IN: Related pizzas section?]
- [FILL IN: Review section?]

#### Social Feed Page
- **Layout**:
  - Post creation area at top
  - Timeline of posts below
- **Components**:
  - Post composer (textarea with submit)
  - Post cards with content, author, timestamp
  - Like/comment buttons
  - [FILL IN: User profile links?]

#### User Profile Page
- [FILL IN: What information is displayed?]
- [FILL IN: User's own posts?]
- [FILL IN: Follow button?]

---

## API Request/Response Examples

### Pizza Search (Vulnerable Endpoint)
```
GET /api/pizzas/search?pizza_type=pepperoni&restaurant=&price_range=0-20
```

**Expected Response (Success)**:
```json
{
  "results": [
    {
      "id": "pizza-1",
      "name": "Classic Pepperoni",
      "restaurant": "Pizza Palace",
      "price": 14.99,
      "image_url": "...",
      "rating": 4.5
    }
  ],
  "total": 1
}
```

[FILL IN: Error response example]

### Create Post
```
POST /api/posts
Content-Type: application/json

{
  "content": "This pizza is amazing!",
  "pizza_id": "optional-pizza-id"
}
```

[FILL IN: Additional API examples]

---

## Deployment Strategy

- **Frontend**: Deployed on Vercel
- **Backend**: [FILL IN: Where is backend hosted? Vercel API routes? Separate service?]
- **Database**: Supabase PostgreSQL
- **Environment Variables**: [FILL IN: List required env vars]
  - Database connection string
  - API keys
  - [FILL IN: Others?]

---

## Educational Learning Outcomes

Students should be able to:
1. [FILL IN: Understand SQL injection attacks and defenses]
2. [FILL IN: Identify vulnerable code patterns]
3. [FILL IN: Understand secure coding practices]
4. [FILL IN: Additional learning objectives?]

---

## Future Enhancements

- [FILL IN: OAuth/social login?]
- [FILL IN: Mobile app?]
- [FILL IN: Advanced search features?]
- [FILL IN: Recommendation algorithm?]
- [FILL IN: Real-time notifications?]
- [FILL IN: Admin dashboard?]

---

## Notes & References

[FILL IN: Any additional documentation, design mockups, or reference materials]

