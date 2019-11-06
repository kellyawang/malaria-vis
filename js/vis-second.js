// References:
// https://github.com/d3/d3-hierarchy/blob/master/README.md#tree
// https://observablehq.com/@d3/tidy-tree

TreeVis = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];

    this.displayData = this.data;

    this.initVis();
}

TreeVis.prototype.initVis = function() {
    var vis = this;

    vis.margin = {top: 40, right: 0, bottom: 60, left: 60};

    vis.width = 860 - vis.margin.left - vis.margin.right,
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
    // Update the visualization
    vis.updateVis();
}


TreeVis.prototype.updateVis = function() {
    var vis = this;

    const root = d3.hierarchy(vis.displayData);
    root.dx = 40;
    root.dy = width / (root.height + 1);
    root.y = vis.height/2 + 200

    var tree = d3.tree().nodeSize([root.dx, root.dy])(root);

    // Draw the svg tree
    var linesGroup = vis.svg.append("g")
        .attr("transform", `translate(${root.dy / 3},${vis.height/2})`);

    var lines = linesGroup.append("g")
        .attr("fill", "none")
        .selectAll("path")
        .data(root.links())
        .enter()
        .append("path")
        .attr("d", d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x));

    var nodes = linesGroup.append("g")
        .selectAll("g")
        .data(root.descendants())
        .enter()
        .append("g")
        .attr("transform", d => `translate(${d.y},${d.x})`);

    nodes.append("circle")
        .attr("class", "node")
        .attr("fill", d => {
            if (d.data.name == "P. falciparum") {
                return "#e34d04"
            } else {
                return d.children ? "#fff" : "#C04604"
            }
        })
        .attr("r", 8)
        .attr("stroke", d => {
            if (d.data.children) {
                return "#853004"
            } else {
                return (d.data.name == "P. falciparum") ? "#e34d04" : "#C04604"
            }
        })
        .attr("stroke-width", 2)

    nodes.append("text")
        .attr("dy", d => d.children ? -20 : 5)
        .attr("x", d => d.children ? -8 : 15)
        .attr("text-anchor", d => d.children ? "middle" : "start")
        .text(d => d.data.name)

    vis.svg.append("g")
        .append("text")
        .attr("x", -30)
        .attr("y", vis.height + 20)
        .attr("font-style", "italic")
        .attr("font-size", "18px")
        .text("How are malaria parasites transmitted to humans?")

}
