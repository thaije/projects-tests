"use strict";


var colour_map = ["red", "blue", "orange", "purple", "green"];


class Map extends KnowledgeGuiComponent {

    // call KnowledgeGUIComponent constructor
    constructor(container, state) {
        super(container, state);
    }

    /*
	 * Init function
	 */
    initialize(container, state) {

        // generate a unique ID for this map
        this.map_id = "map_" + Math.random().toString(36).substr(2, 9);

        // add the html of the map container
        var map_container = document.createElement("div");
        map_container.classList.add("map");
        map_container.id = this.map_id;
        container.getElement().append(map_container);

        // add the info popup for the map
        var map_tooltip_container = document.createElement("div");
        map_tooltip_container.id = this.map_id + "_popup";
        map_tooltip_container.classList = "ol-popup ol-popover";
        map_tooltip_container.innerHTML = `
            <a href="#" id="${this.map_id}_popup-closer" class="ol-popup-closer"></a>
            <div id="${this.map_id}_popup-content"></div>`;
        container.getElement().append(map_tooltip_container);

        console.log("Initialized map ", this.map_id);

        // on resize, change the map size
        var self = this;
        container.on('resize', function() {
            self.resize();
        });
    }

    /**
     * Change the map size when the window is resized
     */
    resize() {
        console.log("resized barchart")
        // recalculate the width and height of the plot
        var bounds = $("#" + this.map_id)[0].getBoundingClientRect();

        // resize to match non-zero window sizes if the map has been initialized
        if (bounds.width > 0 && bounds.height > 0 && this.map != null) {
            this.map.updateSize();
        }
    }


    update(data)
    {
        // dummy data
        /*
    	var data = {
            "map_label": "Military threat events",
            // NOTE: in the shape of [latitude, longitude]
            // NOTE: decimal indicator is a dot.
            "map_center": [54.939421, 26.0281669],
            "default_zoom": 6,
            "markers": [{
                    "name": "Military Parachute Vasylisks",
                    "type": "Event",
                    "description": "A farmer has found a military parachute close to his premises",
                    "date": "2020-02-15",
                    "time": 830,
                    "latitude": 54.715477,
                    "longitude": 25.025398
                },
                {
                    "name": "Border crossing Rus 1",
                    "type": "Event",
                    "description": "Border guards arrested two people trying to sneak into Lithuania",
                    "date": "2020-02-19",
                    "time": 845,
                    "latitude": 54.921266,
                    "longitude": 25.819180
                },
                {
                    "name": "Damaged Farmland Vievis 1",
                    "type": "Event",
                    "description": "Farmland crops have been damaged by non-natural causes",
                    "date": "2020-02-18",
                    "time": 1300,
                    "latitude": 54.770064,
                    "longitude": 24.801876
                }
            ]
        }
		*/
        console.log("Map data:", data);

        /******************************
         * Basemap
         ******************************/
        // Create the map
        this.map = new ol.Map({
            // enable fullscreen controls
            controls: ol.control.defaults().extend([new ol.control.FullScreen()]),
            // load the map layers
            layers: [
                new ol.layer.Tile({
                    source: this.get_map_source("open_street_map")
                })
            ],
            // start the map on the specified center and zoom
            view: new ol.View({
                center: ol.proj.fromLonLat(data.map_center.reverse()),
                zoom: data.default_zoom
            }),
            // ID of the target map div
            target: this.map_id
        });
        console.log("Initialized map");

        /******************************
         * Markers
         ******************************/

         // create a unique list of marker types
         var marker_types = [];
        data.markers.forEach(function(marker) {
            // keep track of all marker types so we can map them to a colour later
            if(!marker_types.includes(marker.type)) {
                marker_types.push(marker.type);
            }
        });
         // sort alphabetically
        marker_types.sort()

        // make a marker type <-> colour mapping
        var marker_type_colour_mapping = {};
        for(var i = 0; i < marker_types.length; i++) {
            marker_type_colour_mapping[marker_types[i]] = colour_map[i];
        }

        // create the markers
        var feature_source = new ol.source.Vector({
            features: []
        });
        var markers = [];
        // add each marker to a the source
        data.markers.forEach(function(marker) {
            // create the feature (as they are called in ol)
            var iconFeature = new ol.Feature({
              geometry: new ol.geom.Point(ol.proj.fromLonLat([marker.longitude, marker.latitude])),
              name: marker.name,
              type: marker.type,
              description: marker.description,
              date: marker.date,
              time: marker.time
            });

            // set the image
            var iconStyle = new ol.style.Style({
              image: new ol.style.Icon({
                crossOrigin: 'anonymous',
                src: '/static/images/map_marker_' + marker_type_colour_mapping[marker.type] + '.png',
                scale: 0.1
              }),
            });

            iconFeature.setStyle(iconStyle);

            // add the feature to the layer with all features
            feature_source.addFeature(iconFeature);
        })

        // add the marker source to a layer, and the layer to the map
        var layer = new ol.layer.Vector({
            source: feature_source
        });
        this.map.addLayer(layer);
        console.log("Added map markers");


        /******************************
         * Marker pop-up
         ******************************/
        var container = document.getElementById(this.map_id + '_popup');
        var content = document.getElementById(this.map_id + '_popup-content');
        var closer = document.getElementById(this.map_id + '_popup-closer');

        // create the popup as an OpenLayers overlay, and add it to the map
        var overlay = new ol.Overlay({
            id: this.map_id + "_overlay",
            element: container,
            autoPan: true,
            autoPanAnimation: {
                duration: 250
            }
        });
        this.map.addOverlay(overlay);

        // close the popup on click of the close button
        closer.onclick = function() {
            overlay.setPosition(undefined);
            closer.blur();
            return false;
        };

        // open and fill the popup when clicked on our marker
        var self = this;
        this.map.on('singleclick', function(event) {
            if (self.map.hasFeatureAtPixel(event.pixel) === true) {
                var coordinate = event.coordinate;

                // get the first feature at the clicked pixel
                var feature = self.map.getFeaturesAtPixel(event.pixel)[0];
                var feature_data = feature.getProperties();

                // create html for the popup based on the data saved in the feature
                var html = `
                <h3 class="ol-popover-header">${feature_data.name}</h3>
                <div class="ol-popover-body">
                <table><tbody>
                <tr><td>Type</td><td>${feature_data.type}</td></tr>
                <tr><td>Date</td><td>${feature_data.date}</td></tr>
                <tr><td>Time</td><td>${feature_data.time}</td></tr>
                <tr><td>Description</td><td>${feature_data.description}</td></tr>
                </tbody></table></div>`;

                content.innerHTML = html;
                overlay.setPosition(coordinate);
            } else {
                overlay.setPosition(undefined);
                closer.blur();
            }
        });
    }


    /*
     * Get the source for a map. Various options. Multiple can also be
     * loaded over eachother to quickly switch between them using a
     * dropdown, see: https://openlayers.org/en/latest/examples/bing-maps.html
     */
    get_map_source(name) {
        switch (name) {
            case "open_street_map":
                return new ol.source.OSM();
            case "regular":
                return new ol.source.XYZ({
                    url: "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
                });
            case "light":
                return new ol.source.XYZ({
                    url: "https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
                });
            case "satellite":
                return new ol.source.XYZ({
                    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png"
                });

                // bing maps below from example: https://openlayers.org/en/latest/examples/bing-maps.html
            case "bing_aerial":
                return new ol.source.BingMaps({
                    key: 'Ahm9afx4oAkReQLp-TMrtgtyu-sSv1EOsCxrJpSTCPyyv5gIKX7gPCzXU2vdazBx',
                    imagerySet: "Aerial"
                });
            case "bing_aerial_with_labels":
                return new ol.source.BingMaps({
                    key: 'Ahm9afx4oAkReQLp-TMrtgtyu-sSv1EOsCxrJpSTCPyyv5gIKX7gPCzXU2vdazBx',
                    imagerySet: "AerialWithLabelsOnDemand"
                });
            case "bing_road":
                return new ol.source.BingMaps({
                    key: 'Ahm9afx4oAkReQLp-TMrtgtyu-sSv1EOsCxrJpSTCPyyv5gIKX7gPCzXU2vdazBx',
                    imagerySet: "RoadOnDemand"
                });
            case "bing_ordnance":
                return new ol.source.BingMaps({
                    key: 'Ahm9afx4oAkReQLp-TMrtgtyu-sSv1EOsCxrJpSTCPyyv5gIKX7gPCzXU2vdazBx',
                    imagerySet: "OrdnanceSurvey"
                });
            default:
                return new ol.source.OSM();
        }
    }
}
