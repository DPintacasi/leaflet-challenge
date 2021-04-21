

// function for the markers

function markerColour(depth){

    if (depth <= 10 ){
        return "green"
    }
    else if (depth > 10 && depth <= 30 ){
        return "yellow green"
    }
    else if (depth > 30 && depth <= 50 ){
        return "yellow"
    }
    else if (depth > 50 && depth <= 70 ){
        return "yellow orange"
    }
    else if (depth > 70 && depth <= 90 ){
        return "orange"
    }
    else if (depth > 90){
        return "red"
    }
    else {
        return "black"
    }
};


// adding earthquake markers
quakeMarkers = [];
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson",function(data){
    
    console.log("earthquake data:")
    console.log(data);

    var array = data.features;

    for (var i =0; i < array.length; i++){

        var location = array[i].geometry.coordinates.slice(0,2).reverse();

        var depth = array[i].geometry.coordinates[2];
        var magnitude = array[i].properties.mag;
        
        quakeMarkers.push(
            L.circle(location, {
                fillOpacity: 1,
                color: "black",
                weight: 1,
                fillColor: markerColour(depth),
                radius: magnitude*20000
            })
        );
    }; 
});

var quakeLayer = L.layerGroup(quakeMarkers);

// plates lines


d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json", function(data){
    plateMarkers = [];
    console.log("plate data:")
    console.log(data.features);

    var array = data.features;
    
    for (var i =0; i < array.length; i++){

        var rawline = array[i].geometry.coordinates;
        var line = [];

        for (var j =0; j < rawline.length; j++){
            line.push(rawline[j].reverse());
        };

        plateMarkers.push(
            L.polyline(line,{
            color: "red",
            weight : 2
            })
        );
    };

    console.log(plateMarkers)

    var plateLayer = L.layerGroup(plateMarkers);
});


//base maps


// Define variables for our tile layers
var light = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "light-v10",
  accessToken: API_KEY
});

var dark = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "dark-v10",
  accessToken: API_KEY
});

// Only one base layer can be shown at a time
var baseMaps = {
  Light: light,
  Dark: dark
};
//overlay
var overlayMaps = {
    Earthquakes: quakeLayer,
    Plates : plateLayer
  };

// Creating our initial map object
var myMap = L.map("map", {
    center: [45.52, -122.67],
    zoom: 4,
    layers: [light,quakeLayer]
  });
  
// Adding a tile layer 
// L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
// attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
// tileSize: 512,
// maxZoom: 18,
// zoomOffset: -1,
// id: "mapbox/streets-v11",
// accessToken: API_KEY
// }).addTo(myMap);

L.control.layers(baseMaps, overlayMaps).addTo(myMap);





  
  