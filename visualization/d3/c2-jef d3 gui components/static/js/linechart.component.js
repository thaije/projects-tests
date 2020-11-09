"use strict";

var colour_map = ["red", "blue", "orange", "purple", "green"];

class LineChart extends KnowledgeGuiComponent {

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
        this.margin = {
            top: 40,
            right: 20,
            bottom: 40,
            left: 50
        };
        this.svg = d3.create("svg");
        this.svg.attr("id", this.svg_id);
        container.getElement().append(this.svg.node());

        // Fetch the <svg> element
        var bounds = this.svg.node().getBoundingClientRect();

        // sit dimensions
        this.width = bounds.width;
        this.height = bounds.height;

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
        console.log("resized linechart")
        // recalculate the width and height of the plot
        var bounds = this.svg.node().getBoundingClientRect();
        this.width = bounds.width;
        this.height = bounds.height;
        this.svg.attr("viewBox", "0,0, " + this.width + "," + this.height);

        // remove old nodes
        this.svg.selectAll("*").remove();

        // redraw the barchart
        if (this.data != null) {
            this.update(this.data, true);
        }
    }




    /*
     * This function creates the linechart with the passed data, dynamically fixing the axes and elements
     * of the existing linechart if new data is passed.
     * The resize param is used to determine if the update is triggered by a resize of the window, or was caused
     * by the initialization script.
     */
    update(new_data, resize = false) {
        console.log("Calling linechart update");

        // data should be:
//        new_data = {
//            "data": [{
//                    "date": "21-2-2020",
//                    "trend1": 7,
//                    "trend2": 9
//                },
//                {
//                    "date": "24-2-2020",
//                    "trend1": 10,
//                    "trend2": 12
//                },
//                {
//                    "date": "25-2-2020",
//                    "trend1": 16,
//                    "trend2": -4
//                }
//            ]
//        }


        // data received is:
        // Issues: duplicate data, trends in seperate items, dates not in order, items with 1 datapoint
//        new_data = {
//            "legend_label": "Incidents essential services",
//            "data": [
//                {
//                    "date": "2020-02-08",
//                    "CyberScanning": 5
//                },
//                {
//                    "date": "2020-02-08",
//                    "CyberScanning": 5
//                },
//                {
//                    "date": "2020-02-08",
//                    "CyberScanning": 5
//                },
//                {
//                    "date": "2020-02-10",
//                    "CyberScanning": 10
//                },
//                {
//                    "date": "2020-02-08",
//                    "DDoS attack": 1
//                },
//                {
//                    "date": "2020-02-09",
//                    "Powercut": 1
//                },
//                {
//                    "date": "2020-02-10",
//                    "DDoS attack": 1
//                },
//                {
//                    "date": "2020-02-27",
//                    "Powercut": 1
//                },
//                {
//                    "date": "2020-02-28",
//                    "Malware_attack": 1
//                }
//            ]
//        }

        if (!resize) {
            console.log("Setting data in barchart:", new_data);
            this.data = new_data.data;
            this.legend_label = new_data.legend_label;

            // merge all items that have the same date
            var merged_data = {};
            this.data.forEach(function(d) {
                // add any new dates to our merged data list
                if (!merged_data.hasOwnProperty(d.date)) {
                    merged_data[d.date] = d;
                }

                // merge any items with the same date
                else {
                    merged_data[d.date] = Object.assign({}, merged_data[d.date], d);
                }
            })
            // make it into a list
            this.data = Object.values(merged_data);

            // order data based on date field
            this.data.sort(function(a,b) {
                if (a.date < b.date) {return -1} else { return 0}
            })

            // format the date data
            var parseTime = d3.timeParse("%Y-%m-%d");
            this.data.forEach(function(d) {
                d.date = parseTime(d.date);
            });


            // create a list with the labels of all lines present in the data
            var line_labels = [];
            this.data.forEach(function(d) {
                Object.keys(d).forEach(function(key) {
                    if (!line_labels.includes(key) && key != "date") {
                        line_labels.push(key);
                    }
                })
            });
            this.line_labels = line_labels;

            // sort alphabetically
            this.line_labels.sort()

            // make a line label <-> colour mapping
            this.line_type_colour_mapping = {};
            for(var i = 0; i < this.line_labels.length; i++) {
                this.line_type_colour_mapping[this.line_labels[i]] = colour_map[i];
            }
        }

        var self = this;

        // set the x range and domain
        var x = d3.scaleTime()
            .range([this.margin.left, this.width - this.margin.right])
            .domain(d3.extent(this.data, function(d) {
                return d.date;
            }));

        // get all values of all lines
        var all_values = [];
        Object.values(this.data).forEach(function(timepoint) {
            Object.keys(timepoint).forEach(function(key) {
                if (key != "date") {
                    all_values.push(timepoint[key]);
                }
            });
        });

        // set the y range and domain between the max and min of the data
        var y = d3.scaleLinear()
            .domain([d3.min(all_values)-1, d3.max(all_values)+1])
            .range([this.height - this.margin.bottom, this.margin.top]);

        // add the linechart container
        this.svg.append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        // date format for in the tooltip
        var tooltip_date_format = d3.timeFormat("%d-%m-%Y");

        // add each line
        this.line_labels.forEach(function(line_label) {
//            console.log("line/dot with colour", this.line_type_colour_mapping[line_label]);
            var l = d3.line()
                .x(function(d) {
                    return x(d.date);
                }) // x values of the line
                .y(function(d) {
                    return y(d[line_label]);
                }) // y values of the line
                .curve(d3.curveMonotoneX); // apply smoothing to the line

            // Add the valueline path.
            self.svg.append("path")
                // skip any dates for which this line has no datapoint
                .data([self.data.filter(function(d) { if(d.hasOwnProperty(line_label)) { return d; } })])
                .attr("class", "line")
                .style("stroke", self.line_type_colour_mapping[line_label])
                .attr("d", l);

            // append a circle for each datapoint
            self.svg.selectAll(".dot-" + line_label)
                    // skip any dates for which this line has no datapoint
                    .data(self.data.filter(function(d) { if(d.hasOwnProperty(line_label)) { return d; } }))
                .enter().append("circle") // Uses the enter().append() method
                    .attr("class", "dot") // Assign a class for styling
                    .attr("cx", function(d, i) {
                        return x(d.date)
                    })
                    .attr("cy", function(d) {
                        return y(d[line_label])
                    })
                    .attr("fill", self.line_type_colour_mapping[line_label])
                    .attr("stroke", self.line_type_colour_mapping[line_label])
                    .attr("r", 4)
                    .attr("line_label", line_label)
                    .on("mouseover", function(d) {
                        var el = d3.select(this);
                        var line_label = el.attr("line_label");

                        // change fill of datapoint
                        el.attr('fill', "white")

                        // show tooltip
                        self.tooltip.transition()
                            .duration(250)
                            .style("opacity", 1);
                        self.tooltip.html(
                            "<p><strong>" + line_label + "</strong></p><br>" +
                            "<table><tbody><tr><td>Value:</td><td>" + d[line_label] + "</td></tr><tr><td>Date:</td>" +
                            "<td>" + tooltip_date_format(d['date']) + "</td></tr></tbody></table>"
                        )
                            .style("left", (d3.event.pageX + 15) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                    })
                    .on("mouseout", function(d) {
                        var el = d3.select(this);
                        // change dot fill
                        el.attr("fill", self.line_type_colour_mapping[line_label])

                        // hide tooltip
                        self.tooltip.transition()
                            .duration(250)
                            .style("opacity", 0);
                    });
        })

        // Add the X Axis
        this.svg.append("g")
            .attr("transform", "translate(0," + (this.height - this.margin.bottom) + ")")
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%d-%m-%Y"))) //.ticks(this.data.length * 2))
            .call(g => g.append("text")
                .attr("x", self.width / 2.0)
                .attr("y", self.margin.bottom - 10)
                .attr("fill", "black")
                .attr("text-anchor", "start")
                .text("Date"));

        // Add the Y Axis
        this.svg.append("g")
            .attr("transform", "translate(" + this.margin.left + ", 0)")
            .call(d3.axisLeft(y))
            .call(g => g.append("text")
                    .attr("x", -self.height/2)
                    .attr("y", -35)
                    .attr("fill", "black")
                    .attr("text-anchor", "start")
                    .text("Popularity")
                    .attr("transform", "rotate(-90)" ));


        // Add the legend
        var lineLegend = this.svg.selectAll(".lineLegend")
            .data(this.line_labels)
            .enter().append("g")
            .attr("class","lineLegend")
            .attr("transform", function (d,i) {
                return "translate(" + (self.margin.left + 20 + i * (self.width * 0.19)) + "," + (self.margin.top) +")"; // aligned top next to eachother
//                    return "translate(" + (0.85 * self.width - self.margin.left) + "," + (self.margin.top + (i * 25)) +")"; // aligned right
                });


        lineLegend.append("text")
            .text(function (d) {  return d; })
            .attr("transform", "translate(15,9)"); //align texts with boxes

        lineLegend.append("rect")
            .attr("fill", function (d, i) {return self.line_type_colour_mapping[d]; })
            .attr("width", 10).attr("height", 10);
    }
}
