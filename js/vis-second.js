// References:
// https://github.com/d3/d3-hierarchy/blob/master/README.md#tree
//

TreeVis = function(_parentElement, _data) {
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

TreeVis.prototype.wrangleData = function() {
    var vis = this;

    // In the first step no data wrangling/filtering needed
    // vis.displayData = vis.stackedData;

    // Update the visualization
    vis.updateVis();
}


TreeVis.prototype.updateVis = function() {
    var vis = this;

    const root = d3.hierarchy(vis.displayData);
    root.dx = 30;
    console.log(`root.dy = ${vis.width} / ${root.height} + 1`)
    root.dy = width / (root.height + 1);
    root.y = vis.height/2
    var tree = d3.tree().nodeSize([root.dx, root.dy])(root);

    // let x0 = Infinity;
    // let x1 = -x0;
    // root.each(d => {
    //     if (d.x > x1) x1 = d.x;
    //     if (d.x < x0) x0 = d.x;
    // });

    console.log("------------")
    console.log(vis.displayData)
    console.log(root.links())
    console.log("descendants:")
    console.log(root.descendants())
    console.log("------------")

    var linesGroup = vis.svg.append("g")
        .attr("transform", `translate(${root.dy / 3},${vis.height/2})`);

    var lines = linesGroup.append("g")
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5)
        .selectAll("path")
        .data(root.links())
        .enter()
        .append("path")
        .attr("d", d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x));

    var nodes = linesGroup.append("g")
        // .attr("stroke-linejoin", "round")
        // .attr("stroke-width", 3)
        .selectAll("g")
        .data(root.descendants())
        .enter()
        .append("g")
        .attr("transform", d => `translate(${d.y},${d.x})`);

    nodes.append("circle")
        // .attr("fill", d => d.children ? "#993404" : "#d95f0e")
        .attr("fill", "#993404")
        .attr("r", 8);

    nodes.append("text")
        .attr("dy", d => d.children ? -20 : 5)
        .attr("x", d => d.children ? -8 : 10)
        .attr("text-anchor", d => d.children ? "middle" : "start")
        .text(d => d.data.name)

}