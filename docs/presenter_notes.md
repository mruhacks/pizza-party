# Tech Start Security Workshop

## Slide 1

AppSec 101

with Arcurve

---

## Slide 2

© 2025 Arcurve Inc. May contain confidential information. Please do not copy, distribute or repurpose.

Agenda

Introductions
Basic Developer Security Hygiene
OWASP Introduction
Hacking Demo: Vulnerabilities from OWASP
Further resources + CyberSec club

---

## Slide 3

© 2025 Arcurve Inc. May contain confidential information. Please do not copy, distribute or repurpose.

Arcurve

And an introduction to your presenters

---

## Slide 4

Arcurve

Arcurve is one of North America's leading technology companies. 
We are a consulting firm that assists organizations in every part of the SDLC.
In short, we are “Tech guns-for-hire”
Presenters
Andrew Langemann & Matthew Powaschuk – Technical Leads
Haris Muhammad - Software Developer

© 2025 Arcurve Inc. May contain confidential information. Please do not copy, distribute or repurpose.

---

## Slide 5

Why is Security important to think about?

Even trusted platforms get breached. Discord lost sensitive ID data through a single weak vendor.
https://cybersecuritynews.com/discord-data-breach-sensitive-data/
Breaches destroy trust, cost money, and damage careers.
Students are not exempt. Anything you upload can become a target. 
If you have users on your projects, you are now data stewards, and that comes with certain responsibilities.

© 2025 Arcurve Inc. May contain confidential information. Please do not copy, distribute or repurpose.

---

## Slide 6

© 2025 Arcurve Inc. May contain confidential information. Please do not copy, distribute or repurpose.

Dev Hygiene 101

…and other basic habits

---

## Slide 7

Secret Management

Avoid hard-coding API keys, tokens, and passwords in source code.
Exposed keys (like the 2023 OpenAI key leaks) can grant full access to services or data, always store them securely in environment variables or secret vaults, never in public code repositories.
Don’t think because your project isn’t popular people won’t notice your leaks! A simple Github search finds some quickly https://github.com/search?q=openai_key%3D%22e&type=code.
Rotate and revoke credentials regularly to reduce exposure risk. Also, immediately rotate all keys upon accidental or malicious leaks.
Avoid credentials if you can!
Use OAuth or Federated Identity Instead of Custom Passwords. Password-less login is worth consideration.

© 2025 Arcurve Inc. May contain confidential information. Please do not copy, distribute or repurpose.

---

## Slide 8

Dependencies

Use dependency scanners to detect vulnerabilities.
Due diligence before installing a dependency 
Lock versions and avoid blindly updating libraries without testing.
Remove unused packages to minimize the attack surface; scanners can help with this.

© 2025 Arcurve Inc. May contain confidential information. Please do not copy, distribute or repurpose.

---

## Slide 9

How does a Supply Chain Attack Happen?

Reviewdog automatically runs code linters in CI and reports the results directly on pull requests to improve code quality. It was compromised.
An example that intersects nicely with secret management…
https://github.com/reviewdog/action-setup/commit/f0d342d24037bb11d26b9bd8496e0808ba32e9ec
A maintainer’s GitHub account was compromised and an obfuscated malicious script was committed.
This one is particularly nasty because it’s not updated by choice, any action using that tag would have been immediately compromised for a window of 1 hour and 49 minutes if they ran a pipeline.

© 2025 Arcurve Inc. May contain confidential information. Please do not copy, distribute or repurpose.

---

## Slide 10

Zero Trust

Never assume trust; verify every user, device, and request through identity checks and context like location or behavior.
Apply least privilege using fine-grained and role-based access controls to limit what each account can touch.
Continuously authenticate and monitor with MFA, identity tokens, and session validation to ensure access stays legitimate.
Avoid long-lived credentials; prefer short-lived, renewable tokens that expire quickly if stolen.

© 2025 Arcurve Inc. May contain confidential information. Please do not copy, distribute or repurpose.

---

## Slide 11

OWASP Introduction

What is OWASP?
How often is it updated?
Why pay attention to it?
Brief overview of:
Broken Access Control
Injection: SQL, XSS
Vulnerable & Outdated Components

© 2025 Arcurve Inc. May contain confidential information. Please do not copy, distribute or repurpose.

---

## Slide 12

© 2025 Arcurve Inc. May contain confidential information. Please do not copy, distribute or repurpose.

Hacking an App

Exploiting common vulnerabilities…

### Presenter Notes

Thank you Matt.
Now gonna demonstrate exploiting those three vulnerabilities in a modern app. 
We’ll have some discussion time to hear your thoughts and talk about how you can code your apps to prevent these.

---

## Slide 13

A typical modern app

© 2025 Arcurve Inc. May contain confidential information. Please do not copy, distribute or repurpose.

Server

UI

API

Request

Response

### Presenter Notes

Here is an example of a typical app. 
The first box here User Device is commonly called the “Client” – this is what connects to the “Server” to download and upload files and information

Example: Open Chrome on your laptop and go to TikTok
The Chrome browser is the client. 
You’ll see buttons, nav, logo, etc. Those are “UI” elements that are downloaded from the server. 
When you post a video, it sends a Request to the Server and the API sends back a Response
Other examples – when you load a feed or open someone’s profile, the Client sends Requests to the Server and the API sends back Responses

---

## Slide 14

Hacking Pizza Party

© 2025 Arcurve Inc. May contain confidential information. Please do not copy, distribute or repurpose.

### Presenter Notes

Quick walkthrough of high-level features in the app:- Pizza Party is a social app that lets you find the best pizza near you, and join the local pizza conversation with other pizza lovers

---

## Slide 15

Demo – Broken Access Control

© 2025 Arcurve Inc. May contain confidential information. Please do not copy, distribute or repurpose.

### Presenter Notes

PROFILE PIC EDIT
Show the User Profile
Note the id in the URL
Try changing the id to the next consecutive number - 1625
WHOA – I can see someone else’s profile! Should be Marcus Reid
Try editing the profile
WHOA – I can edit someone else’s profile!
Change the profile pic to `docs/artifacts/rem-rotating-the-finger.gif` and name to “Marcus has no drip”, Save
Go back to the Feed and look at the latest post by Marcus


FAKE POST – FIREFOX DEVTOOLS:
- Open up Firefox DevTools and click on Network tab (make sure it's zoomed in enough)
- Make a post on the Feed - e.g. pick "Mountain Mike's" and say "The jalapeño and sausage thin crust from Mountain Mike's was legit"
- Show the post - show the headers and the payload

- Firefox has a feature that lets me perform that API request again.
- Right-click on request and click Resend
- Click Refresh on the feed and see the duplicate post

- Pull up the request again and look at payload
- Note that the payload has a `userId` - would it be possible to make this POST request with a different user and impersonate someone else?
- Click the "Edit and Resend" button
- Talk about the feature
- Change the Body:
    - Set userId to 1625
    - Set content: TO ALL MY HOMIES, WIN ROBUX TODAY: [FREE ROBUX](https://www.youtube.com/watch?v=xvFZjo5PgG0)
- Post it
Click Refresh on the feed
Haha rickroll video


FAKE POST – BRUNO:
- You can also do this API request using a tool like Postman or Bruno. I like Bruno since it keeps your data local instead of in their cloud.
- Look at the URL from the Network tab

- Open the Bruno collection from `/docs/artifacts/bruno`
- Look at the Fake Post request - we have the same URL in there for creating a post
- Run it - fails with "Unauthorized"
- Ask the crowd - any ideas on what I should do here?

- Go back to the Network devtools and look at the headers
- There's an Authorization header with a Bearer Token
    - Common flow as when you sign in with user and password it creates a token (usually only valid for a few hours or days) that you can then use on subsequent requests to authenticate you. This way you don't have to send your user/pass on every request.
- Put that in the Headers tab in Bruno and try again
- Refresh the feed and BAM - there is the fake post ;)

---

## Slide 16

Why did that work?

© 2025 Arcurve Inc. May contain confidential information. Please do not copy, distribute or repurpose.

Broken Access Control: When there is inadequate logic to enforce access to a particular function.
For example:
API allowed a user to edit another user’s profile
API allowed a user to post as someone else

### Presenter Notes

These vulnerabilities fall under the banner of “Broken Access Control”

---

## Slide 17

© 2025 Arcurve Inc. May contain confidential information. Please do not copy, distribute or repurpose.

### Presenter Notes

How could we prevent this? Let’s hear your ideas with Haris!

---

## Slide 18

© 2025 Arcurve Inc. May contain confidential information. Please do not copy, distribute or repurpose.

Profile hack

Fake post

### Presenter Notes

How could we prevent this? Let’s hear your ideas with Haris!

---

## Slide 19

© 2025 Arcurve Inc. May contain confidential information. Please do not copy, distribute or repurpose.

The frontend can not be trusted for implementing security:
Permissions/roles
Login states (e.g. Auth header token)
Data access checks
The backend can be accessed with anything (e.g. terminal, API tools, etc)

Important Points

### Presenter Notes

How could we prevent this? Let’s hear your ideas with Haris!

---

## Slide 20

Demo – SQL Injection

© 2025 Arcurve Inc. May contain confidential information. Please do not copy, distribute or repurpose.

### Presenter Notes

Open the Search page
Make sure the Network tab is open
Do a search for “Una”
Look at the request in the Network tab – it contains the SQL query in the response!
Looks like the table is called “pizza_info” – look at the results – there’s a “name” and a “photo_url” column

Could we craft an input that would modify the SQL query to modify the data??

Search for
```sql
'; update pizza_info set name = 'YOU HAVE BEEN HACKED', photo_url = 'https://tinyurl.com/3fwfyf79'; select 1 where '1' = '
```
- Now do a Search for nothing again – all the pizza shops were changed

---

## Slide 21

How did this happen?

© 2025 Arcurve Inc. May contain confidential information. Please do not copy, distribute or repurpose.

Injection: When user input gets interpreted as code.
In this case, a query string value is being wrongly trusted and interpreted as SQL code.

### Presenter Notes

Injection happens when data can be interpreted as code. The query string value is being added to the code and then evaluated. The intention is that it’s just treated as the filter for the name.

---

## Slide 22

© 2025 Arcurve Inc. May contain confidential information. Please do not copy, distribute or repurpose.

### Presenter Notes

How could we prevent this? Let’s hear your ideas with Haris!

---

## Slide 23

© 2025 Arcurve Inc. May contain confidential information. Please do not copy, distribute or repurpose.

Parameterization
Not writing SQL directly (using an ORM)
Remember Zero Trust!

SQL Injection: Best Practices

### Presenter Notes

How could we prevent this? Let’s hear your ideas with Haris!

---

## Slide 24

Parameterization

© 2025 Arcurve Inc. May contain confidential information. Please do not copy, distribute or repurpose.

---

## Slide 25

ORM (Object-relational Mapping)

© 2025 Arcurve Inc. May contain confidential information. Please do not copy, distribute or repurpose.

// UNSAFE: Direct concatenation of user input
const express = require('express');
const mysql = require('mysql');
const app = express();
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'users_db'
});
app.get('/user', (req, res) => {
  const userId = req.query.id; // attacker could input: 1 OR 1=1
  const query = `SELECT * FROM users WHERE id = ${userId};`;
  connection.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// SAFE: Using Sequelize ORM
const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const app = express();
// Setup Sequelize connection
const sequelize = new Sequelize('users_db', 'root', 'password', {
  host: 'localhost',
  dialect: 'mysql'
});
app.get('/user', async (req, res) => {
  try {
    const userId = req.query.id;
    // ORM automatically parameterizes this query
    const user = await User.findOne({ where: { id: userId } });
    res.json(user);
  } catch (err) {
    console.error(err);
  }
});

---

## Slide 26

Vulnerable Components

© 2025 Arcurve Inc. May contain confidential information. Please do not copy, distribute or repurpose.

### Presenter Notes

Demonstrate:
- ???

---

## Slide 27

Example: Log4Shell

© 2025 Arcurve Inc. May contain confidential information. Please do not copy, distribute or repurpose.

Considered the “most critical vulnerability ever” (Tenable)
Vulnerability in popular Java logging framework Log4j
Form of injection attack
When logging text with ${jndi:<url>} the URL would be queried and resulting data loaded as Java object data
Often HTTP requests are logged, so exploiting sometimes as easy as making an HTTP request with malicious string in the URL
Reported in 2021
Almost immediately, sophisticated attacks began
Within 24 hours, over 60 variations of the exploit produced
93% of enterprise cloud environments vulnerable
Minecraft: Java Edition

---

## Slide 28

Example: event-stream

© 2025 Arcurve Inc. May contain confidential information. Please do not copy, distribute or repurpose.

Very popular package on npm
Rogue developer took over the package as maintainer
Released update (version 3.3.6) with an attack:
Find keys for crypto account on developer’s machine
Harvest keys and send in a request to hacker’s server
Then hacker can steal the developer’s crypto

---

## Slide 29

© 2025 Arcurve Inc. May contain confidential information. Please do not copy, distribute or repurpose.

### Presenter Notes

What can we do to protect ourselves against this?

---

## Slide 30

© 2025 Arcurve Inc. May contain confidential information. Please do not copy, distribute or repurpose.

Package due diligence:
Have there been recent changes?
Is there sizable community around it?
What are weekly downloads? Can be faked…
Lockfile to lock package versions

When a package fixes a security issue, they are now telling the world what the vulnerability was
Most of the code in your app is in packages
You will never be 100% safe here

Important Points

---

## Slide 31

Where to go from here?

Highly advise reading the OWASP Top 10
OWASP Tooling
For a good resource to keep up on security events at a high-level, I’d recommend David Bombal on Youtube. LiveOverflow for low-level

© 2025 Arcurve Inc. May contain confidential information. Please do not copy, distribute or repurpose.

---

## Slide 32

© 2025 Arcurve Inc. May contain confidential information. Please do not copy, distribute or repurpose.

---

## Slide 33

Thank you!

© 2025 Arcurve Inc. May contain confidential information. Please do not copy, distribute or repurpose.

---
