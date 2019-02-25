let map, foursquareClientID, foursquareClientSecret, flickrAPI, flickrSecret;
foursquareClientID = "2G4BOAVMDDTBVKZOU0WI0IBXSQOCMDTIOWZCKXS4XO1RAC0R";
foursquareClientSecret = "3UZMRJ1XEB1WDHZROFUCCIGDJCFMWPVRG5J4FFDWVDNHEV4K";

flickrAPI = "ab711a02ea13a53446a08c35408c34ce";
flickrSecret = "01bcd06c373ac055";

let imagesFolder = "img/";

function isSmallScreen() {
    return screen.width < 700;
}

function ViewModel() {
    let self = this;

    this.searchOption = ko.observable("");
    this.markers = [];

    this.favoriteClicked = function(placeId) {
        console.log(placeId);
    };

    // Update the info window to show related info of the passed 'marker'
    this.updateInfoWindow = function (marker, infoWindow) {
        if (infoWindow.marker === marker) {
            return false;
        }

        infoWindow.marker = marker;

        let basicContent = `<div>
                                <h4 class="iw_title">${marker.title}</h4>
                            </div>
                            <span><img class="place-icon" src="img/${marker.iconName}"/></span>
                            <span class="info-window-category">${marker.category}</span>`;

        let latlang = `${marker.position.lat()}, ${marker.position.lng()}`
        const placeLiked = localStorage.getItem(latlang) === "true";
        if (placeLiked) {
            basicContent += `<i id="favorite" class="fas fa-heart like liked"></i>`
        } else {
            basicContent += `<i id="favorite" class="fas fa-heart like like-disabled""></i>`
        }

        basicContent += `<div class="more-info">More Info</div>`

        infoWindow.setContent(basicContent);

        infoWindow.open(map, marker);
        infoWindow.addListener('closeclick', function () {
            infoWindow.marker = null;
        });

        $("#favorite").click(function() {
            console.log(latlang);
            if (localStorage.getItem(latlang) === "true") {
                localStorage.removeItem(latlang);
                $('#favorite').removeClass('liked').addClass('like-disabled');
            } else {
                localStorage.setItem(latlang, true);
                $('#favorite').removeClass('like-disabled').addClass('liked');
            }
        });

        $(".more-info").click(function () {
            // $('.mdl-layout').MaterialLayout.toggleDraw
            // $('.mdl-layout').MaterialLayout.toggleDrawer()
            if (!document.getElementById("drawer").classList.contains("is-visible")) {
                $( 'div[class^="mdl-layout__obfuscator"]' ).trigger( "click" );
            }
            document.getElementsByClassName("place-details")[0].style.width = "100%";
        });

        const center = new google.maps.LatLng(marker.position.lat(), marker.position.lng());
        map.panTo(center);
        return true;
    };

    // Animate the marker in-action and update the info view to points to the marker on the map
    this.animateAndUpdateInfoView = function () {
        if (isSmallScreen()) {
            self.closeNavbar();
        }

        let windowUpdated = self.updateInfoWindow(this, self.infoWindow);
        setTimeout((function () {
            this.setAnimation(null);
        }).bind(this), 900);

        this.setAnimation(google.maps.Animation.BOUNCE);

        if (windowUpdated) {
            self.showPlaceDetails(this.position, this.title);
        }
    };

    // Set InfoWindow
    this.infoWindow = new google.maps.InfoWindow({
        maxWidth: 200,
    });

    this.initializeMap = function () {
        const mapElement = document.getElementById('map');
        var mapOptions = {
            center: {lat: 41.0098674, lng: 28.9649889},
            zoom: 10,
            mapTypeControl: false
        };

        // Initialize the map object
        map = new google.maps.Map(mapElement, mapOptions);

        const bounds = new google.maps.LatLngBounds();

        for (let i = 0; i < places.length; i++) {
            this.markerTitle = places[i].title;
            this.markerLat = places[i].lat;
            this.markerLng = places[i].lng;

            // Google Maps marker setup
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
                category: places[i].category,
                iconName: places[i].icon
            });
            this.marker.setMap(map);
            this.markers.push(this.marker);
            this.marker.addListener('click', self.animateAndUpdateInfoView);
            bounds.extend(this.marker.position);
        }
        map.fitBounds(bounds);
        // map.setCenter(bounds.getCenter());
    };

    this.initializeMap();


    this.hideInfoWindow = function () {
        if (this.infoWindow != null) {
            this.infoWindow.close();
            this.infoWindow.marker = null;
        }
    };

    // This block appends our locations to a list using data-bind
    // It also serves to make the filter work
    this.filterPlaces = ko.computed(function () {
        if (this.hidePlaceDetails) {
            this.hidePlaceDetails();
        }

        this.hideInfoWindow();

        const bounds = new google.maps.LatLngBounds();
        var result = [];
        for (var i = 0; i < this.markers.length; i++) {
            var marker = this.markers[i];

            let matchTitle = marker.title.toLowerCase().includes(this.searchOption()
                .toLowerCase());
            let matchCategory = marker.category.toLowerCase().includes(this.searchOption()
                .toLowerCase());
            if (matchTitle || matchCategory) {
                marker.iconPath = imagesFolder + marker.iconName;
                result.push(marker);
                bounds.extend(marker.position);
                this.markers[i].setVisible(true);
            } else {
                this.markers[i].setVisible(false);
            }
        }

        if (result.length > 0) {
            map.fitBounds(bounds);
            map.setCenter(bounds.getCenter());
        }

        return result;
    }, this);

    this.showPlaceDetails = function(position, title) {
        document.getElementsByClassName("place-details")[0].style.width = "100%";
        if (isSmallScreen()) {
            $(".close-nav")[0].className = "close-nav fas fa-chevron-left";
        } else {
            $(".close-nav")[0].className = "close-nav fas fa-times";
        }
        $(".place-details").empty()

        $(".place-details").prepend(`<div class="place-text-info">`);
        $(".place-details").append(`<div class="place-photos">`);


        // Foresquare api to get more details about the place
        const foursquareSearchUrl = 'https://api.foursquare.com/v2/venues/search?ll=' +
            position.lat() + ',' + position.lng() + '&client_id=' + foursquareClientID +
            '&client_secret=' + foursquareClientSecret + '&query=' + title +
            '&v=20190223' + '&m=foursquare';
        $.getJSON(foursquareSearchUrl)
            .done(function (json) {

                // Get venue details by venue-id
                const foursquareVenueDetailsAPI = "https://api.foursquare.com/v2/venues/" + json.response.venues[0].id +
                    '?&client_id=' + foursquareClientID +
                    '&client_secret=' + foursquareClientSecret + '&query=' + title +
                    '&v=20190223' + '&m=foursquare';
                $.getJSON(foursquareVenueDetailsAPI)
                    .done(function (json) {
                        var response = json.response;
                        if (response != null) {
                            let venue = response.venue;
                            if (venue != null) {

                                let placeBasicInfo =
                                    `<div class="place-basic-info">
                                        <h6 class="place-title">${title}</h6>
                                     </div>`;

                                $(".place-text-info").prepend(placeBasicInfo);

                                if (venue.description != null) {
                                    $(".place-basic-info").append(`<h6 class="place-description">${venue.description}</h6>`);
                                }

                                if (venue.likes != null && venue.likes.count != null && venue.likes.count > 0) {
                                    $(".place-basic-info").append(`<div class="place-likes">${venue.likes.count}
                                        <i class="fas fa-thumbs-up"></i></div>`);
                                }

                                if (venue.rating != null) {
                                    $(".place-basic-info").append(`<div class="place-rating">${venue.rating}
                                        <i class="fas fa-star"></i></div>`);

                                    if (venue.ratingColor != null) {
                                        $(".fa-star").css('color', `#${venue.ratingColor}`);
                                    }
                                }

                                let placeExtraInfo =
                                    `<div class="place-extra-info">
                                     </div>`;
                                $(".place-text-info").append(placeExtraInfo);

                                let formattedAddress = venue.location['formattedAddress'].join(', ');
                                if (formattedAddress != null) {
                                    $(".place-extra-info").prepend(`<div class="place-location">
                                            <i class="fas fa-map-marked-alt"></i>
                                            <span>${formattedAddress}</span>
                                        </div>`);
                                }

                                if (venue.url != null) {
                                    $(".place-extra-info").append(`<div class="place-url">
                                        <i class="fas fa-globe-europe"></i>
                                        <span> <a href="${venue.url}">${venue.url}</a></span>
                                        </div>`);
                                }

                                if (venue.shortUrl != null) {
                                    $(".place-extra-info").append(`<div class="place-external-url">
                                        <i class="fab fa-foursquare"></i>
                                        <span> <a href="${venue.shortUrl}">Foresquare</a></span>
                                        </div>`);
                                }

                                if (venue.contact != null && venue.contact.formattedPhone != null) {
                                    $(".place-extra-info").append(`<div class="place-contact">
                                       <i class="fas fa-phone-volume"></i>
                                        <span>${venue.contact.formattedPhone}</span>
                                        </div>`);
                                }

                                if (venue.hours != null && venue.hours.status != null) {
                                    $(".place-extra-info").append(`<div class="place-hours-status">
                                      <i class="far fa-clock"></i>
                                        <span>${venue.hours.status}</span>
                                        </div>`);
                                }

                                $(".place-extra-info").append(`<div class="powered-by-foursquare">
                                       <span>Powered by Foursquare</span>
                                        </div>`);
                            }
                        }


                    }).fail(function () {
                        let errorElement = `<p class="place-details-foursquare-error"> An error occurred while getting place info from Foursquare!</p>`;
                        $(".place-details").prepend(errorElement);
                });

            }).fail(function () {
                let errorElement = `<p class="place-details-foursquare-error"> An error occurred while getting place info from Foursquare!</p>`;
                $(".place-details").prepend(errorElement);
        });

        // Use flickr photos API to get photos for a place
        var flickrSearchUrl = "https://api.flickr.com/services/rest/?method=flickr.photos.search" +
            "&api_key="+ flickrAPI + "&lat=" + position.lat() +
            "&lon=" + position.lng() + "&radius=0.1&radius_units=km&format=json&nojsoncallback=1";

        $.getJSON(flickrSearchUrl)
            .done(function (json) {

                if (json == null || json.stat !== "ok") {
                    let errorElement = `<p class="flickr-image-search-error"> An error occurred while getting images from flickr!</p>`;
                    $(".place-photos").append(errorElement);
                    return
                }

                if (json.photos.total < 1) {
                    let errorElement = `<p class="flickr-no-images"> Can not find any image on flickr related to this place!</p>`;
                    $(".place-photos").append(errorElement);
                    return
                }

                $(".place-photos").append(`<div class="title">Photos</div>`);
                $(".place-photos").append(`<div class="source">Powered by Flickr</div>`);

                json.photos.photo.slice(0, 10).forEach(({farm, server, id, secret}) => {
                    var url = `https://farm${farm}.staticflickr.com/${server}/${id}_${secret}.jpg`;
                    let flickrImageElement = `<img class="place-image" src=${url}>`;
                    $(".place-photos").append(flickrImageElement);      // Append the new elements
                    console.log(url);
                });

            }).fail(function () {
                // Send alert
                let errorElement = `<p class="flickr-image-search-error"> An error occurred while getting images from flickr! Try again later.</p>`;
                $(".place-details").append(errorElement);
        });
    }

    this.hidePlaceDetails = function() {
        document.getElementsByClassName("place-details")[0].style.width = "0px";

        $(".close-nav")[0].className = "close-nav fas fa-chevron-left";
    };

    this.closeNavbar = function() {
        if ($(".place-details")[0].offsetWidth > 0) {
            if (isSmallScreen()) {
                self.hidePlaceDetails();
                document.getElementById("drawer").classList.remove("is-visible");
                return
            }

            self.hidePlaceDetails();
            self.hideInfoWindow();
            return
        }

        document.getElementById("drawer").classList.remove("is-visible");
    };

    $(document).on('keyup',function(evt) {
        if (evt.which === 27 || evt.key === "Escape") {
            self.closeNavbar();
        }
    });

}

function gm_authFailure() {
    alert(
        'An Error occurred while loading the map. Please refresh the page and try again!'
    );};

function applyViewModelBinding() {
    let viewModel = new ViewModel();
    ko.applyBindings(viewModel);
}