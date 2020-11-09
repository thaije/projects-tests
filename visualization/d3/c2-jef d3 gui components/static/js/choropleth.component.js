"use strict";

class Choropleth extends KnowledgeGuiComponent{

    // call KnowledgeGUIComponent constructor
    constructor(container, state) {
        super(container, state);
    }

    /*
     * Init function
     * @param svg_id: ID of the svg object in which to place the visualization
     */
    initialize(container, state) {
        this.set_initial_zoom = false;

        // save the svg_id
        this.svg_id = makeid(6);
        this.margin = {top: 20, right: 20, bottom: 30, left: 50};
		this.svg = d3.create("svg");
		this.svg.attr("id", this.svg_id);
		container.getElement().append(this.svg.node());

//        this.colour_range = ["#deebf7", "#3182bd"]; // light blue (low val) to dark blue (high val)
        this.colour_range = ["#a50026", "#006837"]; // red (low val) to green (high val)

        // Fetch <svg> element and creates parent group element
        this.g = this.svg.append('g');

        // handle user zooming  and dragging
        this.svg.call(d3.zoom().on('zoom', () => {
          this.g.attr('transform', d3.event.transform);
        }));

        // add tooltip div
        this.tooltip = d3.select(this.svg.node().parentNode).append("div")
            .attr("class", "tooltip tooltip_" + this.svg_id)
            .style("opacity", 0);

        // add legend div
        this.legend = this.svg.append("g")
		    .attr("id", "choropleth_legend");

        const projection = d3.geoMercator();
        this.pathGenerator = d3.geoPath().projection(projection);

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
        // setting the initial zoom requires us to have a height and width. So we can only do this when the window
        // manager window for this component has been initialized, indicated by a resize event firing.
        if (!this.set_initial_zoom) {
            // set initial zoom (focused on Baltics)
            var initial_scale = 6;
            var self = this;
            var zoom = d3.zoom().on("zoom", function(){
                self.g.attr("transform", d3.event.transform);
            });
            this.svg.call(zoom.transform, d3.zoomIdentity.translate(-3000, -100).scale(initial_scale))

            this.set_initial_zoom = true;
        }

        // recalculate the width and height of the plot
        var bounds = this.svg.node().getBoundingClientRect();
        this.width = bounds.width;
        this.height = bounds.height;
        this.svg.attr("viewBox", "0,0, "+this.width+","+this.height);

        // redraw the barchart
        if (this.data != null) {
        	this.update(this.data);
        }
    }


    /*
     * This function accepts new data, and updates the choropleth to display that data
     */
    update(new_data) {
        this.data = new_data;

        // check if we have all required data
        if (this.name_data == null || this.topo_data == null) {

            // if not > fetch the required files before (re)drawing the choropleth
            var self = this;
            Promise.all([
                d3.tsv('https://unpkg.com/world-atlas@1.1.4/world/50m.tsv'),
                d3.json('https://unpkg.com/world-atlas@1.1.4/world/50m.json')
            ]).then(([name_data, topo_data]) => {
                this.name_data = name_data;
                this.topo_data = topo_data;
                console.log("Loaded Choropleth name and topo data");

                // (re)draw the choropleth
                this.draw();
            });
        }

        // we got all data already, so (re)draw the choropleth
        else {
            this.draw();
        }
    }

    /*
     * Provided with all required data, draw the choropleth
     */
    draw() {
        // array mapping ISO 3166-1 numeric country code to country name
        const get_country_name = this.name_data.reduce((accumulator, d) => {
            accumulator[d.iso_n3] = d.name;
            return accumulator;
        }, {});

        // only keep the topo and name data of the countries we are supposed to find
        var values = this.filter_data(get_country_name);

        // specify the colour mapping based on the range of values
        var colourScale = d3.scaleLinear()
            .domain([Math.min.apply(Math, values), Math.max.apply(Math, values)])
            .range(this.colour_range);

        // add the legend to the choropleth
        this.add_legend(values, colourScale);

        // display the countries on screen
        var self = this;
        const countries = topojson.feature(this.topo_data, this.topo_data.objects.countries);
        this.g.selectAll('path').data(countries.features)
            .enter().append('path')
                .attr('class', 'choropleth_country')
                .attr('d', this.pathGenerator)
                .attr('fill', d => colourScale(this.data.data[get_country_name[d.id]].value)) // get the colour matching to the value of our datapoint
            // show tooltip
            .on("mouseover", function(d) {
                self.tooltip.transition()
                    .duration(250)
                    .style("opacity", 1);
                self.tooltip.html(
                    "<p><strong>" + get_country_name[d.id] + "</strong></p>" +
                    "<table><tbody><tr><td class='wide'>" + self.data.legend_label + "</td><td>" + self.data.data[get_country_name[d.id]].value + "</td></tr>" +
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

        console.log("Drawing choropleth " + this.svg_id + " complete");
    }


    /*
     * Use the input data to prune the topo and name data which covers all countries of the world
     */
    filter_data(get_country_name) {

        // fetch the countries which we need to display from the input data
        var countries_to_find = Object.keys(this.data.data);

        // keep track of the values of the countries we need to visualize
        var values = [];

        // loop backwards through the countries and remove any not mentioned in the received data
        var countries_temp = this.topo_data.objects.countries.geometries;
        for (var i = countries_temp.length - 1; i >= 0; i--) {
            var curr_country_name = get_country_name[countries_temp[i].id];

            // remove irrelevant countries
            if (!countries_to_find.includes(curr_country_name)) {
                countries_temp.splice(i, 1);
            }

            // save the values of relevant countries
            else {
                values.push(this.data.data[curr_country_name].value)
            }
        }

        return values;
    }

    /**
     * Add the legend to the choropleth
     */
    add_legend(values, colourScale) {

        // what text to display in the legend
        var legend_text = [Math.min.apply(Math, values), "", "", "", "", "", "", "", "", Math.max.apply(Math, values)]

        // generate colours for legend colour bar
        var min = Math.min.apply(Math, values);
        var max = Math.max.apply(Math, values);
        var diff = max - min;
        var colours_range = this.range(min, max, diff/10);
        var legend_colours = colours_range.map(c => colourScale(c));


        var legenditem = this.legend.selectAll(".legenditem")
            .data(d3.range(10))
            .enter()
            .append("g")
                .attr("class", "legenditem")
                .attr("transform", function(d, i) { return "translate(" + i * 31 + ",0)"; });

        // legend colour bar
        legenditem.append("rect")
            .attr("x", 30)
            .attr("y", 50)
            .attr("width", 30)
            .attr("height", 6)
            .attr("class", "rect")
            .style("fill", function(d, i) { return legend_colours[i]; });

        // legend numeric range
        legenditem.append("text")
            .attr("x", 50)
            .attr("y", 40)
            .style("text-anchor", "middle")
            .text(function(d, i) { return legend_text[i]; });

        // legend title
         this.legend.append("g")
                .attr("class", "choropleth_legend_title")
            .append("text")
                .attr("x", 175)
                .attr("y", 25)
                .style("text-anchor", "middle")
                .text(this.data.legend_label);
    }

    /********************************************************************
    * Helper functions
    ********************************************************************/

    // calculate a range of numbers from start to stop with steps of step
    range(start, stop, step) {
        var a = [start], b = start;
        while (b < stop) {
            a.push(b += step || 1);
        }
        return a;
    }

}
