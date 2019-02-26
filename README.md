# Neighborhood Map - (Full Stack Web Developer - Udacity) 

A single page application featuring a map of my neighborhood.

## Functionality:
1. Showing a map of my neighborhood (using Google Maps API)
2. Showing list of places and manage them using **`knockout`** by applying **MVVM pattern**
3. Filter places according to place **nam**e or **category**
4. Tapping on a place marker on the map shows an info window
5. Place details view appears on top of the **navigation drawer** (the data fetched from Foursquare and Flickr APIs)
6. Adding a place to favorites
7. Supports all screen sizes
8. Using material design library **MDL**

## How to run the app?:
1. Clone the repository
2. Open `index.html` in your browser

## Google Maps API:
**Google Maps API** used for:
* Rendering the map
* Rendering the markers and the info window

## Foursquare API:
All textual data that shows inside the navigation drawer such as:
* Place **description**
* Place **likes summuary**
* Place **rating**
* **Full address** of the place
* Contact information (**Phone number**)
* **Offical Url** of the place
* **Foursquare url** of the place
* Opening state of the place (**hours status**)

## Flickr API:
All photos the appears inside the navigation drawer are powered by **Flickr**.

## Filter feature:
You can filter a place by typing a part of the **place name** (case insensitive), Or you can filter according the **place category** such as you can type `shpoping` to filter all shping related places.

You can press `Escape` on the keyboard to close the navigation drawer.

## Favorites feature:
You can click on the `Heart` icon inside the info window to add a place to your favorites.

Favorites data saved in the **local storage**.
