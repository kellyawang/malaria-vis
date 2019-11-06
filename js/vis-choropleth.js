// Jumbotron code taken from one of my previous homeworks (Homework 5)
var jumboHeight = $('.jumbotron').outerHeight();
function parallax(){
    var scrolled = $(window).scrollTop();
    $('.bg').css('height', (jumboHeight - scrolled) + 'px');
}

$(window).scroll(function(e){
    parallax();
});

// Object constants
// Reference for color scale:
// https://github.com/d3/d3-scale-chromatic
// https://github.com/d3/d3-scale/blob/master/README.md#sequential-scales

// Reference: colors copied from https://observablehq.com/@d3/color-schemes?collection=@d3/d3-scale-chromatic
var populations = ["#fcfbfd","#f1eff6","#e2e1ef","#cecee5","#b6b5d8","#9e9bc9","#8782bc","#7363ac","#61409b","#501f8c","#3f007d"]
var reds6 = ["#ffffb2","#fed976","#feb24c","#fd8d3c","#f03b20","#bd0026"]
var reds8 = ["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#b10026"]
var reds10 = ["#ffffcc","#ffefa5","#fedc7f","#febf5b","#fd9d43","#fc7034","#f23d26","#d91620","#b40325","#800026"]
var reds11 = ["#ffffcc","#fff0a9","#fee087","#fec965","#feab4b","#fd893c","#fa5c2e","#ec3023","#d31121","#af0225","#800026"]

var colorScaleMap = {
    UN_population: populations,
    At_risk: reds6,
    At_high_risk: reds10,
    Malaria_cases: reds8,
    Suspected_malaria_cases: reds8
}

var labelMap = {
    UN_population: "UN Population",
    At_risk: "Percent at Risk",
    At_high_risk: "Percent at High Risk",
    Malaria_cases: "Diagnosed Malaria Cases",
    Suspected_malaria_cases: "Suspected Malaria Cases"
}

// --> CREATE SVG DRAWING AREA: one for both visualizations
var margin = { top: 40, right: 0, bottom: 60, left: 60 };

let width = 800 - margin.left - margin.right
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

svg.append("text")
    .attr("class", "legend-title")
    .attr("x", 0)
    .attr("y", LEGEND_Y - LEGEND_HEIGHT)
    .style("text-anchor", "start")
    .style("font-size", "12px")
    .text("UN Population")

// Global objects
var convertedMalariaData = [];

// restructured malaria data for African countries only
var countryDataByCountryId = {};
var finalMapJson = {};
var parasiteJson = {};
var t = d3.transition().duration(1000);

// https://github.com/d3/d3-scale/blob/master/README.md#quantize-scales
var qScale = d3.scaleQuantize()
    .range(populations)


// Use the Queue.js library to read two files
queue()
  .defer(d3.json, "data/africa.topo.json")
  .defer(d3.csv, "data/global-malaria-2015.csv")
  .await(function(error, mapTopJson, malariaDataCsv) {

    // --> PROCESS DATA
    //
    malariaDataCsv.forEach(function(d) {
        if(!isNaN(d.UN_population)) d.UN_population = +d.UN_population
        if(!isNaN(d.Malaria_cases)) d.Malaria_cases = +d.Malaria_cases
        if(!isNaN(d.Suspected_malaria_cases)) d.Suspected_malaria_cases = +d.Suspected_malaria_cases
        if(!isNaN(d.At_risk)) d.At_risk = +d.At_risk
        if(!isNaN(d.At_high_risk)) d.At_high_risk = +d.At_high_risk
        if (d.WHO_region === "African") countryDataByCountryId[d.Code] = d;
    });
    convertedMalariaData = malariaDataCsv
    finalMapJson = mapTopJson

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

    let selector = d3.select("#data-type").property("value");

    qScale.domain([
        d3.min(convertedMalariaData, function(d) {
            if (d.WHO_region === "African" && !isNaN(d[selector])) return d[selector];
        }),
        d3.max(convertedMalariaData, function(d) {
            if (d.WHO_region === "African" && !isNaN(d[selector])) return d[selector];
        })
    ]);

    qScale.range(colorScaleMap[selector])

    // --> Choropleth implementation
    // create mercator projection
    var projection = d3.geoMercator()
        .scale([500])
        .translate([width / 2 - 150, height / 2 + 60])
  
    // Create geo path generator, d3.geoPath, and specify a projection for it to use.
    // projection algorithm determines how 3D space is projected onto 2D space
    var path = d3.geoPath()
      .projection(projection);

    // Convert TopoJSON to GeoJSON
    var usa = topojson.feature(finalMapJson, finalMapJson.objects.collection).features

    // References: d3 tip implementation taken from previous implementation in homework 5
    var tip = d3.tip()
      .attr("class", "d3-tip")
      .offset([-10,0])
      .html(function(d) {
          let code = d.properties.adm0_a3_is
          let countryData = countryDataByCountryId[code]
          return `<span class="tooltip-title">${countryData.Country}<br></span>
                <span>UN Population: ${countryData.UN_population}</span><br>
                <span>Percent at Risk: ${countryData.At_risk}</span><br>
                <span>Percent at High Risk: ${countryData.At_high_risk}</span><br>
                <span>Diagnosed Cases: ${countryData.Malaria_cases}</span><br>
                <span>Suspected Cases: ${countryData.Suspected_malaria_cases}</span><br>`;
    });

    svg.call(tip);

    // Render the U.S. by using the path generator
    // Bind data and create one path per TopoJSON feature
    var mapGroup = d3.select(".mapGroup").selectAll("path")
        .data(usa)

    mapGroup.exit().remove()
    var mapEnter = mapGroup.enter()
      .append("path")
      .attr("class", "map-paths")
      .attr("d", path)
      .on("mouseover", function(d) {
          let code = d.properties.adm0_a3_is
          if (countryDataByCountryId[code]) {
              tip.show(d)
              d3.select(this).style("stroke-width", "3")
          }
      })
      .on("mouseout", function(d) {
          let code = d.properties.adm0_a3_is
          if (countryDataByCountryId[code]) {
              tip.hide(d)
              d3.select(this).style("stroke-width", "0.5")
          }
      })

    // Update map on change
    mapGroup.merge(mapEnter)
      .transition(t)
      .style("fill", function(d) {
        let code = d.properties.adm0_a3_is
        if (countryDataByCountryId[code]) {
            if(isNaN(countryDataByCountryId[code][selector])) {
                return "#BCBCBC"
            } else {
                return qScale(countryDataByCountryId[code][selector])
            }
        }
        return "#636363"
    })

    // Draw color legend squares
    var legendGroup = d3.select(".legendGroup").selectAll("rect")
      .data(qScale.range())

    legendGroup.exit().remove()
    var legendEnter = legendGroup.enter()
      .append("rect")
      .attr("class", "legend-rect")
      .attr("x", 0)
      .attr("y", function(d, i) { return LEGEND_Y + i * LEGEND_HEIGHT + 25 })
      .attr("width", LEGEND_WIDTH)
      .attr("height", LEGEND_HEIGHT)

    legendGroup.merge(legendEnter)
        .transition(t)
        .style("fill", d => d)

    // Draw color legend labels
    var legendLabels = d3.select(".legendGroup").selectAll(".legend-label")
        .data(qScale.range())

    legendLabels.exit().remove()
    var legendLabelEnter = legendLabels.enter()
        .append("text")
        .attr("class", "legend-label")
        .attr("x", LEGEND_X + LEGEND_WIDTH + 3)
        .attr("y", function(d, i) { return LEGEND_Y + i * LEGEND_HEIGHT + 40 })
        .text(function(d) {
            var extent = qScale.invertExtent(d)
            return `${Math.round(extent[0])} to ${Math.round(extent[1])}`
        })

    legendLabels.merge(legendLabelEnter)
        .transition(t)
        .text(function(d) {
            var extent = qScale.invertExtent(d)
            return `${Math.round(extent[0])} to ${Math.round(extent[1])}`
        })

    var legendTitle = d3.select(".legend-title")
        .text(labelMap[selector])

    // extra square and label for no data
    svg.append("rect")
        .attr("class", "legend-rect")
        .attr("id", "no-data")
        .attr("x", 0)
        .attr("y", LEGEND_Y + LEGEND_HEIGHT - 15)
        .attr("width", LEGEND_WIDTH)
        .attr("height", LEGEND_HEIGHT)

    svg.append("text")
        .attr("class", "legend-label")
        .attr("x", LEGEND_X + LEGEND_WIDTH + 3)
        .attr("y", LEGEND_Y + LEGEND_HEIGHT)
        .text("N/A")

}
