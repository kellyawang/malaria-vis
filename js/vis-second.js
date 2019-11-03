// // --> CREATE SVG DRAWING AREA
// var margin = { top: 40, right: 0, bottom: 60, left: 60 };
//
// var width = 560 - margin.left - margin.right
// var height = 400 - margin.top - margin.bottom;
//
// // SVG drawing area
// var svg = d3.select("#tree-area").append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//
// var svgMap = svg.append("g")
//     .attr("class", "tree")
//
// // Global objects
//
// // load data
//
// function loadData() {
//     d3.csv("data/coffee-house-chains.csv", function(error, csv) {
//
//
//     })
// }