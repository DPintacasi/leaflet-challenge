// data sources
const earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
const plateURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// create promises for eaach source
var quakePromise = d3.json(earthquakeURL).then(function(data){
    return data
});

var platePromise =d3.json(plateURL).then(function(data){
    return data
});

// promise all to use both sources at once
Promise.all([quakePromise,platePromise]).then(function(data){

    console.log(data);

    // promise all returns array of arrays
    var quakeData = data[0]; 
    var plateData = data[1];

    // create quake marker 
    var quakeMarkers = []
    var qFeatures = quakeData.features

    for (var i =0; i < qFeatures.length; i++){

        var location = qFeatures[i].geometry.coordinates.slice(0,2).reverse();
        var depth = qFeatures[i].geometry.coordinates[2];
        var magnitude = qFeatures[i].properties.mag;

        // push each marker into our array of markers
        quakeMarkers.push(
            L.circle(location, {
                fillOpacity: 1,
                color: "black",
                weight: 1,
                fillColor: markerColour(depth), //marker color function @ end
                radius: magnitude*30000
            })
        );
    }; 

    // create marker layer with array 
    var quakeLayer = L.layerGroup(quakeMarkers);

    // Use geoJSON for plate data as it is more simple
    var plateLayer = L.geoJSON(plateData.features);

    // add all info layers to "overlay maps" object to use for controls
    overlayMaps = {
        Earthquakes : quakeLayer,
        Plates : plateLayer
    };

    // create legend
    // legend code heavily leans on leaflet documentation exmaple
    // https://leafletjs.com/examples/choropleth/
    var legend = L.control({position: 'bottomright'});
    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 10, 30, 50, 70, 90],
            labels = [];
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + markerColour(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
    return div;
    };

    // Create base maps
    var satelliteTile = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/satellite-v9",
        accessToken: API_KEY
    });

    var outdoorsTile = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/outdoors-v11",
        accessToken: API_KEY
    });

    var darkTile = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/dark-v10",
        accessToken: API_KEY
    });

    // add all base maps into an object to pass into L.control later

    baseMaps = {
        Satellite : satelliteTile,
        Dark : darkTile,
        Outdoors : outdoorsTile
    };

   //initialise map
    var myMap = L.map("map", {
        center: [45.52, -122.67],
        zoom: 4,
        layers: [darkTile, quakeLayer, plateLayer] //default layers
    });

    // add control and legend
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);
    legend.addTo(myMap);

});

function markerColour(depth){

    if (depth <= 10 ){
        return "#fcde9c"
    }
    else if (depth <= 30 ){
        return "#faa476"
    }
    else if (depth <= 50 ){
        return "#f0746e"
    }
    else if (depth <= 70 ){
        return "#e34f6f"
    }
    else if (depth <= 90 ){
        return "#dc3977"
    }
    else {
        return "#b9257a"
    }
};