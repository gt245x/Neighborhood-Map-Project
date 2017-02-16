var map;
var allLatlng = [];
var markerlist = [];
var resultList = [];
var infowindow;
var pos;
var userCords;
var walmartMarkerslist = [];
var allWarmartlatlng = [];
var menu = ko.observable("open");


//Locations that will be displayed once the index file is loaded.
var atlantaLocations = [
        {
            location : {lat: 33.772620, lng : -84.385561},
            name : "The Fox Theatre"
        },
        {
            location : {lat : 33.762742, lng : -84.392664},
            name : "World of Coca-Cola"
        },
        {
            location : {lat : 33.763424, lng : -84.394891},
            name : "Georgia Aquarium"
        },
        {
            location : {lat : 33.757168, lng : -84.396345},
            name : "Philips Arena"
        },
        {
            location : {lat : 33.732162, lng : -84.371335},
            name : "Zoo Atlanta"
        },
        {
            location : {lat : 33.771510, lng : -84.389311},
            name : "The Varsity"
        }
];

var locations = function(data, index) {
    var self = this;
    this.name = data.name;
    this.address = data.address;
    this.location = data.location;
    this.desc = data.desc;
    this.markerindex = ko.observable(index);
    };


var walmartData = function(data) {
    var self = this;
    this.title = ko.observable(data.title);
    this.add = ko.observable(data.address);
    this.city = ko.observable(data.city);
    this.state = ko.observable(data.state);
    this.zip = ko.observable(data.zip);
    this.phone=ko.observable(data.phone);
    this.openSundays=ko.observable(data.openSundays);
    this.id = ko.observable(data.id);
    };

var ViewModel = function() {
    var self = this;
    //Create location list to be an observable array.
    this.locationList = ko.observableArray([]);

    atlantaLocations.forEach(function(loc, index){
        self.locationList.push(new locations(loc, index));
    });

    //Filter list
    this.filterTerm = ko.observable('');

    self.filteredList = ko.computed(function(){
        if (!self.filterTerm()) {
            for (var i = 0; i < markerlist.length; i++) {
                markerlist[i].setVisible(true);
            }
         return self.locationList();
        }
        else
        {
        return ko.utils.arrayFilter(self.locationList(), function(loc){
            if (loc.name.toLowerCase().indexOf(self.filterTerm().toLowerCase()) >= 0) {
                loc.locMarker.setVisible(true)
                //markerlist[loc.markerindex()].setVisible(true);
                return true;
            } else {
                loc.locMarker.setVisible(false);
                //markerlist[loc.markerindex()].setVisible(false)
                return false;
                    }
            });
        };
    });

    //Function to handle when users clicks on filterd location. Data-bind on click for the filtered location
    this.clickedLocation = function(loc) {
        var counter = 0;
        name = loc.name;
        for (var i = 0; i < resultList.length; i++) {
            if (resultList[i].name === name) {
                counter = i;
            }
        }
        var selected_result = resultList[counter];
        if (selected_result) {
            toggleBounce(loc.locMarker);
        }
        fillcontent(selected_result, loc.locMarker);
    };

    //Function to handle when users clicks on filterd walmart location.
    this.walmartclickedLocation = function(loc) {
        var id_number = loc.id();
        var counter = 0
        var walmartmarker = 0;

        //Get counter of the walmart that was clicked
        for (var i = 0; i < walmartMarkerslist.length; i++) {
            if (walmartMarkerslist[i].id == id_number) {
                walmartmarker = counter;
            }
            else{
                counter++;
            }
        }
        var selected_walmartmarker = walmartMarkerslist[walmartmarker];
        if (selected_walmartmarker) {
            toggleBounce(selected_walmartmarker);
            }
            walmartcontent(selected_walmartmarker);
    };

    //function to open and close thumbnail nav
    this.openMenu = function() {
            if (menu()=="open") {
                document.getElementById("nav").style.webkitTransform = "translate(-100%,0)";
                document.getElementById("nav").style.position = "absolute";
                menu("close")
            }
            else
            {
                document.getElementById("nav").style.webkitTransform = "translate(0,0)";
                document.getElementById("nav").style.position = "relative";
                menu ("open");
            }
    };

    //Data for Walmart
    this.walmartlist = ko.observableArray([]);
    this.walmartFilterTerm = ko.observable("");

    //Function to help filter out walmart locations

    //Filter walmart list
    self.filteredWarmartList = ko.computed(function(){
        if (!self.walmartFilterTerm()) {
            for (var i = 0; i < walmartMarkerslist.length; i++) {
                walmartMarkerslist[i].setVisible(true);
            }
            return self.walmartlist();
        }
        else {
        return ko.utils.arrayFilter(self.walmartlist(), function(loc){
            if (loc.title().toLowerCase().indexOf(self.walmartFilterTerm().toLowerCase()) >=0) {
                for (var i = 0; i < walmartMarkerslist.length; i++) {
                    if (loc.title() === walmartMarkerslist[i].title) {
                        walmartMarkerslist[i].setVisible(true)
                    }
                    else {
                        walmartMarkerslist[i].setVisible(false)
                    }
                }
                return true;
            }
            else {
                return false;
            }
            });
        };
    });

    //Make zipCode to be ko.observable.
    self.zipCode = ko.observable('');

    //Run navigate function to get users location.
    navigate()

    // When submit button is clicked, run the ajax asyn
    self.getLocations =function() {
    //validate users zip code entry
    if ((isValidUSZip(self.zipCode()) == false)&&(self.zipCode() != ''))
         {alert("Please provide a valid US zip"); return }

        var walmartURL;
        if(self.zipCode()) {
            walmartURL = "http://api.walmartlabs.com/v1/stores?apiKey=k6hsrpsv49yhxwfn7x8w4pu6&zip=" +
            self.zipCode() +"&format=json"
        } else {
            walmartURL = "http://api.walmartlabs.com/v1/stores?apiKey=k6hsrpsv49yhxwfn7x8w4pu6&lon=" +
            (userCords.longitude.toFixed(6)) + "&lat=" +
            (userCords.latitude.toFixed(6)) + "&format=json"
        }

        $.ajax({
            type: "GET",
            url: walmartURL,
            dataType: 'jsonp',
            timeout: 1000
            }).done(function(data) {
                //console.log(data)
                    for (var key in data) {
                        var results = data[key];

                        var long = results.coordinates[0];
                        var lat = results.coordinates[1];
                        walmartlatlng = new google.maps.LatLng(lat, long);

                        walmartMarker = new google.maps.Marker({
                            position : walmartlatlng,
                            map : map,
                            title: results.name,
                            address : results.streetAddress,
                            city : results.city,
                            state: results.stateProvCode,
                            zip: results.zip,
                            phone: results.phoneNumber,
                            openSundays : results.sundayOpen,
                            id : results.no
                        });

                        // put all lat and lng in an array
                        allWarmartlatlng.push(walmartlatlng);
                        // put all walmart markers into an array
                        walmartMarkerslist.push(walmartMarker)

                        //fill content when clicked
                        walmartMarker.addListener('click', function(){
                        walmartcontent(this);
                        })

                    };
                //console.log(walmartMarkerslist[0])
                walmartMarkerslist.forEach(function(loc){
                        self.walmartlist.push(new walmartData(loc));
                });

                var bounds = new google.maps.LatLngBounds();
                for (var i = 0; i < allWarmartlatlng.length; i++ ) {
                bounds.extend (allWarmartlatlng[i]);
                }
                map.fitBounds(bounds);
            }).fail(function(){
                    alert('Walmart cannot provide any information at the moment')
            });
        return false;
        };
    };

var vm = new ViewModel();
ko.applyBindings(vm);


function initMap() {
    //creates a map object and specfies the DOM element for display.
    var center = new google.maps.LatLng(33.768933,-84.420969);
    var mapOptions = {
    zoom : 8,
    center : center,
    mapTypeControl: true,
    mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position : google.maps.ControlPosition.RIGHT_TOP
            },
    panControl: true,
    panControlOptions: {
        position: google.maps.ControlPosition.BOTTOM_LEFT
            },
    zoomControl: true,
    zoomControlOptions: {
        style: google.maps.ZoomControlStyle.LARGE,
        position: google.maps.ControlPosition.RIGHT_CENTER
    },
    scaleControl: false
    };

    //Foursquare parameters
    var clientID = 'KMZXUW1USBCBTCYVPYO1VFE4CNJU5TPUNBRYA4PZEFS1VZWO';
    var clientSecret = 'B2QDZEQVYDAPWA5ZYI3GNXN15FWGTYETZWYUICLCVP5GNS1N';

    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    infowindow = new google.maps.InfoWindow({content: "holding...."});

    // for loop to loop all over the location
    vm.locationList().forEach(function(loc){
    //atlantaLocations.forEach(function(loc){
    var locMarker= new google.maps.Marker({
        position: loc.location,
        map: map,
        name: loc.name,
        animation : google.maps.Animation.DROP,
    })
    //put all marker in markerlist
    markerlist.push(locMarker)

    //Assign each marker
    loc.locMarker = locMarker;

    var latlng = locMarker.position.toString();
    var lat = latlng.substring(latlng.indexOf("(")+1, latlng.lastIndexOf(","));
    var lng = latlng.substring(latlng.indexOf(",")+2, latlng.lastIndexOf(")"));

    //Url for foursquare
    var foursquareUrl = 'https://api.foursquare.com/v2/venues/search?ll=' + lat + ',' + lng +
                        '&client_id=' +  clientID + '&client_secret=' + clientSecret +
                        '&v=20161212' + '&query=' + locMarker.name;


    $.getJSON(foursquareUrl).done(function(data) {
        var results = data.response.venues
        var result = results[0]
        //push each result into an array
        resultList.push(result)


        //Toggle marker and open infowindow on click
        locMarker.addListener('click',function(){
        toggleBounce(locMarker);
        fillcontent(result,locMarker);
        })
        //put all lat and lng in an array
        allLatlng.push(locMarker.position)

        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < allLatlng.length; i++ ) {
        bounds.extend (allLatlng[i]);
        }
        map.fitBounds(bounds);

        }).fail(function(){
        alert("There was an error with the API call to Foursquare. Refresh and try again.")
        });
    })
};


//Function to toggle each location when clicked
function toggleBounce(marker) {
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function(){
        marker.setAnimation(null);
        }, 1400);
        }
    };

//Function to fill the selected location marker with HTML content.
function fillcontent(selected_result,marker) {
    var address, city, state, phone, url;
    !!selected_result.location.address ? address = selected_result.location.address : address = "No address available";
    !!selected_result.location.city ? city = selected_result.location.city : city = "City is not available";
    !!selected_result.location.state ? state = selected_result.location.state : city = "State is not available";
    !!selected_result.contact.formattedPhone ? phone = selected_result.contact.formattedPhone : phone = "No phone number provided";
    !!selected_result.url ? url = selected_result.url : city = "No url provided";

    var html = '<div class="markerClass">' +
                '<h1>' + selected_result.name + '</h1>' +
                '<h3>' + address + ', ' +  city + ', ' +
                selected_result.location.state + '.' + '</h3>' +
                '<p>' + 'phoneNumber: ' + phone + '</p>' + '<br>' +
                'url: ' + url
        infowindow.setContent(html);
        infowindow.open(map, marker);
    }

//Function to fill the selected walmart location marker with HTML content.
function walmartcontent(marker) {
    var title, address, city, state, zip, phone, openSun, id;
    !!marker.title ? title = marker.title : title = "No info provided on title";
    !!marker.address ? address = marker.address : city = "No address available";
    !!marker.openSundays ? openSun = marker.openSundays : openSun = "No info on Sunday hours";
    !!marker.phone ? phone = marker.phone : phone = "No phone number provided";
    !!marker.id ? id = marker.id : city = "No id provided";

    var html =
    '<div class="markerClass">' +
    '<h1>' + marker.title + '</h1>' +
    '<h3>' + address + ', ' +  marker.city + ', ' + marker.state + ' ' + marker.zip + '</h3>' +
    '<br/>' + phone +
    '<p>' + 'OpenSundays: ' + openSun + '</p>' +
    'Walmart id: ' + id +
    '</div>'
    infowindow.setContent(html);
    infowindow.open(map, marker);

}

//Function to check on zipcode validity.
function isValidUSZip(sZip) {
   return /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(sZip);
 }

//Function to get users current location.
function navigate() {
    if (navigator.geolocation) {
        function error(err) {
            //alert('ERROR(' + err.code + '):' + err.message);
            console.warn('ERROR(' + err.code + '):' + err.message);
        }
        function success(pos) {
            userCords = pos.coords;
        }
        navigator.geolocation.getCurrentPosition(success, error);
    }
    else {
        alert('Geolocation is not supported in your browser');
    }
};

//Function to alert user on error loading google map.
function googleMapError() {
    alert("Google map failed to display!!!")
}
