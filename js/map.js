var map;
var allLatlng = [];
var markerlist = [];
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
            name : "The Fox theatre",
            desc : "A former movie palace, is a performing arts venue located in Midtown Atlanta, \
                    Georgia and is the centerpiece of the Fox Theatre Historic District",
            address : "600 Peachtree Street NE, Atlanta, GA 30308"

        },
        {
            location : {lat : 33.762742, lng : -84.392664},
            name : "World of Coca-Cola",
            desc : "The world of Coca-Cola is a museum showcasing the history of The Coca-Cola company \
            that contains a host of entertainment areas and attractions, and is located in Atlanta, \
            Georgia at Pemberton Place",
            address : "121 Baker St NW, Atlanta, GA 30313"
        },
        {
            location : {lat : 33.763424, lng : -84.394891},
            name : "Georgia Aquarium",
            desc : "The Georgia Aquarium is a public aquarium in Atlanta, Georgia. It is the largest \
            aquarium in the Western Hemisphere, housing thousands of animals and representing several \
            thousand species.",
            address : "225 Baker St NW, Atlanta, GA 30313"
        },
        {
            location : {lat : 33.757168, lng : -84.396345},
            name : "Philips Arena",
            desc : "Philips Arena is a multi-purpose indoor arena located in Atlanta, Georgia that \
            is home to the Atlanta Hawks of the National Basketball Association and the Atlanta Dream, \
            of the Women's National Basketball  Assocation",
            address : "1 Philips Dr, Atlanta, GA 30303"
        },
        {
            location : {lat : 33.732162, lng : -84.371335},
            name : "Zoo Atlanta",
            desc : "Zoo Atlanta is an Association of Zoos and Aquariums accredited zoological park \
            in Atlanta, Georgia. The zoo is one of four zoos in the U.S currently housing giant pandas.",
            address : "800 Cherokee Ave SE, Atlanta, GA 30315"
        },
        {
            location : {lat : 33.771510, lng : -84.389311},
            name : "The Varsity",
            desc: "Long-running drive-in chain serving up burgers, hot dogs, fries, shakes & other \
            American classics",
            address : "61 North Avenue NW, Atlanta, GA 30308"
        }
];

var locations = function(data, index) {
    var self = this;
    this.name = data.name;
    this.address = data.address;
    this.location = data.location;
    this.desc = data.desc;
    this.markerindex = ko.observable(index);


}


var walmartdata = function(data) {
    var self = this;
    this.title = ko.observable(data.title);
    this.add = ko.observable(data.address);
    this.city = ko.observable(data.city);
    this.state = ko.observable(data.state);
    this.zip = ko.observable(data.zip);
    this.phone=ko.observable(data.phone);
    this.openSundays=ko.observable(data.openSundays);
    this.id = ko.observable(data.id);

}

var ViewModel = function() {


    //Create location list to be an observable array.
    this.locationList = ko.observableArray([]);

    atlantaLocations.forEach(function(loc, index){
        this.locationList.push(new locations(loc, index));
    }.bind(this));

    //Filter list
    this.filterTerm = ko.observable("");

    this.filteredList = ko.computed(function(){
        if (!this.filterTerm()) {
            return this.locationList();
        }else {
        return ko.utils.arrayFilter(this.locationList(), function(loc){
            return loc.name.toLowerCase().indexOf(this.filterTerm().toLowerCase()) >=0;
            });
        };
    }.bind(this));


    //Filter markers (Need to figure out how to locate the markers)
    this.filtermarkers = ko.computed(function() {
        return ko.utils.arrayFilter(this.locationList(), function(loc){
            if (loc.name.toLowerCase().indexOf(this.filterTerm().toLowerCase()) >= 0) {
                //console.log("test")
                //loc.allMarkers.setVisible(false)
            }else  {
                //loc.allMarkers.setVisible(true)
            }
        }.bind(this));
    }.bind(this));


    //Function to handle when users clicks on filterd location. Data-bind on click for the filtered location
    this.clickedLocation = function(loc) {
        var selected_marker = markerlist[loc.markerindex()];
        if (selected_marker) {
            toggleBounce(selected_marker);
        }
        fillcontent(selected_marker);
        console.log(loc.markerindex())
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

    //Filter list
    this.filteredWarmartList = ko.computed(function(){
        if (!this.walmartFilterTerm()) {
            return this.walmartlist();
        }else {
        return ko.utils.arrayFilter(this.walmartlist(), function(loca){
            return loca.name.toLowerCase().indexOf(this.walmartFilterTerm().toLowerCase()) >=0;
            }.bind(this));
        };
    }.bind(this));

//Make zipCode to be ko.observable.
this.zipCode = ko.observable('');

//Run navigate function to get users location.
navigate()

// When submit button is clicked, run the ajax asyn
this.getLocations =function() {

    //validate users zip code entry
  if ((isValidUSZip(this.zipCode()) == false)&&(this.zipCode() != ''))
         {alert("Please provide a valid US zip"); return }

        var walmartURL;
        if(this.zipCode()) {
            walmartURL = "http://api.walmartlabs.com/v1/stores?apiKey=k6hsrpsv49yhxwfn7x8w4pu6&zip=" +
            this.zipCode() +"&format=json"
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

                        walmartMarkers = new google.maps.Marker({
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
                        walmartMarkerslist.push(walmartMarkers)

                        //fill content when clicked
                        walmartMarkers.addListener('click', function(){
                        walmartcontent(this);
                        }.bind(this))

                    };
                    //console.log(walmartMarkerslist[0])
                        walmartMarkerslist.forEach(function(loc){
                        this.walmartlist.push(new walmartdata(loc));
                    }.bind(this));

                    var bounds = new google.maps.LatLngBounds();
                    for (var i = 0; i < allWarmartlatlng.length; i++ ) {
                    bounds.extend (allWarmartlatlng[i]);
                    }
                    map.fitBounds(bounds);
                }.bind(this)).fail(function(){
                    alert('Walmart cannot provide any information at the moment')
                });
    return false;
    }.bind(this);
};




function initialize() {
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

map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
infowindow = new google.maps.InfoWindow({content: "holding...."});

// for loop to loop all over the location
for (var i = 0; i < atlantaLocations.length; i++) {
        allMarkers= new google.maps.Marker({
        position: atlantaLocations[i].location,
        map : map,
        title: atlantaLocations[i].name,
        address: atlantaLocations[i].address,
        desc: atlantaLocations[i].desc,
        animation: google.maps.Animation.DROP,
    });
    // put all lat and lng in an array
    markerlist.push(allMarkers)
    allLatlng.push(atlantaLocations[i].location);

    //fill content when clicked
    allMarkers.addListener('click', function(){
        fillcontent(this);
    })

};

var bounds = new google.maps.LatLngBounds();
for (var i = 0; i < allLatlng.length; i++ ) {
    bounds.extend (allLatlng[i]);
}
map.fitBounds(bounds);

ko.applyBindings(new ViewModel());
};


//Function to toggle each location when clicked
function toggleBounce(marker) {
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function(){
        marker.setAnimation(null);
      }, 3000);
    }
  };

//Function to fill the selected location marker with HTML content.
function fillcontent(marker) {
    var html =
        '<div class="markerClass">' +
        '<h1>' + marker.title + '</h1>' +
        '<h3>' + marker.address + '</h3>' +
        '<p>' + marker.desc + '</p>'
        infowindow.setContent(html);
        infowindow.open(map, marker);
        }

//Function to fill the selected walmart location marker with HTML content.
function walmartcontent(marker) {
    var html =
    '<div class="markerClass">' +
    '<h1>' + marker.title + '</h1>' +
    '<h3>' + marker.address + ', ' +  marker.city + ', ' + marker.state + ' ' + marker.zip + '</h3>' +
    '<br/>' + marker.phone +
    '<p>' + 'OpenSundays: ' + marker.openSundays + '</p>' +
    'Walmart id: ' + marker.id +
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
