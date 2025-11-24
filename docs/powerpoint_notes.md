# Tech Start Security Workshop

## Slide 11

Hacking an App

Exploiting common vulnerabilities…

### Presenter Notes

Thank you Matt.
- Now gonna demonstrate exploiting those three vulnerabilities in a modern app. 
- We’ll have some discussion time to hear your thoughts and talk about how you can code your apps to prevent these.

---

## Slide 12

A typical modern app.

### Presenter Notes

Here is an example of a typical app. 
- The first box here User Device is commonly called the “Client” – this is what connects to the “Server” to download and upload files and information

Example: Open Chrome on your laptop and go to TikTok
- The Chrome browser is the client. 
You’ll see buttons, nav, logo, etc. Those are “UI” elements that are downloaded from the server. 
- When you post a video, it sends a Request to the Server and the API sends back a Response
- Other examples – when you load a feed or open someone’s profile, the Client sends Requests to the Server and the API sends back Responses

---

## Slide 13

Hacking Pizza Party

### Presenter Notes

Quick walkthrough of high-level features in the app:
- Pizza Party is a social app that lets you find the best pizza near you, and join the local pizza conversation with other pizza lovers

---

## Slide 14

Demo – Broken Access Control

### Presenter Notes

PROFILE PIC EDIT
- Show the User Profile
- Note the id in the URL
- Try changing the id to the next consecutive number - 1625
- WHOA – I can see someone else’s profile! Should be Marcus Reid
- Try editing the profile
- WHOA – I can edit someone else’s profile!
- Change the profile pic and name, Save
- Go back to the Feed and look at the latest post by Marcus


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
    - Set content to something cringey
- Post it
- Click Refresh on the feed


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

## Slide 15

Why did that work?

Broken Access Control: When there is inadequate logic to enforce access to a particular function.
For example:
API allowed a user to edit another user’s profile
API allowed a user to post as someone else

### Presenter Notes

These vulnerabilities fall under the banner of “Broken Access Control”

---

## Slide 16

### Presenter Notes

How could we prevent this? Let’s hear your ideas with Haris!

---

## Slide 17

TODO PUT SCREENSHOTS HERE: Hacked Profile and Fake Post

### Presenter Notes

How could we prevent this? Let’s hear your ideas with Haris!

---

## Slide 18

The frontend can not be trusted for implementing security checks
The backend can be accessed via the API through tools other than the client browser

Important Points

### Presenter Notes

How could we prevent this? Let’s hear your ideas with Haris!

---

## Slide 19

Demo – SQL Injection

### Presenter Notes

- Open the Search page
- Make sure the Network tab is open
- Do a search for “Una”
- Look at the request in the Network tab – it contains the SQL query in the response!
- Looks like the table is called “pizza_info” – look at the results – there’s a “name” and a “photo_url” column

Could we craft an input that would modify the SQL query to modify the data??

Search for
```sql
'; update pizza_info set name = 'YOU HAVE BEEN HACKED', photo_url = 'https://tinyurl.com/3fwfyf79'; select 1 where '1' = '
```
- Now do a Search for nothing again – all the pizza shops were changed

---

## Slide 20

How did this happen?

Injection: When data gets interpreted as code.
In this case, a query string value is being wrongly trusted and interpreted as SQL code.

### Presenter Notes

Injection happens when data can be interpreted as code. The query string value is being added to the code and then evaluated. The intention is that it’s just treated as the filter for the name.

---

## Slide 21

### Presenter Notes

How could we prevent this? Let’s hear your ideas with Haris!

---

## Slide 22

Parameterization
Not writing SQL directly (using an ORM)

SQL Injection: Best Practices

### Presenter Notes

How could we prevent this? Let’s hear your ideas with Haris!

---

## Slide 23

Parameterization

---

## Slide 24

ORM (Object-relational Mapping)

---


## Slide 26

Vulnerable Components

### Presenter Notes

Demonstrate:
- ???

---

## Slide 27

### Presenter Notes

How could we prevent this? Let’s hear your ideas with Haris!

---

## Slide 28

Important Points

---

## Slide 29

Next Steps

---