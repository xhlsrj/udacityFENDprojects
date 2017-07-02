const POSITIONS = {
    'Phuket International Airport': { lat: 8.1110951, lng: 98.3064646 },
    'Grand West Sands Resort & Villas Phuket': { lat: 8.115958, lng: 98.3037043 },
    'The Residence Resort & Spa Retreat': { lat: 7.988528, lng: 98.297206 },
    'Ayara Hotel Resort & Spa': { lat: 7.943127, lng: 98.263497 },
    'Outrigger Laguna Phuket Beach Resort': { lat: 7.996417, lng: 98.293178 },
    'Chandara Resort & Spa': { lat: 8.065962, lng: 98.440314 },
    'Millennium Resort Patong Phuket': { lat: 7.892011, lng: 98.298702 },
    'The Kiri Villas Resort': { lat: 8.014185, lng: 98.327208 },
    'Hyatt Regency Phuket Resort': { lat: 7.947164, lng: 98.270861 },
    'B-Lay Tong Phuket': { lat: 7.905666, lng: 98.297687 },
    'IKEA': { lat: 7.936870, lng: 98.378559 },
    'Super Cheap Market': { lat: 7.921242, lng: 98.395070 },
    'UNIQLO': { lat: 7.904855, lng: 98.368847 },
    'Wichit': { lat: 7.872931, lng: 98.361936 },
    // 'Canal Village Laguna Shopping': { lat: 8.001712, lng: 98.295999 },
    'The Plaza Surin': { lat: 7.976432, lng: 98.284083 },
    'Banana Walk Shopping Mall': { lat: 7.892648, lng: 98.294594 },
    'Ocean Shopping Mall': { lat: 7.879449, lng: 98.394309 },
    'Jungceylon': { lat: 7.891058, lng: 98.299534 },
    'Central Festival Phuket': { lat: 7.891937, lng: 98.368228 },
    'Royal Paradise Night Market': { lat: 7.895212, lng: 98.298999 },
    // 'Robinson': { lat: 7.890711, lng: 98.300228 },
    'Big C Phuket': { lat: 7.895944, lng: 98.367392 },
    'Turtle Village': { lat: 8.168835, lng: 98.299024 },
    'Patong OTop night market': { lat: 7.887978, lng: 98.295709 },
    'Limelight Avenue Phuket': { lat: 7.886383, lng: 98.391735 }
};
const POSITION_FILTER = {
    'Phuket International Airport': 3,
    'Grand West Sands Resort & Villas Phuket': 1,
    'The Residence Resort & Spa Retreat': 1,
    'Ayara Hotel Resort & Spa': 1,
    'Outrigger Laguna Phuket Beach Resort': 1,
    'Chandara Resort & Spa': 1,
    'Millennium Resort Patong Phuket': 1,
    'The Kiri Villas Resort': 1,
    'Hyatt Regency Phuket Resort': 1,
    'B-Lay Tong Phuket': 1,
    'IKEA': 2,
    'Super Cheap Market': 2,
    'UNIQLO': 2,
    'Wichit': 2,
    // 'Canal Village Laguna Shopping': 2,
    'The Plaza Surin': 2,
    'Banana Walk Shopping Mall': 2,
    'Ocean Shopping Mall': 2,
    'Jungceylon': 2,
    'Central Festival Phuket': 2,
    'Royal Paradise Night Market': 2,
    // 'Robinson': 2,
    'Big C Phuket': 2,
    'Turtle Village': 2,
    'Patong OTop night market': 2,
    'Limelight Avenue Phuket': 2
};

// function $id(id) {
//     return document.getElementById(id);
// }

function initMap() {
    const Phuket = { lat: 7.9665322, lng: 98.3599288 };
    window.map = new google.maps.Map(document.getElementById('map'), {
        center: Phuket,
        zoom: 11,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DEFAULT,
            position: google.maps.ControlPosition.RIGHT_TOP
        },
        fullscreenControl: false
    });

    window.infowindow = new google.maps.InfoWindow();
    infowindow.addListener('closeclick', function() {
        markers.forEach(element => element.marker.setIcon());
    })
    let markers = [];
    for (let key in POSITIONS) {
        if (POSITIONS.hasOwnProperty(key)) {
            let marker = new google.maps.Marker({
                map: map,
                position: POSITIONS[key],
                title: key
            });
            marker.addListener('click', function() {
                // markers.forEach(element => element.marker.setIcon());
                // // this.setAnimation(google.maps.Animation.BOUNCE);
                // this.setIcon('https://maps.google.com/mapfiles/ms/icons/purple-dot.png');
                // infowindow.setContent(key);
                // infowindow.open(map, marker);
                // openInfoWindow(markers, marker, infowindow, map);
                openInfoWindow(markers, marker, map);
            });

            markers.push({
                name: key,
                type: POSITION_FILTER[key],
                marker: marker
                    // infowindow: infowindow,
                    // map: map
            });
        }
    }
    window.pvm = new PositionViewModel(markers);
    ko.applyBindings(pvm);
}

function PositionViewModel(markers) {
    let self = this;

    self.filter = [
        { text: 'all', value: 0 },
        { text: 'hotels', value: 1 },
        { text: 'markets', value: 2 }
    ];
    self.selectedFilter = ko.observable();
    self.positions = ko.observableArray(markers.map(
        element => {
            element.filter = ko.computed(
                () => (!self.selectedFilter() || self.selectedFilter() === element.type)
            );
            return element;
        }
    ));

    self.filterMarkers = ko.computed(function() {
        self.positions().forEach(
            element => {
                if (element.filter()) {
                    element.marker.setMap(map);
                } else {
                    element.marker.setMap(null);
                }
            }
        );
    });

    self.showInfoWindow = function() {
        // self.positions().forEach(element => element.marker.setIcon());
        // this.marker.setIcon('https://maps.google.com/mapfiles/ms/icons/purple-dot.png');
        // this.infowindow.setContent(this.name);
        // this.infowindow.open(this.map, this.marker);
        // openInfoWindow(self.positions(), this.marker, this.infowindow, this.map);
        openInfoWindow(self.positions(), this.marker);
    };
    self.selectedMarker = ko.observable();
}

// function openInfoWindow(markers, marker, infowindow, map) {
function openInfoWindow(markers, marker) {
    markers.forEach(element => element.marker.setIcon());
    marker.setIcon('https://maps.google.com/mapfiles/ms/icons/purple-dot.png');
    // getInfoWindowContent(undefined, marker, infowindow, map);
    pvm.selectedMarker(marker);
    getInfoWindowContent(null, marker);
    // infowindow.setContent(pvm.infowindowContent());
    // infowindow.open(map, marker);
}

function getInfoWindowContent(json, marker) {
    // let xhr = new XMLHttpRequest();
    // xhr.open('GET', 'http://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=Phuket International Airport', true);
    // xhr.onreadystatechange = function() {
    //     if (xhr.readyState === 4 && xhr.status === 200) {
    //         console.log(xhr.responseText);
    //     }
    // };
    // xhr.send();
    if (marker !== undefined) {
        let script = document.createElement('script');
        script.src = 'http://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=' + marker.title + '&callback=getInfoWindowContent';
        document.body.appendChild(script);
    } else {
        let str = '<h6>' + json[0] + '</h6>';
        if (0 < json[2].length) {
            str += '<p>' + json[2][0] + '</p>';
        }
        // pvm.infowindowContent(str);
        // infowindow.setContent(pvm.infowindowContent());
        infowindow.setContent(str);
        infowindow.open(map, pvm.selectedMarker());
    }
}