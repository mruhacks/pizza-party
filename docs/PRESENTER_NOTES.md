## Prep
- Follow instructions in `/README.md` to set up local app
- Open Firefox and go to http://localhost:3000


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

SEE THE FAKE POST!?

