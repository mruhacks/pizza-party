# 🍕 Pizza Party Security Workshop - START HERE

Welcome to Pizza Party! This is a deliberately vulnerable web application designed to teach second-year CS/SE students about critical security vulnerabilities.

## 🚀 Quick Start (2 minutes)

### Step 1: Start the Server
```bash
cd /Users/andrew/Dev/pizza-party
bun --hot src/index.ts
```
✅ You should see: `🚀 Server running at http://localhost:3000/`

### Step 2: Open in Browser
Navigate to: **http://localhost:3000**

### Step 3: Login with Demo Credentials
```
Email:    alice@example.com
Password: password123
```

✅ You're now in the Pizza Party app!

---

## 📖 Documentation Files (Read in This Order)

### 1. **PRESENTER_QUICK_REFERENCE.md** ⭐ START HERE
   - 5-minute demo scripts
   - Step-by-step for each vulnerability
   - Quiz questions
   - Timing suggestions
   - **Best for:** Running your workshop

### 2. **EXPLOIT_GUIDE.md** 
   - Comprehensive exploitation details
   - Why vulnerabilities exist
   - How to teach them
   - Real-world impact
   - **Best for:** Understanding the vulnerabilities deeply

### 3. **IMPLEMENTATION_SUMMARY.md**
   - What was built
   - Architecture overview
   - All features checklist
   - **Best for:** Understanding the app

### 4. **README_WORKSHOP.md**
   - Quick reference commands
   - Credentials table
   - Browser tips
   - Troubleshooting
   - **Best for:** Running the app

---

## 🎯 The Three Vulnerabilities

### 1️⃣ **SQL Injection** (5 min demo)
Search for: `' OR '1'='1` → See all pizza shops (bypass filter)
- **Page:** Search
- **Why it's bad:** Data theft, database manipulation
- **Fix:** Use parameterized queries

### 2️⃣ **Broken Access Control** (10 min demo)
View/edit Bob's profile even though you're logged in as Alice
- **Page:** Profile & Feed
- **Why it's bad:** Unauthorized access, data breach
- **Fix:** Always verify permissions server-side

### 3️⃣ **Vulnerable Components** (5 min discussion)
Outdated dependencies with known security flaws
- **Tool:** `npm audit`
- **Why it's bad:** Attackers exploit known CVEs
- **Fix:** Keep packages updated

---

## 👥 Test Users (3 accounts to switch between)

| Account | Email | Password | User ID |
|---------|-------|----------|---------|
| 👩 Alice (Admin) | alice@example.com | password123 | 1 |
| 👨 Bob (Regular) | bob@example.com | password456 | 2 |
| 👨 Charlie (Regular) | charlie@example.com | password789 | 3 |

---

## 🎬 Workshop Flow (45 minutes)

```
Intro (5 min)
├─ What are we hacking today?
├─ Show the app
└─ Distribute credentials

SQL Injection (8 min)
├─ Search: '
├─ See SQL error (show the vulnerability!)
└─ Search: ' OR '1'='1 (bypass the filter)

Broken Access Control (15 min)
├─ View Bob's profile as Alice
├─ Edit Bob's name to "BOB HACKED"
├─ Post as Charlie in the Feed
└─ Show Network tab requests

Components & Best Practices (7 min)
├─ Run: npm audit
├─ Explain CVEs
└─ Discuss real-world examples

Q&A (10 min)
└─ Student questions & discussion
```

---

## 💻 Browser Setup for Maximum Impact

### Open DevTools (F12)
1. **Network Tab** - Show API requests
2. **Console Tab** - Show errors/warnings
3. **Application Tab** - Show localStorage with auth token

### During Demo:
1. Make a request in the app
2. Switch to Network tab
3. Show the request/response
4. Highlight the vulnerability

---

## ⚠️ Important Reminders

✅ **DO:**
- Run locally only (localhost:3000)
- Use in controlled classroom
- Explain why these are vulnerabilities
- Show students the vulnerable code
- Practice the demos beforehand

❌ **DON'T:**
- Deploy to production
- Deploy to public servers
- Use real user data
- Leave it running on a network
- Use credentials elsewhere

---

## 🛠️ Technical Details

**Frontend:** React 19 + Tailwind CSS + TypeScript
**Backend:** Bun single-file server (src/index.ts)
**Vulnerabilities:** Intentionally coded into src/index.ts
**Data:** In-memory mock (resets on server restart)

---

## 🐛 Troubleshooting

| Problem | Fix |
|---------|-----|
| **Port 3000 in use** | `lsof -i :3000` then `kill -9 <PID>` |
| **Login fails** | Check credentials exactly match (above) |
| **No geolocation prompt** | Browser privacy settings - proceed anyway |
| **Profile edit doesn't save** | Refresh page - should persist |
| **Search shows no results** | Make sure you entered search term |

---

## 📋 Pre-Workshop Checklist

- [ ] Read PRESENTER_QUICK_REFERENCE.md
- [ ] Start server: `bun --hot src/index.ts`
- [ ] Test all three vulnerabilities
- [ ] Open DevTools Network tab
- [ ] Take screenshot of SQL error
- [ ] Test login with all 3 users
- [ ] Verify profile editing works
- [ ] Check that posts persist
- [ ] Practice transitions between pages

---

## 🎓 Learning Outcomes

After this workshop, students will understand:

1. ✅ What SQL Injection is and why it's dangerous
2. ✅ What Broken Access Control is and real-world impact
3. ✅ How to identify vulnerable dependencies
4. ✅ Why security starts at the code level
5. ✅ How to prevent these vulnerabilities

---

## 🚀 You're Ready!

Everything is built and ready to go. 

**Next Step:** Open PRESENTER_QUICK_REFERENCE.md and run your first demo!

---

**Questions?** Check the documentation files above or refer to the code in `src/index.ts`.

Good luck with your security workshop! 🍕🔒

---

**Files in this package:**
- `src/index.ts` - The vulnerable backend
- `src/pages/*.tsx` - The frontend pages
- `PRESENTER_QUICK_REFERENCE.md` - Your demo script
- `EXPLOIT_GUIDE.md` - Detailed explanations
- `IMPLEMENTATION_SUMMARY.md` - What was built
- `README_WORKSHOP.md` - Running instructions
