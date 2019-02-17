let map, foursquareClientID, foursquareClientSecret;
foursquareClientID = "2G4BOAVMDDTBVKZOU0WI0IBXSQOCMDTIOWZCKXS4XO1RAC0R";
foursquareClientSecret = "3UZMRJ1XEB1WDHZROFUCCIGDJCFMWPVRG5J4FFDWVDNHEV4K";

function ViewModel() {
    let self = this;

    this.searchOption = ko.observable("");
    this.markers = [];

    // Update the info window to show related info of the passed 'marker'
    this.updateInfoWindow = function (marker, infoWindow) {
        if (infoWindow.marker === marker) {
            return;
        }

        infoWindow.marker = marker;

        const apiUrl = 'https://api.foursquare.com/v2/venues/search?ll=' +
            marker.lat + ',' + marker.lng + '&client_id=' + foursquareClientID +
            '&client_secret=' + foursquareClientSecret + '&query=' + marker.title +
            '&v=20170708' + '&m=foursquare';

        let basicContent = `<div>
                                <h4 class="iw_title">${marker.title}</h4>
                            </div>
                            <span><img class="place-icon" src="img/${marker.iconName}"/></span>
                            <span class="info-window-category">${marker.category}</span>`;
        infoWindow.setContent(basicContent);

        $.getJSON(apiUrl)
            .done(function (json) {
                const venue = json.response.venues[0];
                let formattedAddress = venue.location['formattedAddress'].join(', ');

                self.address =
                    `<div>
                    <h6 class="iw_address_title"> Address: </h6>
                    <p class="iw_address">${formattedAddress}</p>
                </div>`;

                infoWindow.setContent(basicContent + self.address);
            }).fail(function () {
            // Send alert
            alert(
                "There was an issue loading the Foursquare API. Please refresh your page to try again."
            );
        });

        infoWindow.open(map, marker);
        infoWindow.addListener('closeclick', function () {
            infoWindow.marker = null;
        });
    };

    // Animate the marker in-action and update the info view to points to the marker on the map
    this.animateAndUpdateInfoView = function () {
        self.updateInfoWindow(this, self.infoWindow);
        this.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout((function () {
            this.setAnimation(null);
        }).bind(this), 900);
    };

    this.initMap = function () {
        const mapElement = document.getElementById('map');
        var mapOptions = {
            center: {lat: 41.0098674, lng: 28.9649889},
            zoom: 10
        };

        // Initialize the map object
        map = new google.maps.Map(mapElement, mapOptions);

        const bounds = new google.maps.LatLngBounds();

        // Set InfoWindow
        this.infoWindow = new google.maps.InfoWindow({
            maxWidth: 200,
        });
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
                animation: google.maps.Animation.DROP,
                category: places[i].category,
                iconName: places[i].icon
            });
            this.marker.setMap(map);
            this.markers.push(this.marker);
            this.marker.addListener('click', self.animateAndUpdateInfoView);
            bounds.extend(this.marker.position);
        }
        map.fitBounds(bounds);

    };

    this.initMap();

    // This block appends our locations to a list using data-bind
    // It also serves to make the filter work
    this.placesFilter = ko.computed(function () {
        var result = [];
        for (var i = 0; i < this.markers.length; i++) {
            var marker = this.markers[i];
            if (marker.title.toLowerCase().includes(this.searchOption()
                .toLowerCase())) {
                result.push(marker);
                this.markers[i].setVisible(true);
            } else {
                this.markers[i].setVisible(false);
            }
        }
        return result;
    }, this);
}

mapsErrorHandler = function googleError() {
    alert(
        'An Error occurred while loading the map. Please refresh the page and try again!'
    );
};

function applyViewModelBinding() {
    let viewModel = new ViewModel();
    ko.applyBindings(viewModel);
}