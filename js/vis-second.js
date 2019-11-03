
TreeVis = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = []; // see data wrangling

    // DEBUG RAW DATA
    // console.log(this.data);
    this.displayData = this.data;

    this.initVis();
}

TreeVis.prototype.initVis = function() {
    var vis = this;

    vis.margin = {top: 40, right: 0, bottom: 60, left: 60};

    vis.width = 800 - vis.margin.left - vis.margin.right,
        vis.height = 400 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.wrangleData();
}

TreeVis.prototype.wrangleData = function(){
    var vis = this;

    // In the first step no data wrangling/filtering needed
    // vis.displayData = vis.stackedData;

    // Update the visualization
    vis.updateVis();
}


TreeVis.prototype.updateVis = function() {
    var vis = this;

}