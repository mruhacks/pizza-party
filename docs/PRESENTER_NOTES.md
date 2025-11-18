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

WHOA - I can see someone else's profile!!!

- Go to user 1625 (Marcus Reid)
- Try editing the profile - WHOA!
- Try uploading a profile pic (you can use `./docs/artifacts/angry-cat.jpeg` if you'd like)
- Change Marcus' name to "Marcus is so basic" or something
- Go back to the Feed - it changed the post!

### Fake Posts


