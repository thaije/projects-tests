"use strict";

class KnowledgeGuiComponent {

    /*
	 * Init function
	 */
    constructor(container, state) {
        this.container = container;
        this.state = state;
        this.knowledge = state.knowledge;
        this.transformation = state.transformation;
        var host = window.location.hostname;
		var port = window.location.port;
		var wsport = 61614;
		var scport = 3330;
		var baseUri = "https://" + host + ":" + port + "/";
        
		if (this.knowledge != undefined)
		{
	        // SPARQL query the smart connector.
			var sparqlQuery = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
			PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
			PREFIX ont: <https://www.tno.nl/defense/ontology/v1905/bottomup/>
			PREFIX v1905: <https://www.tno.nl/defense/ontology/v1905/>
			PREFIX owl: <http://www.w3.org/2002/07/owl#>
			PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
			PREFIX : <https://www.tno.nl/defense/data/v1905/sentiment.csv/>
			
			SELECT * {` +
				this.knowledge + 
			`}`;
	
	        // Global variable for all data
	        this.data;
	        this.initialized = false;
	
	        var self = this;
			axios.get("http://" + host + ":" + port + "/query", { params: { query: sparqlQuery } }).then( function(response)
	            {
	                console.log("doUpdate called: ", self);
	                var data = jsonata(self.transformation).evaluate(response.data);
	                console.log("Data: " + JSON.stringify(data));
	                self.data = data;
	
	                if (self.initialized) {
	                    self.update(self.data);
	                }
			});

		}
        // when the container has finished loading, initialize the GUI component
        var self = this;
        container.on('open', function() {
            console.log("Finished opening component");
		    self.initialize(container, state);
		    self.initialized = true;


            if (self.data != null) {
                console.log ("Data is not null?");
                self.update(self.data);
            }
		});

    }

    // dummy initialize, overwritten by child classes
    initialize(container, state) {}

}
