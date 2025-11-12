IGNORE THIS FILE


I'm doing a security workshop with students at the U of C (University of Calgary). They are second-year students taking either Software Engineering or Computer Science. I want to teach them some of the basics of coidng securely.

As part of this, I want to demonstrate hacking an app and exploiting SQL Injection, Broken Access Control, and Vulnerable Components. This will just be me presenting the hacking - they won't actually get hands on time with the app.

The app will be called Pizza Party, a social app for finding the best pizza around and rating pizza based on different criteria. A timeline-style social feed will display posts that people have written.

Here is what I want to demonstrate:
- SQL Injection: Perform a search for pizza that triggers an exception - the response will show a SQL error along with the offending statement. Now do a search but in one of the fields format it to inject into the SQL query to create a new fake pizza shop.
- Broken Access Control: 
     - Change URL to someone else’s profile – update their profile pic
     - Use Network tab in Chrome to replay a request to create a post, but as a different user
- Vulnerable Components: not sure what to do here yet

Tech stack:
- React (created with Bun) - initial app already present
- Node.js API
- Supabase for database
