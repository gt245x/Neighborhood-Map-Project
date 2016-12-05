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
            desc : "Philips Arena is a multi-purpose indooe arena located in Atlanta, Georgia that \
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

]

var locations = function(data) {
    this.name = ko.observable(data.name);
    this.address = ko.observable(data.address);
    this.location = ko.observable(data.location);
    this.desc = ko.observable(data.desc)
}

var x = 33.768933;
var y = -84.420969;
var center = new google.maps.LatLng(x,y);
var map;

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
map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
};

google.maps.event.addDomListener(window, 'load', initialize);
