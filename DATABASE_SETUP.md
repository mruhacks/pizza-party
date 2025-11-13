# Database Setup Guide

## Quick Start

### 1. Install PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

### 2. Create Database

```bash
createdb pizza_party
```

Or using psql:
```bash
psql postgres
CREATE DATABASE pizza_party;
\q
```

### 3. Configure Connection (Optional)

The app uses these defaults. You can override them with environment variables:

```bash
export DB_USER=postgres
export DB_HOST=localhost
export DB_NAME=pizza_party
export DB_PASSWORD=postgres
export DB_PORT=5432
```

### 4. Run the App

The app will automatically create tables and seed data on first run:

```bash
bun dev
```

## Database Schema

The app creates three tables:

### Users Table
- `id` (serial, primary key)
- `email` (varchar, unique)
- `password` (varchar)
- `name` (varchar)
- `address` (text)
- `lat`, `lng` (decimal)
- `profile_pic_url` (text)
- `created_at` (timestamp)

### Pizzas Table
- `id` (serial, primary key)
- `name` (varchar)
- `address` (text)
- `lat`, `lng` (decimal)
- `rating` (decimal)
- `price_range` (integer)
- `created_at` (timestamp)

### Posts Table
- `id` (serial, primary key)
- `user_id` (integer, foreign key to users)
- `content` (text)
- `created_at` (timestamp)

## Test Users

The database is seeded with three test users:

| ID | Email | Password | Name |
|----|-------|----------|------|
| 1 | alice@example.com | password123 | Alice Johnson |
| 2 | bob@example.com | password456 | Bob Smith |
| 3 | charlie@example.com | password789 | Charlie Brown |

## Troubleshooting

### PostgreSQL not running
```bash
brew services start postgresql@14
```

### Database already exists error
This is fine - the app will use the existing database.

### Connection refused
Check that PostgreSQL is running and the port (default 5432) is correct:
```bash
pg_isready
```

### Reset database
```bash
dropdb pizza_party
createdb pizza_party
bun dev  # Will recreate tables and seed data
```
