var atlantaLocations = [
        {
            location : {lat: 33.772620, lng : -84.385561},
            name : 'The Fox theatre',
            desc : 'A former movie palace, is a performing arts venue located in Midtown Atlanta, \
                    Georgia and is the centerpiece of the Fox Theatre Historic District',
            address : '600 Peachtree Street NE, Atlanta, GA 30308'

        },
        {
            location : {lat : 33.762742, lng : -84.392664},
            name : 'World of Coca-Cola',
            desc : 'The world of Coca-Cola is a museum showcasing the history of The Coca-Cola company \
            that contains a host of entertainment areas and attractions, and is located in Atlanta, \
            Georgia at Pemberton Place',
            address : '121 Baker St NW, Atlanta, GA 30313'
        },
        {
            location : {lat : 33.763424, lng : -84.394891},
            name : 'Georgia Aquarium',
            desc : 'The Georgia Aquarium is a public aquarium in Atlanta, Georgia. It is the largest \
            aquarium in the Western Hemisphere, housing thousands of animals and representing several \
            thousand species.',
            address : '225 Baker St NW, Atlanta, GA 30313'
        },
        {
            location : {lat : 33.757168, lng : -84.396345},
            name : 'Philips Arena',
            desc : "Philips Arena is a multi-purpose indoor arena located in Atlanta, Georgia that \
            is home to the Atlanta Hawks of the National Basketball Association and the Atlanta Dream, \
            of the Women's National Basketball  Assocation",
            address : '1 Philips Dr, Atlanta, GA 30303'
        },
        {
            location : {lat : 33.732162, lng : -84.371335},
            name : 'Zoo Atlanta',
            desc : 'Zoo Atlanta is an Association of Zoos and Aquariums accredited zoological park \
            in Atlanta, Georgia. The zoo is one of four zoos in the U.S currently housing giant pandas.',
            address : '800 Cherokee Ave SE, Atlanta, GA 30315'
        },
        {
            location : {lat : 33.771510, lng : -84.389311},
            name : 'The Varsity',
            desc: 'Long-running drive-in chain serving up burgers, hot dogs, fries, shakes & other \
            American classics',
            address : '61 North Avenue NW, Atlanta, GA 30308'
        }

];

var filteredlocation = ko.observable("");

var locations = function(data) {
    var self = this;
    this.name = ko.observable(data.name);
    this.address = ko.observable(data.address);
    this.location = ko.observable(data.location);
    this.desc = ko.observable(data.desc)

    this.location_typedin = ko.computed(function(){
        if (filteredlocation().length > 0) {
            return(self.name().toLowerCase().indexOf(filteredlocation().toLowerCase()) > -1);
        }
        else {
            return true;
        }
    }, this);

    this.toggleBounce = function() {
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
    }
  };
}

var ViewModel = function() {
    var self = this;

/*    this.filterlocation = ko.observable("");*/
    this.locationList = ko.observableArray([]);

    atlantaLocations.forEach(function(loc){
        self.locationList.push(new locations(loc));
    });

    self.locationArray = ko.computed(function(){
        var list = [];
        this.locationList().forEach(function(loc){
            if (loc.location_typedin())
            {
                list.push(loc);
            }
        });
        return list;
    }, this);


    this.clickedLocation = function(loc) {
        infowindow.setContent(loc.desc);
        loc.toggleBounce();
    };

};

ko.applyBindings(new ViewModel());



var center = new google.maps.LatLng(33.768933,-84.420969);
var map;
var allLatlng = [];
var allMarkers = [];
var infowindow = new google.maps.InfoWindow();
var pos;
var userCords;
var walmartMarkers = [];
var allWarmartlatlng = [];

function initialize() {
    var mapOptions = {
    zoom : 8,
    center : center,
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

/*    infowindow = new google.maps.InfoWindow({
        content: "holding..."
    });*/
map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

for (var i = 0; i < atlantaLocations.length; i++) {
        allMarkers= new google.maps.Marker({
        position: atlantaLocations[i].location,
        map : map,
        title: atlantaLocations[i].name,
        html :
            '<div class="markerClass">' +
            '<h1>' + atlantaLocations[i].name + '</h1>' +
            '<h3>' + atlantaLocations[i].address + '</h3>' +
            '<p>' + atlantaLocations[i].desc + '</p>'

    });
    // put all lat and lng in an array
    allLatlng.push(atlantaLocations[i].location);

google.maps.event.addListener(allMarkers, 'click', function() {
    infowindow.setContent(this.html);
    infowindow.open(map, this);
});

};

var bounds = new google.maps.LatLngBounds();
for (var i = 0; i < allLatlng.length; i++ ) {
    bounds.extend (allLatlng[i]);
}
map.fitBounds(bounds);

};

google.maps.event.addDomListener(window, 'load', initialize);



// comment out the 2nd part to work on the first part first
/*$(function() {

    if (navigator.geolocation) {
        function error(err) {
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

    function isValidUSZip(sZip) {
   return /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(sZip);
    }

    $('#chooseZip').submit(function() {
        var userZip = $('#textZip').val();

  //if (isValidUSZip(userZip) == false) {alert("Please provide a valid US zip")}

        var walmartURL;
        if(userZip) {
            walmartURL = "http://api.walmartlabs.com/v1/stores?apiKey=k6hsrpsv49yhxwfn7x8w4pu6&zip=" + userZip +"&format=json"
        } else {
            walmartURL = "http://api.walmartlabs.com/v1/stores?apiKey=k6hsrpsv49yhxwfn7x8w4pu6&lon=" + (userCords.longitude.toFixed(6))
            + "&lat=" + (userCords.latitude.toFixed(6)) + "&format=json"
        }


        console.log(userCords.latitude + "," + userCords.longitude)
        console.log(walmartURL)


        $.ajax({
            type: "GET",
            url: walmartURL,
            dataType: 'jsonp',

            success:function(data) {
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
                            html:
                                '<div class="markerClass">' +
                                '<h1>' + results.name + '</h1>' +
                                '<h3>' + results.streetAddress + ', ' +  results.city + ', ' + results.stateProvCode + ' ' + results.zip + '</h3>' +
                                '<br/>' + results.phoneNumber +
                                '<p>' + 'OpenSundays: ' + results.sundayOpen + '</p>' +
                                'Walmart id: ' + results.no +
                                '</div>'

                        });

                        allWarmartlatlng.push(walmartlatlng);

                    google.maps.event.addListener(walmartMarkers, 'click', function() {
                        infowindow.setContent(this.html);
                        infowindow.open(map, this);
                    });

                    };

                    var bounds = new google.maps.LatLngBounds();
                    for (var i = 0; i < allWarmartlatlng.length; i++ ) {
                    bounds.extend (allWarmartlatlng[i]);
                    }
                    map.fitBounds(bounds);
                }
        });

    return false;
    });



});

*/