function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

/*
 * Retrieve indepth view name from query parameters.
 */
function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}


// TODO part of this config is repeated further down this code, so changing
// things here also requires changing things there. Or, just make sure we do not
// repeat this code twice!
var config={
	settings: {
		hasHeaders: true,
		constrainDragToContainer: true,
		reorderEnabled: true,
		selectionEnabled: false,
		popoutWholeStack: true,
		blockedPopoutsThrowError: true,
		closePopoutsOnUnload: true,
		showPopoutIcon: false,
		showMaximiseIcon: false,
		showCloseIcon: false
	},
	content:
	[
		{
			type: 'stack',
			content: [
				{
					type: 'row',
					title: 'Analytical view',
					content: [
						{
							type: 'component',
							cssClass: 'text_only',
							componentName: 'clickablelist',
							title: 'Factors',
							"componentState": {
                                "knowledge":
									`?object a ?objectType .
									?object ont:name ?someLabel .
									VALUES (?objectType) {(ont:Factor) (ont:Loop)}`,
                                "transformation": `{ "list": [results.bindings^(someLabel.value).{"name": someLabel.value, "jscript": "openAdditionalInfo('" & object.value & "');" }]}`,
                                "label": "v1areamap"
                            }
						}
					]
				}
			]
		}
	]
};

var myLayout=new GoldenLayout(config);

// add CSS class to windows if specified
myLayout.on( 'itemCreated', function( item ){
  if( item.config.cssClass ){
    item.element.addClass( item.config.cssClass );
  }
});

myLayout.registerComponent('additionalInfo', function(container, componentState){

	// use componentState.views to get the relevant in depth views.

    var html = `
    <div class="content_inner">
        <h2>&nbsp;</h2>
        <img class="additional_info_mockup" src="/static/images/properties_rise_patriotic_sentiments2.png">
        `;
    
    console.log("Views: " + componentState.views.length);
    
	for(inDepthViewName of componentState.views)
	{
		html += `<div class="card bg-primary text-white shadow indepth_view_button">
            <a class="card-body" href="javascript: openInDepthView('` + inDepthViewName + `');">
                <img class="indepth_view_icon" src="/static/images/view_icon.png">
                <div class="indepth_view_content">
                    <span class="indepth_view_title">INFORMATION ANALYSIS</span> <br>` + inDepthViewName + `
                </div>
                <img class="indepth_view_open_link_icon" src="/static/images/open_link.png">
            </a>
        </div>`;
	}
	html += `</div>`;

	container.getElement().html(html);
});

myLayout.registerComponent('placeholder', function(container, componentState){
    var html = `
    <div class="content_inner">
    Such emptiness...
 	</div>
    `;

	container.getElement().html(html);
});

myLayout.registerComponent('indepthViewHeader', function(container, componentState){
	var html = `
		<div class="content_inner sidepanel">` +
			componentState.description
		+ `</div>
	`;

	container.getElement().html(html);
});

myLayout.registerComponent('barchart', BarChart);
myLayout.registerComponent('linechart', LineChart);
myLayout.registerComponent('choropleth', Choropleth);
myLayout.registerComponent('twitter', Twitter);
myLayout.registerComponent('table', Table);
myLayout.registerComponent('datatable', Datatable);
myLayout.registerComponent('clickablelist', ClickableList);
myLayout.registerComponent('map', Map);
myLayout.registerComponent('html', HTML)

myLayout.init();

myLayout.on('initialised', function() {
	var stack = myLayout.root.contentItems[0].contentItems[0].contentItems[0];
	console.log("Stack: " + stack.config);
	stack.header.position(false);
	
	// if in-depth view parameter is set, go to in-depth view.
	var indepthViewName = getQueryVariable('view');
	openInDepthView(decodeURI(indepthViewName));
});


function showLevel3()
{
	console.log("switching to level3");
	document.getElementById('level1').style = 'display: none';
	document.getElementById('level3').style = 'display: inline';
}

function backToStart()
{
	myLayout.root.replaceChild(myLayout.root.contentItems[0],
		{
			type: 'stack',
			content: [
				{
					type: 'row',
					title: 'Analytical view',
					content: [
						{
							type: 'component',
							cssClass: 'text_only',
							componentName: 'clickablelist',
							title: 'Factors',
							"componentState": {
								"knowledge":
									`?object a ?objectType .
									?object ont:name ?someLabel .
									VALUES (?objectType) {(ont:Factor) (ont:Loop)}`,
                                "transformation": `{ "list": [results.bindings^(someLabel.value).{"name": someLabel.value, "jscript": "openAdditionalInfo('" & object.value & "');" }]}`,
                                "label": "v1areamap"
                            }
						}
					]
				}
			]
		}
	);

	myLayout.root.contentItems[0].contentItems[0].contentItems[0].header.position(false);
}

function openAdditionalInfo(objectId)
{
	console.log("opening additional info");
	
	// because we need the server to determine whether a view is relevant
	// and we do not want to do it synchronized (this is not recommended because
	// it
	// hangs the GUI), we use promises.
	
	var promises = [];
	// determine relevant in depth views
	for(view of viewConfig.views)
	{
		promises.push(isViewRelevant(objectId, view.name, view.knowledge));
	}

	var allPromises = Promise.all(promises);
	
	allPromises.then((relevantViews) => {
		var views = [];			
		for(relevantView of relevantViews)
		{
			if (relevantView != null)
			{
				views.push(relevantView);
			}
		}
		
		var alreadyExists = myLayout.root.getItemsById("additionalInfo1").length == 1;
		
		console.log("Already exists? " + alreadyExists);
		
		if (!alreadyExists)
		{
			console.log("Replace existing placeholder component: " + myLayout.root.contentItems[0]);
			myLayout.root.contentItems[0].contentItems[0].addChild({
		        "type": "component",
		        "componentName": "additionalInfo",
		        "id": "additionalInfo1",
		        "componentState": {
					"views": views,
		        },
		        "cssClass": 'text_only additional_info'
			});
			var items = myLayout.root.getItemsById("additionalInfo1");
			
			console.log("items: " + items.length);
			items[0].parent.header.position(false)
			items[0].parent.config.width = 20;
			myLayout.updateSize();
		}
		else
		{
			myLayout.root.contentItems[0].contentItems[0].contentItems[1].replaceChild(myLayout.root.getItemsById("additionalInfo1")[0], {
		        "type": "component",
		        "componentName": "additionalInfo",
		        "id": "additionalInfo1",
		        "width": 20,
		        "componentState": {
					"views": views,
		        },
		        "cssClass": 'text_only additional_info'
			});
			var items = myLayout.root.getItemsById("additionalInfo1");
			
			console.log("items: " + items.length);
			items[0].parent.header.position(false)
			myLayout.updateSize();
		}
	
	});

}


function isViewRelevant(objectId, viewName, viewKnowledge)
{
    var host = window.location.hostname;
	var port = window.location.port;
	var baseUri = "https://" + host + ":" + port + "/";
	
	var sparqlQuery = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
		PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
		PREFIX ont: <https://www.tno.nl/defense/ontology/v1905/bottomup/>
		PREFIX v1905: <https://www.tno.nl/defense/ontology/v1905/>
		PREFIX owl: <http://www.w3.org/2002/07/owl#>
		PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
		PREFIX : <https://www.tno.nl/defense/data/v1905/sentiment.csv/>
		SELECT ?object {` + view.knowledge + `}`;

	return axios.get("http://" + host + ":" + port + "/query", { params: { query: sparqlQuery } }).then( function(response)
        {
            console.log("SPARQL result: " + JSON.stringify(response.data));
            
            var bindings = response.data.results.bindings;
            
            if (bindings.length > 0)
            {
            	for(binding of bindings)
            	{
            		if (binding.object.value == objectId)
            		{
            			return viewName;
            		}
            		else
            		{
            			return null;
            		}
            	}
            }
	});
}

// uses globally defined viewConfig variable in conf/views.js
function openInDepthView(viewName)
{
	// select correct indepth view config.
	console.log("incoming view name: " + viewName);
	var selectedView = jsonata('views[name="' + viewName + '"]').evaluate(viewConfig);
	if(selectedView != undefined)
	{
		console.log('selected view: ' + selectedView);
		var viewDescription = jsonata(`description`).evaluate(selectedView);
		console.log('selected view name: ' + viewName);
		var content = jsonata(`KGCGoldenLayout`).evaluate(selectedView);
		console.log("In-depth view content: " + content);
	
		var content2 = JSON.parse(JSON.stringify(content));
		
		
		
		var newContent = {
			"type": "row",
			"content": [
				content2,
				{
					"type": "component",
					"title": "",
					"width": 20,
					"componentName": "indepthViewHeader",
					"cssClass": 'text_only additional_info', 
					"isClosable": false,
					"componentState": {
						"name": viewName,
						"description": viewDescription
	                 }
				}
			]
		}
		
		console.log(JSON.stringify(content2));
		console.log("Add in depth view");
		myLayout.root.contentItems[0].addChild({
	        "type": "column",
	        "title": viewName,
			"content": [newContent]
		}, 1);
	
		myLayout.root.contentItems[0].contentItems[1].contentItems[0].contentItems[1].header.position(false)

	}
	else
	{
		console.log("Could not find in-depth view: " + viewName);
	}

}
