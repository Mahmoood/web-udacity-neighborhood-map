let map;

// Keys related to Foursquare API
const foursquareClientID = "2G4BOAVMDDTBVKZOU0WI0IBXSQOCMDTIOWZCKXS4XO1RAC0R";
const foursquareClientSecret = "3UZMRJ1XEB1WDHZROFUCCIGDJCFMWPVRG5J4FFDWVDNHEV4K";

// Keys related to Flickr API
const flickrAPI = "ab711a02ea13a53446a08c35408c34ce";
const flickrSecret = "01bcd06c373ac055";

const imagesFolder = "img/";

/**
 * If the current screen in-action is small
 * @returns {boolean}
 */
function isSmallScreen() {
    return screen.width < 700;
}

/**
 * The view model of the app
 * @constructor
 */
function ViewModel() {
    // Pick reference of the view model to use it later inside some callbacks
    const self = this;

    // Observe changes of the search text
    this.searchText = ko.observable("");

    // List of markers
    this.markers = [];

    /**
     * Update the info window details to show related info of the passed 'marker'
     * @param marker Marker in-action
     * @param infoWindow Info window
     * @returns {boolean} True if the info window updated successfully
     */
    this.updateInfoWindow = function (marker, infoWindow) {
        // Skip if the info window is presented and shows the related info of the same marker
        if (infoWindow.marker === marker) {
            // Indicate that info window had not updated
            return false;
        }

        // Create the content of the infow window (title, place icon, place category, favorite icon, more info text)
        infoWindow.marker = marker;

        let basicContent = `<div>
                                <h4 class="info-window-title">${marker.title}</h4>
                            </div>
                            <span><img class="place-icon" src="img/${marker.iconName}"/></span>
                            <span class="info-window-category">${marker.category}</span>`;

        // The next const is the if of the place in local storage to manager adding a place to favorites
        const latlang = `${marker.position.lat()}, ${marker.position.lng()}`
        const placeLiked = localStorage.getItem(latlang) === "true";
        // Adding the related 'favorite' icon (filled with red or gray) if liked or not
        if (placeLiked) {
            basicContent += `<i id="favorite" class="fas fa-heart like liked"></i>`
        } else {
            basicContent += `<i id="favorite" class="fas fa-heart like like-disabled""></i>`
        }

        // Added 'more info' link
        basicContent += `<div class="more-info">More Info</div>`

        infoWindow.setContent(basicContent);

        // Open the infow window then attach close listener on it
        infoWindow.open(map, marker);
        infoWindow.addListener('closeclick', function () {
            infoWindow.marker = null;
        });

        // Attack click listener on favorite icon, to add / remove place from favorites
        // Favorites data stored in the local storage
        $("#favorite").click(function() {
            if (localStorage.getItem(latlang) === "true") {
                localStorage.removeItem(latlang);
                $('#favorite').removeClass('liked').addClass('like-disabled');
            } else {
                localStorage.setItem(latlang, true);
                $('#favorite').removeClass('like-disabled').addClass('liked');
            }
        });

        // Attach click listener on 'more-info' text to show the navigation drawer with more info of the place in-action
        $(".more-info").click(function () {
            const isNavigationDrawerInvisible = !document.getElementById("drawer").classList.contains("is-visible");
            if (isNavigationDrawerInvisible) {
                // Auto show of navigation drawer
                $( 'div[class^="mdl-layout__obfuscator"]' ).trigger( "click" );
            }
            // Show place details elements on top of the navigation drawer (above the places list)
            document.getElementsByClassName("place-details")[0].style.width = "100%";
        });

        // Make the marker in-action in the center of the map
        const center = new google.maps.LatLng(marker.position.lat(), marker.position.lng());
        map.panTo(center);

        // Indicate the info window updated
        return true;
    };

    /**
     * Animate the marker in-action and update the info view to points to the marker on the map
     */
    this.animateAndUpdateInfoView = function () {
        // If we have not too large screen, then close the navigation drawer.
        // So the info window appears completely
        if (isSmallScreen()) {
            self.closeNavigationDrawer();
        }

        // Update the info window to show info of the marker in-action (this),
        // and pass the reference of infoWindow (we have only one info window at a time)
        const windowUpdated = self.updateInfoWindow(this, self.infoWindow);

        // Time out to remove the animation applied on the marker
        setTimeout((function () {
            this.setAnimation(null);
        }).bind(this), 900);

        // Apply bounce animation on the marker in-action
        this.setAnimation(google.maps.Animation.BOUNCE);

        // If the info window has updated, then we need to update place's details in navigation drawer
        if (windowUpdated) {
            self.showPlaceDetails(this.position, this.title);
        }
    };

    // InfoWindow that appears on the map after clicking on a marker of a place from place list
    this.infoWindow = new google.maps.InfoWindow({
        maxWidth: 200,
    });

    /**
     * Initialize map instance
     */
    this.initializeMap = function () {
        const mapElement = document.getElementById('map');
        // Configure map options
        const mapOptions = {
            center: {lat: 41.0098674, lng: 28.9649889},
            zoom: 10,
            mapTypeControl: false
        };

        // Initialize map object using Google Maps API
        map = new google.maps.Map(mapElement, mapOptions);

        // Create bounds object to bound all markers
        const bounds = new google.maps.LatLngBounds();

        // Create list of markers
        for (let i = 0; i < places.length; i++) {
            this.markerTitle = places[i].title;
            this.markerLat = places[i].lat;
            this.markerLng = places[i].lng;

            // Create Google Maps marker instance
            this.marker = new google.maps.Marker({
                map: map,
                position: {
                    lat: this.markerLat,
                    lng: this.markerLng
                },
                title: this.markerTitle,
                lat: this.markerLat,
                lng: this.markerLng,
                id: i,
                category: places[i].category, // Add the category
                iconName: places[i].icon // Add the icon name
            });
            // Add the marker to the map
            this.marker.setMap(map);

            // Add the marker to list of markers
            this.markers.push(this.marker);

            // Attach on click listener when clicking on a marker in the map
            this.marker.addListener('click', self.animateAndUpdateInfoView);

            // Extend the bounds to take account all added markers to the map
            bounds.extend(this.marker.position);
        }

        // Make the correct zoom the fit all marker in screen
        map.fitBounds(bounds);
    };

    // Start initializing the map instance
    this.initializeMap();

    /**
     * Hide info window and remove the market attached with it
     */
    this.hideInfoWindow = function () {
        if (this.infoWindow != null) {
            this.infoWindow.close();
            this.infoWindow.marker = null;
        }
    };

    // This block appends our locations to a list using data-bind
    // It also serves to make the filter work

    /**
     * Computed observables applied when filtering a place in places list
     * This function is used by the view component in MVVM pattern
     */
    this.filterPlaces = ko.computed(function () {

        // If the 'hidePlaceDetails' attached to the view model, then call it
        // To hide place details that appears above places list
        if (this.hidePlaceDetails) {
            this.hidePlaceDetails();
        }

        // Hide info window
        this.hideInfoWindow();

        // Create bound to bounds to make sure that all filtered markers appears on the screen
        const bounds = new google.maps.LatLngBounds();

        // Holds all filtered markers (places) that match the applied filter
        const result = [];

        for (let i = 0; i < this.markers.length; i++) {
            const marker = this.markers[i];

            // The filter applies of the name of the place and the category
            // So we can search for 'shopping' or the partial name of the place
            let matchTitle = marker.title.toLowerCase().includes(this.searchText()
                .toLowerCase());
            let matchCategory = marker.category.toLowerCase().includes(this.searchText()
                .toLowerCase());
            if (matchTitle || matchCategory) {
                marker.iconPath = imagesFolder + marker.iconName;
                result.push(marker);
                // Extends the bound to take account the filtered marker
                bounds.extend(marker.position);
                // Show the marker
                this.markers[i].setVisible(true);
            } else {
                // Hide the marker if it does not meets the filter conditions
                this.markers[i].setVisible(false);
            }
        }

        // If we have filtered markers then change make the map fits all found marker
        if (result.length > 0) {
            map.fitBounds(bounds);
            map.setCenter(bounds.getCenter());
        }

        return result;
    }, this);

    /**
     * Show place details
     *
     * Place details appears above the place list in the navigation drawer
     *
     * @param position Geo-location of the place to get more details about
     * @param title  Title of the place
     */
    this.showPlaceDetails = function(position, title) {
        // Show place details element
        document.getElementsByClassName("place-details")[0].style.width = "100%";

        // Show hide navigation drawer icon on small screens to make more room
        if (isSmallScreen()) {
            $(".close-nav")[0].className = "close-nav fas fa-chevron-left";
        }
        // Show close place details icon on larger screens
        else {
            $(".close-nav")[0].className = "close-nav fas fa-times";
        }

        // Clear place details element and populate it with fresh data
        $(".place-details").empty()

        // Place details contains two sections (textual and photos
        $(".place-details").prepend(`<div class="place-text-info">`);
        $(".place-details").append(`<div class="place-photos">`);

        // Get all info related with the first section (textual info) from Foursquare
        // Foursquare api to get more details about the place
        const foursquareSearchUrl = 'https://api.foursquare.com/v2/venues/search?ll=' +
            position.lat() + ',' + position.lng() + '&client_id=' + foursquareClientID +
            '&client_secret=' + foursquareClientSecret + '&query=' + title +
            '&v=20190223' + '&m=foursquare';

        // Async call to get info from Foursquare
        $.getJSON(foursquareSearchUrl)
            .done(function (json) {

                // Fire a nested call to get venue details by venue-id
                const foursquareVenueDetailsAPI = "https://api.foursquare.com/v2/venues/" + json.response.venues[0].id +
                    '?&client_id=' + foursquareClientID +
                    '&client_secret=' + foursquareClientSecret + '&query=' + title +
                    '&v=20190223' + '&m=foursquare';
                $.getJSON(foursquareVenueDetailsAPI)
                    .done(function (json) {

                        const response = json.response;
                        if (response != null) {
                            let venue = response.venue;
                            if (venue != null) {

                                // Build the basic info element which is the first part of the textual info
                                let placeBasicInfo =
                                    `<div class="place-basic-info">
                                        <h6 class="place-title">${title}</h6>
                                     </div>`;

                                $(".place-text-info").prepend(placeBasicInfo);

                                // Add the description of the place if exists
                                if (venue.description != null) {
                                    $(".place-basic-info").append(`<h6 class="place-description">${venue.description}</h6>`);
                                }

                                // Add likes data of the place if exists
                                if (venue.likes != null && venue.likes.count != null && venue.likes.count > 0) {
                                    $(".place-basic-info").append(`<div class="place-likes">${venue.likes.count}
                                        <i class="fas fa-thumbs-up"></i></div>`);
                                }

                                // Add the rating of the place if exists
                                if (venue.rating != null) {
                                    $(".place-basic-info").append(`<div class="place-rating">${venue.rating}
                                        <i class="fas fa-star"></i></div>`);

                                    if (venue.ratingColor != null) {
                                        $(".fa-star").css('color', `#${venue.ratingColor}`);
                                    }
                                }

                                // Add the extra textual info which contains contact info, url, ...
                                let placeExtraInfo =
                                    `<div class="place-extra-info">
                                     </div>`;
                                $(".place-text-info").append(placeExtraInfo);

                                // Add the address of the place if exists
                                let formattedAddress = venue.location['formattedAddress'].join(', ');
                                if (formattedAddress != null) {
                                    $(".place-extra-info").prepend(`<div class="place-location">
                                            <i class="fas fa-map-marked-alt"></i>
                                            <span>${formattedAddress}</span>
                                        </div>`);
                                }

                                // Add the url of the place if exists
                                if (venue.url != null) {
                                    $(".place-extra-info").append(`<div class="place-url">
                                        <i class="fas fa-globe-europe"></i>
                                        <span> <a href="${venue.url}">${venue.url}</a></span>
                                        </div>`);
                                }

                                // Add foursquare url of the place if exists
                                if (venue.shortUrl != null) {
                                    $(".place-extra-info").append(`<div class="place-external-url">
                                        <i class="fab fa-foursquare"></i>
                                        <span> <a href="${venue.shortUrl}">Foursquare</a></span>
                                        </div>`);
                                }

                                // Add contact info (phone number) of the place if exists
                                if (venue.contact != null && venue.contact.formattedPhone != null) {
                                    $(".place-extra-info").append(`<div class="place-contact">
                                       <i class="fas fa-phone-volume"></i>
                                        <span>${venue.contact.formattedPhone}</span>
                                        </div>`);
                                }

                                // Add the availability status of the place if exists
                                if (venue.hours != null && venue.hours.status != null) {
                                    $(".place-extra-info").append(`<div class="place-hours-status">
                                      <i class="far fa-clock"></i>
                                        <span>${venue.hours.status}</span>
                                        </div>`);
                                }

                                // Add element represent the original source of the textual info
                                $(".place-extra-info").append(`<div class="powered-by-foursquare">
                                       <span>Powered by Foursquare</span>
                                        </div>`);
                            }
                        }

                    }).fail(function () {
                        // Error handler of venue detail from foursquare
                    const errorElement = `<p class="place-details-foursquare-error"> An error occurred while getting place info from Foursquare!</p>`;
                        $(".place-details").prepend(errorElement);
                });

            }).fail(function () {
                // Error handler of place api from foursquare
                const errorElement = `<p class="place-details-foursquare-error"> An error occurred while getting place info from Foursquare!</p>`;
                $(".place-details").prepend(errorElement);
        });

        // The second part of info in place details is the photos
        // Use flickr photos API to get photos for the place in-action
        const flickrSearchUrl = "https://api.flickr.com/services/rest/?method=flickr.photos.search" +
            "&api_key="+ flickrAPI + "&lat=" + position.lat() +
            "&lon=" + position.lng() + "&radius=0.1&radius_units=km&format=json&nojsoncallback=1";

        // Make asyn call to get photos from flickr related to the place in-action
        $.getJSON(flickrSearchUrl)
            .done(function (json) {

                // If there is an issue with getting the image, then show error to the user in the DOM
                if (json == null || json.stat !== "ok") {
                    const errorElement = `<p class="flickr-image-search-error"> An error occurred while getting images from flickr!</p>`;
                    $(".place-photos").append(errorElement);
                    return
                }

                // If there are no images, then show error to the user in the DOM
                if (json.photos.total < 1) {
                    let errorElement = `<p class="flickr-no-images"> Can not find any image on flickr related to this place!</p>`;
                    $(".place-photos").append(errorElement);
                    return
                }

                // Add 'photos' world title
                $(".place-photos").append(`<div class="title">Photos</div>`);
                // Add 'Powered by Flickr' world to indicate the source of the photos
                $(".place-photos").append(`<div class="source">Powered by Flickr</div>`);

                // Pick to top 10 images then add them to the DOM
                json.photos.photo.slice(0, 10).forEach(({farm, server, id, secret}) => {
                    // Construct the photo's url
                    const url = `https://farm${farm}.staticflickr.com/${server}/${id}_${secret}.jpg`;
                    // Construct the photo img element then add it to the DOM
                    const flickrImageElement = `<img class="place-image" src=${url}>`;
                    $(".place-photos").append(flickrImageElement);      // Append the new elements
                });

            }).fail(function () {
                // An error handler if an error occurred while trying to get photos from Flickr
                let errorElement = `<p class="flickr-image-search-error"> An error occurred while getting images from flickr! Try again later.</p>`;
                $(".place-details").append(errorElement);
        });
    }

    /**
     * Hide place details which removes the place details elements from top of the places list in navigation drawer
     * and show 'Hide' icon instead of 'close' icon in the navigation drawer.
     */
    this.hidePlaceDetails = function() {
        document.getElementsByClassName("place-details")[0].style.width = "0px";

        // Replace the 'close' icon with 'hide' one
        $(".close-nav")[0].className = "close-nav fas fa-chevron-left";
    };

    /**
     * Close navigation drawer
     * The navigation drawer shows the place details above the places list
     *
     * If place details is shown on small screen, then both the view details and the drawer will disappear
     * If place details is shown on larger screen, then both the view details and the info window will disappear
     * If place details is hidden, then hide the navigation drawer
     */
    this.closeNavigationDrawer = function() {
        if ($(".place-details")[0].offsetWidth > 0) {
            // If place details is shown on small screen, then both the view details and the drawer will disappear
            if (isSmallScreen()) {
                self.hidePlaceDetails();
                document.getElementById("drawer").classList.remove("is-visible");
                return
            }
            // If place details is shown on larger screen, then both the view details and the info window will disappear
            self.hidePlaceDetails();
            self.hideInfoWindow();
            return
        }
        // If place details is hidden, then hide the navigation drawer
        document.getElementById("drawer").classList.remove("is-visible");
    };

    /**
     * Pressing on the Escape key hides the navigation drawer
     */
    $(document).on('keyup',function(evt) {
        if (evt.which === 27 || evt.key === "Escape") {
            self.closeNavigationDrawer();
        }
    });

}

/**
 * Error handler of loading the Google Maps Resource
 */
function gmErrorHandler() {
    alert('An Error occurred while loading the map. Please refresh the page and try again!');
}

/**
 * Create an instance of the view model and apply binding using knockout
 */
function applyViewModelBinding() {
    let viewModel = new ViewModel();
    ko.applyBindings(viewModel);
}