# Pizza Party

Example social app to demonstrate security vulnerabilities, 
including Broken Access Control and SQL Injection.

Disclaimer: Most of this code was written by Claude so does not 
necessarily follow good coding standards or architecture patterns.

## Setup Instructions

1. Install dependencies:
    - [Bun](https://bun.sh/)
    - [Just](https://github.com/casey/just)
    - Docker
2. Clone repo and create `.env` file in the root:
    ```
    GOOGLE_MAPS_API_KEY=<your key here>
    ```
3. Run Docker containers and app:
    ```shell
    just run
    ```
4. Go to http://localhost:3000/


## Exploit Guide

### Broken Access Control #1

- Show the User Profile
- Note the id in the URL
- Try changing the id to the next consecutive number - 1625
- WHOA – I can see someone else’s profile! Should be Marcus Reid
- Try editing the profile
- WHOA – I can edit someone else’s profile!
- Change the profile pic to something else and name. Save
- Go back to the Feed and look at the latest post by Marcus

### Broken Access Control #2

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

- Go back to the Network devtools and look at the headers
- There's an Authorization header with a Bearer Token
    - Common flow as when you sign in with user and password it creates a token (usually only valid for a few hours or days) that you can then use on subsequent requests to authenticate you. This way you don't have to send your user/pass on every request.
- Put that in the Headers tab in Bruno and try again
- Refresh the feed and BAM - there is the fake post ;)


### SQL Injection


- Open the Search page
- Make sure the Network tab is open
- Do a search for “Una”
- Look at the request in the Network tab – it contains the SQL query in the response!
- Looks like the table is called “pizza_info” – look at the results – there’s a “name” and a “photo_url” column
- Could we craft an input that would modify the SQL query to modify the data??
- Search for
    ```sql
    '; update pizza_info set name = 'YOU HAVE BEEN HACKED', photo_url = 'https://tinyurl.com/3fwfyf79'; select 1 where '1' = ‘
    ```
- Now do a Search for nothing again – all the pizza shops were changed
