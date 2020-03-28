// Creating map object
var myMap = L.map("map", {
    center: [30,0],
    zoom: 2
});
  
// Adding tile layer
L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
maxZoom: 18,
id: "mapbox.streets",
accessToken: API_KEY
}).addTo(myMap);

var geo_url = "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json";
var covid_url = "https://pomber.github.io/covid19/timeseries.json";
var feature;

// Grabbing our GeoJSON data..
d3.json(geo_url).then(data => {
    feature = data.features
    d3.json(covid_url).then(covid_data =>{
        feature.forEach(element => {
            country_name = element.properties.name;
            if(country_name === "United States of America"){
                country_name = "US"
            }
            if (country_name in covid_data){
                country_data = covid_data[country_name].slice(-1)[0]
                element.properties["confirmed"] = country_data.confirmed
                element.properties["deaths"] = country_data.deaths
                element.properties["recovered"] = country_data.recovered
            }
            else{
                element.properties.confirmed = null
                element.properties.deaths = null
                element.properties.recovered = null
            }
        });

        var geojson;

        function getColor(d) {
            return d > 10000 ? '#800026' :
                d > 5000  ? '#BD0026' :
                d > 2000  ? '#E31A1C' :
                d > 1000  ? '#FC4E2A' :
                d > 500   ? '#FD8D3C' :
                d > 100   ? '#FEB24C' :
                d > 1   ? '#FED976' :
                            '#fff';
        };

        console.log(data)

        function style(feature) {
            return {
                fillColor: getColor(feature.properties.confirmed),
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.8
            };
        };

        function onEachFeature(feature, layer) {
            layer.bindTooltip("Country: " + feature.properties.name + "<br> Confirmed Cases: " + feature.properties.confirmed +
            "<br> Deaths: " + feature.properties.deaths + "<br> Recoveries: " + feature.properties.recovered);
        }

        geojson = L.geoJson(data, {
            style: style,
            onEachFeature: onEachFeature,

        }).addTo(myMap);
    });
});
