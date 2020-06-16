# Glitch Websocket chat app

An example using Websockets to allow the Server to broadcast messages to a group of clients.

## Things to notice

"Broadcasting" here is just sending the same message to every client that is connected 
(you can see this in server.js)

There are two html files (just like our postcard app).  The user who starts the app at index.hmtl is the 
first one to join the chat, and later ones should start at client.html. 

Messages are sent to the Server from the browser code - not as HTTP requests! - 
by calling "connection.send"

## Authors

Mainly Michael Tianchen Sun, with a little messing about by Nina Amenta

## Made on [Glitch](https://glitch.com/)

**Glitch** is the friendly community where you'll build the app of your dreams. Glitch lets you instantly create, remix, edit, and host an app, bot or site, and you can invite collaborators or helpers to simultaneously edit code with you.

Find out more [about Glitch](https://glitch.com/about).

( ᵔ ᴥ ᵔ )


------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Amenta pointed out that the yelp API doesn't give restaurant descriptions in the search response, as such I updated the mobile views to show the address instead of a description. I thought about including hours or if the restaurant is currently open, but those both require a separate API call so I left them off. Please take a look at the new mobile views and implement that version in your projects.  


------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Doesn't have to wait for every small round - can speed to 


Technical spec
- express
- Web socket
- DB
- Yelp API DB 
- Axios


how do clients/players get a restaurant like picture, rating, price etc ? 

From database where you input the result of the return from YELP search API. , you can just send all the clients a JSON object 

ok, so we send list of restaurants to clients in beginning of game, so every player has same copy - send them as game goes along

Wouldn’t it be faster to send all the restaurants to the client and save them all in the db and additional row for voteCount? 
Updating voteCount per round and goes on? 

I only sent the restaurant active for voting to clients, Like a pair. 

How can you keep track of voting counts for the restaurants then? 
you don't really need to keep the votes right, you just need to know which one wins 


 
 
 
 
 
 1. Home Page (for the Host)
- Start new game (button)
-> Link to share (+random number()) / Search Control

2. Search Control (for the Host)
- two input boxes:  location, keywords
- keywords: auto completeion
- Get restaurants (button)

3. Get restaurants
- get 20 restaurants & info (yelp rating, number of reviews, price range, name, picture) from Yelp API
- save it into app server database (optional) / add column for swipeCount val = 0 by default  and reset to 0 for every round (or each restaurant object + column for swipeCount)

4. Player Page (for the host, players)
- display restaurant & info in random order from the server database
Q: What does it mean to display ‘number of times it has been chosen’ in the player page window?
- Swiper (swipe left for Yes, swipe right for no)
-> swipe right does nothing
-> swipe left updates the swipeCount val for each restaurant in database
-> at the end of every round of total five rounds unless there is absolute tie before the fifth round, check the swipe Count 
-> 
// Add variable conditions for the case of tie occurrences and especially, when it occurs before the fifth round

if swipeCount == #players
	if more than one restaurant
		random pick
	else
		return restaurant // update Player Page with new info! Restaurant chosen
    
If swipeCount == 0 
	delete restaurant from the list

If swipeCount == min(swipeCount in restaurants)
	if more than one restaurant 
	delete restaurant from the list  // run twice so that we can delete two minimum count restaurants for each round

5. Restaurant chosen page
- update the player page with the chosen restaurant (== max swipeCount, if there a few candidates, chosen randomly)

