// TODO: need to map topo shapes to UN population!
// TODO: need to filter out topo countries that don't have an entry in global-malaria csv!!!
// TODO: colorscale not working at all hrm

// Jumbotron code taken from one of my previous homeworks (Homework 5)
var jumboHeight = $('.jumbotron').outerHeight();
function parallax(){
    var scrolled = $(window).scrollTop();
    $('.bg').css('height', (jumboHeight - scrolled) + 'px');
}

// $(window).scroll(function(e){
//     parallax();
// });

// --> CREATE SVG DRAWING AREA: one for both visualizations
var margin = { top: 40, right: 0, bottom: 60, left: 60 };

let width = 660 - margin.left - margin.right
let height = 800 - margin.top - margin.bottom;

const LEGEND_Y = 500
const LEGEND_X = 10
const LEGEND_WIDTH = 20
const LEGEND_HEIGHT = 20

// SVG drawing area - map
var svg = d3.select("#map-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

svg.append("g")
    .attr("class", "mapGroup")

svg.append("g")
    .attr("class", "legendGroup")

svg.append("g")
    .attr("class", "legend-axis-group")

// SVG drawing area - tree
// d3.select("#tree-area").append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Global objects
var convertedMalariaData = [];

// restructured malaria data for African countries only
var countryDataByCountryId = {};
var finalMapJson = {};
var parasiteJson = {};
var t = d3.transition().duration(50);

// Create color scale
// https://github.com/d3/d3-scale-chromatic
//var colorScale = d3.scaleLinear() //scaleThreshold() // or scaleOrdinal?
//  .domain([100000, 2000000000]) //1,377,240,453 // 
//  .range(d3.schemeBlues[7]);

/** OPTION1: SCALE THRESHOLD */
// reference: https://github.com/d3/d3-scale/blob/master/README.md#sequential-scales
// var colorScale = d3.scaleThreshold()
//  .domain([100000, 750000000, 1500000000])
//   .range(["#c6dbef","#9ecae1","#084594"]);

/** OPTION2: QUANTIZE SCALE */
var blues = ["#eff3ff","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#084594"]
var reds = ["#ffffd4","#fed98e","#fe9929","#d95f0e","#993404"]
var populations = ["#f7fcf5","#e8f6e3","#d3eecd","#b7e2b1","#97d494","#73c378","#4daf62","#2f984f","#157f3b","#036429","#00441b"]
var ridic = ["#f7fcf5","#f6fcf4","#f6fcf4","#f5fbf3","#f5fbf2","#f4fbf2","#f4fbf1","#f3faf0","#f2faf0","#f2faef","#f1faee","#f1faee","#f0f9ed","#f0f9ec","#eff9ec","#eef9eb","#eef8ea","#edf8ea","#ecf8e9","#ecf8e8","#ebf7e7","#ebf7e7","#eaf7e6","#e9f7e5","#e9f6e4","#e8f6e4","#e7f6e3","#e7f6e2","#e6f5e1","#e5f5e1","#e4f5e0","#e4f4df","#e3f4de","#e2f4dd","#e1f4dc","#e1f3dc","#e0f3db","#dff3da","#def2d9","#ddf2d8","#ddf2d7","#dcf1d6","#dbf1d5","#daf1d4","#d9f0d3","#d8f0d2","#d7efd1","#d6efd0","#d5efcf","#d4eece","#d4eece","#d3eecd","#d2edcb","#d1edca","#d0ecc9","#cfecc8","#ceecc7","#cdebc6","#ccebc5","#cbeac4","#caeac3","#c9eac2","#c8e9c1","#c6e9c0","#c5e8bf","#c4e8be","#c3e7bd","#c2e7bc","#c1e6bb","#c0e6b9","#bfe6b8","#bee5b7","#bde5b6","#bbe4b5","#bae4b4","#b9e3b3","#b8e3b2","#b7e2b0","#b6e2af","#b5e1ae","#b3e1ad","#b2e0ac","#b1e0ab","#b0dfaa","#aedfa8","#addea7","#acdea6","#abdda5","#aadca4","#a8dca3","#a7dba2","#a6dba0","#a5da9f","#a3da9e","#a2d99d","#a1d99c","#9fd89b","#9ed799","#9dd798","#9bd697","#9ad696","#99d595","#97d494","#96d492","#95d391","#93d390","#92d28f","#91d18e","#8fd18d","#8ed08c","#8ccf8a","#8bcf89","#8ace88","#88cd87","#87cd86","#85cc85","#84cb84","#82cb83","#81ca82","#80c981","#7ec980","#7dc87f","#7bc77e","#7ac77c","#78c67b","#77c57a","#75c479","#74c478","#72c378","#71c277","#6fc276","#6ec175","#6cc074","#6bbf73","#69bf72","#68be71","#66bd70","#65bc6f","#63bc6e","#62bb6e","#60ba6d","#5eb96c","#5db86b","#5bb86a","#5ab769","#58b668","#57b568","#56b467","#54b466","#53b365","#51b264","#50b164","#4eb063","#4daf62","#4caf61","#4aae61","#49ad60","#48ac5f","#46ab5e","#45aa5d","#44a95d","#42a85c","#41a75b","#40a75a","#3fa65a","#3ea559","#3ca458","#3ba357","#3aa257","#39a156","#38a055","#379f54","#369e54","#359d53","#349c52","#339b51","#329a50","#319950","#30984f","#2f974e","#2e964d","#2d954d","#2b944c","#2a934b","#29924a","#28914a","#279049","#268f48","#258f47","#248e47","#238d46","#228c45","#218b44","#208a43","#1f8943","#1e8842","#1d8741","#1c8640","#1b8540","#1a843f","#19833e","#18823d","#17813d","#16803c","#157f3b","#147e3a","#137d3a","#127c39","#117b38","#107a37","#107937","#0f7836","#0e7735","#0d7634","#0c7534","#0b7433","#0b7332","#0a7232","#097131","#087030","#086f2f","#076e2f","#066c2e","#066b2d","#056a2d","#05692c","#04682b","#04672b","#04662a","#03642a","#036329","#026228","#026128","#026027","#025e27","#015d26","#015c25","#015b25","#015a24","#015824","#015723","#005623","#005522","#005321","#005221","#005120","#005020","#004e1f","#004d1f","#004c1e","#004a1e","#00491d","#00481d","#00471c","#00451c","#00441b"]
// Resources used: Interactive Data Visualization for the Web
// https://github.com/d3/d3-scale/blob/master/README.md#quantize-scales
var qScale = d3.scaleQuantize()
    .range(populations)



console.log("can I print the range?")
console.log(qScale.range())

  
// var colorScale = d3.scaleOrdinal(d3.schemeCategory10); //d3.schemeCategory10
// colorScale.domain(["America", "East Asia & Pacific", "Europe & Central Asia", "Middle East & North Africa", "South Asia", "Sub-Saharan Africa"]);
// console.log(`color palette for America: ${colorScale("America")}`)

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
    updateChoropleth();

  });

createTreeVis()

function createTreeVis() {

    d3.json("data/malaria-parasites.json", function(error, jsonData){
        if(!error){
            parasiteJson = jsonData;
            var treeVis = new TreeVis("tree-area", parasiteJson)
        }
    });

}

function updateChoropleth() {

  // update color scale
  /**
  console.log("extent:" + d3.extent(convertedMalariaData, d => d.UN_population))
  var quantScale = d3.scaleQuantize([d3.extent(convertedMalariaData, d => d.UN_population), blues])
  console.log("quantscale of 186342:" + quantScale(186342) + "; quantscale of 1377240453:" + quantScale(1377240453))
  //d3.schemeCategory10
  */

  console.log("CONVERTED MALARIA DATA")
  console.log(convertedMalariaData)
  // colorScale.domain([d3.min(convertedMalariaData, d => d.UN_population), d3.max(convertedMalariaData, d => d.UN_population)])

  let selector = d3.select("#data-type").property("value");
  console.log("selectorvalue:" + selector)

    // console.log("d[selector]:" + convertedMalariaData[0][selector])

    console.log("min pop:" + d3.min(convertedMalariaData, function(d) {
        if (d.WHO_region === "African") return d[selector]; }))
    console.log("max pop:" + d3.max(convertedMalariaData, function(d) {
        if (d.WHO_region === "African") return d[selector]; }))

    qScale.domain([
        d3.min(convertedMalariaData, function(d) {
            if (d.WHO_region === "African") return d[selector]; }),
        d3.max(convertedMalariaData, function(d) {
            if (d.WHO_region === "African") return d[selector]; })
    ]);

    qScale.ticks(populations.length)
    console.log("inver extent of first color: " + qScale.invertExtent("#f7fcf5"))


    //186342
  // vis-choropleth.js:136 max pop:1377240453
  console.log("scaled 186342: " + qScale(286342))
  console.log("scaled 177475986: " + qScale(177475986))
    console.log(qScale.invertExtent("#f7fcf5"))

  // --> Choropleth implementation
  // create mercator projection
  var projection = d3.geoMercator() //d3.geoStereographic() // d3.geoOrthographic()
    .scale([500])
    .translate([width / 2 - 150, height / 2 + 60])
  
  // Create geo path generator, d3.geoPath, and specify a projection for it to use.
  // projection algorithm determines how 3D space is projected onto 2D space
  var path = d3.geoPath()
      .projection(projection);

  // Convert TopoJSON to GeoJSON
  var usa = topojson.feature(finalMapJson, finalMapJson.objects.collection).features

  var tip = d3.tip()
      .attr("class", "d3-tip")
      .offset([-10,0])
      .html(function(d) {
          let code = d.properties.adm0_a3_is
          let countryData = countryDataByCountryId[code]
          let selector = d3.select("#data-type").property("value")
          return `<span class="tooltip-title">${countryData.Country}<br></span>
                <span>Population: ${countryData.UN_population}</span><br>
                <span>At Risk: ${countryData.At_risk}%</span><br>
                <span>High Risk: ${countryData.At_high_risk}%</span><br>
                <span>Suspected Cases: ${countryData.Suspected_malaria_cases}%</span><br>
                <span>Diagnosed Cases: ${countryData.Malaria_cases}%</span><br>`;
      });

    svg.call(tip);

  // Render the U.S. by using the path generator
  // Bind data and create one path per TopoJSON feature
  d3.select(".mapGroup").selectAll("path")
      .data(usa)
    .enter().append("path")
      .attr("d", path)
      .style("stroke", "#636363")
      .style("stroke-width", "0.5")
      .style("fill", function(d) {
        let code = d.properties.adm0_a3_is
        
        if (countryDataByCountryId[code]) {
          // console.log("iso code:" + code)
          // console.log(countryDataByCountryId[code])
          // console.log("population:" + countryDataByCountryId[code].UN_population)
          // console.log("color:" + qScale(countryDataByCountryId[code].UN_population))
          return qScale(countryDataByCountryId[code][selector])
        }
        return "#636363"
      })
      .on("mouseover", function(d) {
          let code = d.properties.adm0_a3_is
          if (countryDataByCountryId[code]) {
              console.log(`hovering over ${countryDataByCountryId[code].Country}`)
              tip.show(d)
              d3.select(this)
                  .style("stroke-width", "3")
                  // .style("fill", "#b10026")
          }
      })
      .on("mouseout", function(d) {
          let code = d.properties.adm0_a3_is
          if (countryDataByCountryId[code]) {
              tip.hide(d)
              d3.select(this)
                  .style("stroke-width", "0.5")
                  // .style("stroke-width", "0")
                  // .style("fill", function(d) { return qScale(countryDataByCountryId[code][selector]) })
          }
      })

  // Draw legend
  var legendGroup = d3.select(".legendGroup").selectAll("rect")
      .data(qScale.range())
      .enter()
      .append("rect")
      .attr("class", "legend-rect")
      .attr("x", LEGEND_X)
      .attr("y", function(d, i) { return LEGEND_Y + i*LEGEND_HEIGHT })
      .attr("width", LEGEND_WIDTH)
      .attr("height", LEGEND_HEIGHT)
      .style("stroke", "#636363")
      .style("stroke-width", "0.5")
      .style("fill", function(d) {
          console.log("d:")
          console.log(d)
          return d })

    // var yAxis = d3.axisRight(qScale)
    //
    // var legendAxis = d3.select(".legend-axis-group")
    //     .attr("class", "axis")
    //     // .attr("transform", `translate(0, ${height})`)
    //     .call(yAxis)

    var legendLabels = d3.select(".legendGroup").selectAll(".legend-label")
        .data(qScale.range())
        .enter()
        .append("text")
        .attr("class", "legend-label")
        .attr("x", LEGEND_X + LEGEND_WIDTH + 3)
        .attr("y", function(d, i) { return LEGEND_Y + i * LEGEND_HEIGHT + 15 })
        .attr("text-anchor", "start")
        .attr("font-size", 12)
        .text(function(d) {
            console.log(qScale.range())
            var extent = qScale.invertExtent(d)
            console.log("invertingggg extent of " + d + ": " + extent)
            console.log(`${Math.round(extent[0])} to ${Math.round(extent[1])}`)
            return `${Math.round(extent[0])} to ${Math.round(extent[1])}`
        })

}


function hoverEffectOn(object) {
    d3.select(object)
        .transition()
        .duration(100)
        .style("fill", "#4541ff");
}

function hoverEffectOff(object) {
    d3.select(object)
        .transition()
        .duration(100)
        .style("fill", "white");
}