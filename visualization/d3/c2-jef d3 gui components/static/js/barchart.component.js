"use strict";


class BarChart extends KnowledgeGuiComponent {

    // call KnowledgeGUIComponent constructor
    constructor(container, state) {
        super(container, state);
    }


    /*
     * Init function
     * @param svg_id: ID of the svg object in which to place the visualization
     */
    initialize(container, state) {
        // add the svg
        this.svg_id = makeid(6);
        this.margin = {top: 30, right: 20, bottom: 60, left: 50};
		this.svg = d3.create("svg");
		this.svg.attr("id", this.svg_id);
		container.getElement().append(this.svg.node());

        // Fetch the <svg> element
        var bounds = this.svg.node().getBoundingClientRect();

        // sit dimensions
        this.width = bounds.width;
        this.height = bounds.height;
//        this.svg.attr("viewBox", "0,0,0,0"); // temp

        // add tooltip div
        this.tooltip = d3.select(this.svg.node().parentNode).append("div")
            .attr("class", "tooltip tooltip_" + this.svg_id)
            .style("opacity", 0)
            .style("z-index", 1000000);

        // on resize, redraw this barchart
        var self = this;
        container.on('resize', function() {
            self.resize();
        });
    }


    /**
     * Redraw the barchart when the window is resized
     */
    resize() {
        console.log("resized barchart")
        // recalculate the width and height of the plot
        var bounds = this.svg.node().getBoundingClientRect();
        this.width = bounds.width;
        this.height = bounds.height;
        this.svg.attr("viewBox", "0,0, "+this.width+","+this.height);
        // remove old nodes
        this.svg.selectAll("*").remove();

        // redraw the barchart
        if (this.data != null) {
            this.update(this.data, true);
        }
    }


    /*
     * This function creates the barplot with the passed data, dynamically fixing the axes and elements
     * of the existing barplot if new data is passed.
     * The resize param is used to determine if the update is triggered by a resize of the window, or was caused
     * by the initialization script.
     */
    update(new_data, resize=false) {

        console.log("Calling barchart update");

        if (!resize) {
            console.log("Setting data in barchart:", new_data);
            this.data = new_data.data;
            this.legend_label = new_data.legend_label;
        }

        // count the number of bars to display
        var data_length = this.data.length;

        var self = this;

        // create a scale that maps inputs to a certain position on the x axis
        // This is an categorical / ordinal axis
        var x = d3.scaleBand()
            .domain(d3.range(this.data.length))
            .range([this.margin.left, this.width - this.margin.right])
            .padding(0.1);

        // create a scale that maps inputs to a certain position on the y axis
        // this is a numerical axis. Negative and positive values have their own scale
        var max = d3.max(self.data, d => d.value);
        var min = d3.min(self.data, d => d.value);

        // make sure we always have atleast some space on both sides of the x-axis for the labels
        if (min > 0) {
            min = max * -0.2;
        }
        if (max < 0) {
            max = min * -0.2;
        }

        var y = d3.scaleLinear()
            .domain([min, max])
            .range([this.height - this.margin.bottom, this.margin.top]);

        // Render the chart with new data
        // DATA JOIN use the key argument for ensuring that the same DOM element is bound to the same data-item
        var self = this;

        // add positive items, and skip negative items
        this.svg.append("g")
                .attr("fill", 'steelblue')
            .selectAll("rect")
            .data(self.data.map(d => d.value > 0 ? d : {value: 0}))
            .join("rect")
              .attr("x", (d, i) => x(i))
              .attr("y", d => y(d.value))
              .attr("height", d => y(0) - y(d.value))
              .attr("width", x.bandwidth());

        // add negative items, and skip positive items
        this.svg.append("g")
                .attr("fill", 'hsl(0, 80%, 60%)')  // red, but just not too bright
            .selectAll("rect")
            .data(self.data.map(d => d.value < 0 ? d : {value: 0}))
            .join("rect")
              .attr("x", (d, i) => x(i))
              .attr("y", d => y(0))
              .attr("height", d => y(0) - y(-d.value))
              .attr("width", x.bandwidth());


        // positive x axis position. Hides negative elements
        function xAxisPos(g) {
            g.attr("transform", "translate(0," + y(0)  + ")")
                .call(d3.axisBottom(x).tickFormat(i => self.data[i].category).tickSizeOuter(0))
                .selectAll('g.tick')
                    .attr('display', i => self.data[i].value < 0 ? 'none' : '');

            // flip the x-axis labels to vertical if there are lots of bars
            if (data_length > 6) {
                g.selectAll('text')
                    .attr("transform", "rotate(75)" )
                    .style("text-anchor", "start")
                    .attr("y", 0)
                    .attr("x", 10)
                    .attr("dy", ".6em");
            }
        }

        // negative x axis position. Hides positive elements
        function xAxisNeg(g) {
            g.attr("transform", "translate(0, " + y(0)  + ")")
                .call(d3.axisTop(x).tickFormat(i => self.data[i].category).tickSizeOuter(0))
                .selectAll('g.tick')
                    .attr('display', i => self.data[i].value > 0 ? 'none' : '');

            if (data_length > 6) {
                g.selectAll('text')
                    .attr("transform", "rotate(-75)" )
                    .style("text-anchor", "start")
                    .attr("y", 0)
                    .attr("x", 10);
            }
        }

        // yaxis
        function yAxis(g) {
            g.attr("transform", "translate(" + self.margin.left + ", 0)")
                .call(d3.axisLeft(y).ticks(8))
                .call(g => g.select(".domain").remove())
//                .call(g => g.append("text") // title on top
//                    .attr("x", -self.margin.left)
//                    .attr("y", 10)
//                    .attr("fill", "currentColor")
//                    .attr("text-anchor", "start")
//                    .text(self.legend_label));
        }

        this.svg.append("g")
            .call(xAxisPos);

        this.svg.append("g")
            .call(xAxisNeg);

        this.svg.append("g")
            .call(yAxis);

        // add mouse listener for tooltip
        var rect = this.svg.selectAll("rect")
            .on("mouseover", function(d) {
                self.tooltip.transition()
                    .duration(250)
                    .style("opacity", 1);
                self.tooltip.html(
                    "<p><strong>" + self.legend_label + "</strong></p>" +
                    "<table><tbody><tr><td class='wide'>" + d.category + "</td><td>" + d.value + "</td></tr>" +
                    "</tbody></table>"
                )
                    .style("left", (d3.event.pageX + 15) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                self.tooltip.transition()
                    .duration(250)
                    .style("opacity", 0);
            });

        console.log("Drawing barchart " + this.svg_id + " complete");
    }
}