# Pizza Party Workshop - Presenter Quick Reference Card

## 🎬 Quick Demo Script

### Setup (Before Students Arrive)
```bash
cd /Users/andrew/Dev/pizza-party
bun --hot src/index.ts
# App runs at http://localhost:3000
```

### Test Account Credentials
```
Alice (Admin):  alice@example.com / password123 (User ID: 1)
Bob (User):     bob@example.com / password456 (User ID: 2)
Charlie (User): charlie@example.com / password789 (User ID: 3)
```

---

## 🔴 Vulnerability #1: SQL Injection (5 min)

### Steps:
1. Log in with Alice
2. Click "Search" in nav
3. Try searching: **`'`** 
   - 💥 **Result:** SQL error message appears
   - 📝 **Show students:** The actual SQL query is exposed!

4. Try searching: **`' OR '1'='1`**
   - ✅ **Result:** All pizza shops returned
   - 📝 **Show students:** Filter bypassed - got unauthorized data

### Key Points:
- ❌ Never build queries with string concatenation
- ✅ Always use parameterized/prepared statements
- 🚨 Don't expose SQL errors to users
- 🔍 Mention: Error reveals database structure to attackers

### Quiz Questions:
- "What other data could an attacker access this way?"
- "How would we fix this?"
- "Why is the error message bad?"

---

## 🔴 Vulnerability #2: Broken Access Control (10 min)

### Demo Part A: View Other User's Profile
1. Logged in as Alice
2. Go to Profile page
3. See User ID field with "1"
4. Change to **"2"** and press Enter
   - 💥 **Result:** Bob's full profile appears!
   - Name, email, address all visible
   - 📝 **Show students:** No permission check!

5. Change to **"3"**
   - 💥 **Result:** Charlie's profile

### Demo Part B: Edit Other User's Profile
1. Still as Alice, User ID set to 2 (Bob)
2. Click "Edit Profile"
3. Change Bob's name to: **"BOB HACKED"**
4. Change address to: **"COMPROMISED ACCOUNT"**
5. Click "Save Changes"
   - ✅ **Result:** "Profile updated successfully!"
   - 📝 **Show students:** Changes persist!

6. Change User ID back to 2 and refresh
   - 💥 **Proof:** Bob's data is permanently modified

### Demo Part C: Post as Other Users
1. Go to Feed page
2. Note: User ID selector (currently 1)
3. Change to **"3"** (Charlie)
4. Write: **"Alice is the best programmer! 🎉"**
5. Click Post
   - 💥 **Result:** Post appears as if Charlie posted it
   - 📝 **Show students:** Alice impersonating Charlie!

### Key Points:
- ❌ Never trust client-supplied user IDs
- ❌ Always verify user ownership server-side
- ✅ Check: does logged-in user == resource owner?
- 🚨 This is one of OWASP Top 10 most common vulnerabilities

### Quiz Questions:
- "What if Bob had admin privileges?"
- "Could an attacker delete other users' accounts?"
- "How would we fix this?"

---

## 📦 Vulnerability #3: Vulnerable Components (5 min)

### Option A: Show npm audit (Easiest)
```bash
npm audit
# Show any vulnerabilities in dependencies
```

### Option B: Explain CVE (Knowledge-based)
- Common Vulnerabilities and Exposures (CVE)
- Example: "CVE-2020-8472" in js-yaml
- Show how to fix: `npm update js-yaml`

### Key Points:
- ⚠️ Always audit dependencies regularly
- 🔄 Keep packages updated
- 🛡️ Use tools: Dependabot, Snyk, npm audit
- 📋 Check package size and maintenance level

### Quiz Questions:
- "How often should you audit dependencies?"
- "What does CVE mean?"
- "Why is this dangerous?"

---

## 🎯 Live Hacking Demo (Optional: Show Network Tab)

### SQL Injection via DevTools:
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. In app: Search with `' OR '1'='1`
4. In Network tab: Click the request
5. Show:
   - Request URL with injection payload
   - Response with SQL error
   - Response reveals database structure

### BAC via Network Replay:
1. Network tab → Find a `/api/users/2` request (viewing Bob)
2. Right-click → "Copy as cURL"
3. Paste in terminal → Shows Bob's data
4. Modify URL to `/api/users/3` → See Charlie's data
5. Explain: "No authentication header needed!"

---

## 🎓 Teaching Checklist

### Before You Demo:
- [ ] Server is running at localhost:3000
- [ ] Network tab in browser is open
- [ ] Screen sharing/projector is ready
- [ ] Read EXPLOIT_GUIDE.md for detailed steps
- [ ] Test each vulnerability once yourself

### During SQL Injection:
- [ ] Show the error message clearly
- [ ] Pause and explain what's happening
- [ ] Ask students to predict the next step
- [ ] Show the vulnerable code (src/index.ts line ~150)

### During BAC:
- [ ] Switch between users slowly (let them follow along)
- [ ] Edit one field at a time
- [ ] Verify changes persisted
- [ ] Show Network tab requests
- [ ] Emphasize: "Server didn't check permission!"

### During Components:
- [ ] Explain what CVEs are
- [ ] Show how to find vulnerable packages
- [ ] Discuss real-world examples
- [ ] Mention: "npm audit is free and easy!"

---

## ⚡ Troubleshooting During Demo

| Problem | Solution |
|---------|----------|
| App won't load | Check server is running: `bun --hot src/index.ts` |
| Can't login | Use credentials above exactly as shown |
| Search doesn't work | Check /api/search/pizzas endpoint in DevTools Network tab |
| Profile changes don't save | Refresh page, should see persistent change |
| Geolocation popup | Click "Allow" or dismiss - app will use U of C coordinates |
| Page very slow | Clear browser cache or use incognito window |

---

## 💡 Discussion Questions to Ask

### After Each Vulnerability:

**SQL Injection:**
- "What information could be stolen?"
- "How would a hacker find injection points?"
- "What's the real-world impact?"

**BAC:**
- "What if this was a banking app?"
- "Could an attacker transfer money?"
- "Is this a common vulnerability?"

**Components:**
- "Why does dependency security matter?"
- "What's the difference between a critical and low CVE?"
- "Who's responsible for keeping libraries updated?"

---

## 📚 Additional Resources

- **OWASP Top 10:** Shows most dangerous web vulnerabilities
- **OWASP API Security:** API-specific vulnerabilities
- **Burp Suite Community:** Professional penetration testing tool
- **DVWA:** Damn Vulnerable Web Application (another training app)
- **HackTheBox:** Hands-on security challenges

---

## 🎬 Suggested Workshop Timing

- **Total Time:** 50 minutes

| Segment | Time | What to Do |
|---------|------|-----------|
| Intro & Setup | 5 min | Show app, explain vulnerabilities |
| SQL Injection Demo | 8 min | Live search, show errors |
| BAC Demo | 15 min | View/edit profiles, post as others |
| Network Tab Deep Dive | 7 min | Show requests, explain auth |
| Components & Fixes | 5 min | Show npm audit, discuss best practices |
| Q&A & Discussion | 10 min | Answer student questions |

---

## 📞 Key Takeaway Messages

1. **"Never trust user input"** - Validate and sanitize everything
2. **"Always verify permissions"** - Check server-side who is making requests
3. **"Keep dependencies updated"** - Regular audits protect against CVEs
4. **"Security is everyone's job"** - Developers, architects, operations
5. **"Practice safely"** - Learn on intentionally vulnerable apps like this

---

**You're ready! Good luck with your workshop! 🚀🍕**
