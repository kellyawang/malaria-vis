

// --> CREATE SVG DRAWING AREA
var margin = { top: 40, right: 0, bottom: 60, left: 60 };

var width = 860 - margin.left - margin.right
var height = 900 - margin.top - margin.bottom;

// SVG drawing area
var svg = d3.select("#map-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("g")
    .attr("class", "legend")

// Global objects
var convertedMalariaData = [];
var countryDataByCountryId = {};
var finalMapJson = {};

// Create color scale
// https://github.com/d3/d3-scale-chromatic
//var colorScale = d3.scaleLinear() //scaleThreshold() // or scaleOrdinal?
//  .domain([100000, 2000000000]) //1,377,240,453 // 
//  .range(d3.schemeBlues[7]);

// reference: https://github.com/d3/d3-scale/blob/master/README.md#sequential-scales
var colorScale = d3.scaleThreshold()
//  .domain([100000, 750000000, 1500000000])
  .range(["#c6dbef","#9ecae1","#084594"]);
  
// var colorScale = d3.scaleOrdinal(d3.schemeCategory10); //d3.schemeCategory10
// colorScale.domain(["America", "East Asia & Pacific", "Europe & Central Asia", "Middle East & North Africa", "South Asia", "Sub-Saharan Africa"]);
// console.log(`color palette for America: ${colorScale("America")}`)

// d3.scaleQuantize([1, 10]

// Use the Queue.js library to read two files
queue()
  .defer(d3.json, "data/africa.topo.json")
  .defer(d3.csv, "data/global-malaria-2015.csv")
  .await(function(error, mapTopJson, malariaDataCsv) {

    // --> PROCESS DATA
    //
    malariaDataCsv.forEach(function(d) {
        isNaN(d.UN_population) ? (d.UN_population = -1) : (d.UN_population = +d.UN_population)
        isNaN(d.Malaria_cases) ? (d.Malaria_cases = -1) : (d.Malaria_cases = +d.Malaria_cases)
        isNaN(d.Suspected_malaria_cases) ? (d.Suspected_malaria_cases = -1) : (d.Suspected_malaria_cases = +d.Suspected_malaria_cases)
        isNaN(d.At_risk) ? (d.At_risk = -1) : (d.At_risk = +d.At_risk)
        isNaN(d.At_high_risk) ? (d.At_high_risk = -1) : (d.At_high_risk = +d.At_high_risk)
        if (d.WHO_region === "African") countryDataByCountryId[d.Code] = d;
        // reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer
    });
    convertedMalariaData = malariaDataCsv
    finalMapJson = mapTopJson

    // map country code to topo json data??
    // console.log(mapTopJson)
    console.log("country data by country id")
    console.log(countryDataByCountryId)
    console.log(Object.keys(countryDataByCountryId).length)

    // console.log(convertedMalariaData)

    // Update choropleth
    updateChoropleth(mapTopJson);
  });
    

function updateChoropleth() {

  // update color scale
  /**
  console.log("extent:" + d3.extent(convertedMalariaData, d => d.UN_population))
  var quantScale = d3.scaleQuantize([d3.extent(convertedMalariaData, d => d.UN_population), blues])
  console.log("quantscale of 186342:" + quantScale(186342) + "; quantscale of 1377240453:" + quantScale(1377240453))
  //d3.schemeCategory10
  */
  var blues = ["#eff3ff","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#084594"]
  var qScale = d3.scaleQuantize()
    .range(blues)

  // let selector = d3.select("#data-type").property("value");
  // console.log("selector value:" + selector)

    qScale.domain([
    d3.min(convertedMalariaData, function(d) { return d.UN_population; }),
    d3.max(convertedMalariaData, function(d) { return d.UN_population; })
    ]);
  
  console.log("CONVERTED MALARIA DATA")
  console.log(convertedMalariaData)
  colorScale.domain([d3.min(convertedMalariaData, d => d.UN_population), d3.max(convertedMalariaData, d => d.UN_population)])


  // --> Choropleth implementation
  // TODO: do stuff to create chloropleth projection 
  // create mercator projection
  var projection = d3.geoMercator() //d3.geoStereographic() // d3.geoOrthographic()
    .scale([500])
    .translate([width / 2 - 150, height / 2 + 60])
  
  // Create geo path generator, d3.geoPath, and specify a projection for it to use.
  // projection algorithm determines how 3D space is projected onto 2D space
  var path = d3.geoPath()
      .projection(projection);

  // Convert TopoJSON to GeoJSON (target object = 'countries')
  var usa = topojson.feature(finalMapJson, finalMapJson.objects.collection).features

  // TODO: need to map topo shapes to UN population! 
  // TODO: need to filter out topo countries that don't have an entry in global-malaria csv!!!
  // TODO: colorscale not working at all hrm

  // Render the U.S. by using the path generator
  // Bind data and create one path per TopoJSON feature
  svg.selectAll("path")
      .data(usa)
    .enter().append("path")
      .attr("d", path)
      .attr("fill", function(d) {
        var code = d.properties.adm0_a3_is
        
        if (countryDataByCountryId[code]) {
          // console.log("iso code:" + code)
          // console.log(countryDataByCountryId[code])
          // console.log("population:" + countryDataByCountryId[code].UN_population)
          // console.log("color:" + qScale(countryDataByCountryId[code].UN_population))
          return qScale(countryDataByCountryId[code].UN_population)
        }
        return "#636363"
      })

      
    // color the map based on UN population
    // colorScale from min UN population to max UN population

}