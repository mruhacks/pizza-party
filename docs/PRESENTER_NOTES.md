## Prep
- Follow instructions in `/README.md` to set up local app
- Add `127.0.0.1 pizzaparty.com` to your hosts file
- Open Firefox and go to https://pizzaparty.com/


## SQL Injection

Search for
```sql
'; update pizza_info set name = 'YOU HAVE BEEN HACKED', photo_url = 'https://tinyurl.com/3fwfyf79'; select 1 where '1' = '
```


## Broken Access Control

### Profile Pic edit

- Click on Profile
- Note the user id in the URL
- Try changing the user id to something else.

WHOA - I can see someone else's profile!!! I can see their sensitive information like favourite pizza, address!?!

- Go to user 1625 (Marcus Reid)
- Try editing the profile - WHOA!
- Try uploading a profile pic (you can use `./docs/artifacts/angry-cat.jpeg` if you'd like)
- Change Marcus' name to "Marcus is so basic" or something
- Go back to the Feed - it changed the post!


### Fake Posts

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
    - Set content to something cringey
- Post it
- Click Refresh on the feed

SEE THE FAKE POST!

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