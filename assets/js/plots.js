// create global data promise
var covid_data = d3.json("https://pomber.github.io/covid19/timeseries.json");

// Initializes the page with a default plot
function init() {
    covid_data.then(data =>{
        countries = Object.keys(data)

        var selector = d3.select("#select_country")
            .append("select")
            .attr("id", "country_select")
            .selectAll("option")
            .data(countries)
            .enter().append("option")
            .text(function(d) { return d; })
            .attr("value", function (d) {
                return d;
        });

        plot_data = get_plot_data(data.Afghanistan);
        traces = create_traces(plot_data)
        
        var layout = {
            yaxis: {
              type: 'linear',
              autorange: true
            }
          };
        
        Plotly.newPlot("plot", traces, layout);
    })
};

function get_plot_data(data) {
    var x_axis = []
    var confirmed = []
    var deaths = []
    var recovered = []

    data.forEach(element => {
        x_axis.push(element.date)
        confirmed.push(element.confirmed)
        deaths.push(element.deaths)
        recovered.push(element.recovered)
    });

    return [x_axis, confirmed, deaths, recovered]
};

function create_traces(data) {
    var trace1 = {
        x: data[0],
        y: data[1],
        mode: 'lines',
        name: 'Confirmed Cases'
    }

    var trace2 = {
        x: data[0],
        y: data[2],
        mode: 'lines',
        name: 'Number of Deaths'
    }

    var trace3 = {
        x: data[0],
        y: data[3],
        mode: 'lines',
        name: 'Recovered Cases'
    }

    return [trace1, trace2, trace3]
}

// Call updatePlotly() when a change takes place to the DOM
d3.selectAll("#select_country").on("change", updatePlotly);

// This function is called when a dropdown menu item is selected
function updatePlotly() {
    covid_data.then(data =>{
        // Use D3 to select the dropdown menu
        var dropdownMenu = d3.select("#country_select");
        // Assign the value of the dropdown menu option to a variable
        var dataset = dropdownMenu.property("value");

        plot_data = get_plot_data(data[dataset]);
        // // Note the extra brackets around 'x' and 'y'
        Plotly.restyle("plot", "x", [plot_data[0]]);
        Plotly.restyle("plot", "y", [plot_data[1]], 0);
        Plotly.restyle("plot", "y", [plot_data[2]], 1);
        Plotly.restyle("plot", "y", [plot_data[3]], 2);
    });
}

// d3.json("https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json").then(data=>{
//     console.log(data)
// })

init();