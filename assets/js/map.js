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
            } else if(country_name === "South Korea") {
                country_name = "Korea, South"
            };
            
            if (country_name in covid_data){
                country_data = covid_data[country_name].slice(-1)[0]
                element.properties["date"] = country_data.date
                element.properties["confirmed"] = country_data.confirmed
                element.properties["deaths"] = country_data.deaths
                element.properties["recovered"] = country_data.recovered
                country_data2 = covid_data[country_name].slice(-2)[0]
                change = country_data.confirmed - country_data2.confirmed
                element.properties["change"] = change
            }
            else{
                console.log(country_name)
                element.properties.confirmed = null
                element.properties.deaths = null
                element.properties.recovered = null
            }
        });

        var geojson;

        function getColor(d) {
            return d > 100000 ? '#800026' :
                d > 50000  ? '#BD0026' :
                d > 10000  ? '#E31A1C' :
                d > 5000  ? '#FC4E2A' :
                d > 2500   ? '#FD8D3C' :
                d > 500   ? '#FEB24C' :
                d > 1   ? '#FED976' :
                            '#fff';
        };

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
            "<br> Deaths: " + feature.properties.deaths + "<br> Recoveries: " + feature.properties.recovered +
            "<br>" + feature.properties.date + " Cases: " + feature.properties.change);
        }

        geojson = L.geoJson(data, {
            style: style,
            onEachFeature: onEachFeature,

        }).addTo(myMap);

        var legend = L.control({position: 'bottomleft'});

        legend.onAdd = function (myMap) {
            var div = L.DomUtil.create('div', 'info legend'),
                grades = [0, 1, 500, 2500, 5000, 10000, 50000, 100000],
                labels = [];
            
            div.innerHTML += '<i style="background:' + getColor(grades[0] + 1) + '"></i> 0 <br>'
            // loop through our density intervals and generate a label with a colored square for each interval
            for (var i = 1; i < grades.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                    grades[i] + (grades[i + 1] ? '&ndash;' + (grades[i + 1] - 1) + '<br>' : '+');
            }

            return div;
        };

        legend.addTo(myMap);
    });
});