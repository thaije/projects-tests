"use strict";


class Table extends KnowledgeGuiComponent {

    // call KnowledgeGUIComponent constructor
    constructor(container, state) {
        super(container, state);
    }

    /*
	 * Init function
	 */
    initialize(container, state) {
        // Creates sources <div> element
    	this.div = d3.create("div");
    	this.div.style("height", "100%");
    	this.div.style("overflow-y","scroll");
    	container.getElement().append(this.div.node());
    }
    
    update(data)
    {
    
    	/*data = {
		  "columns": [
		    "given_name",
		    "surname",
		  ],
		  "results": [
		    [
		      "Joe",
		      "Schmoe"
		    ],
		    [
		      "Jane",
		      "Doe"
		    ]
		  ]
		};*/
    
    	var sHtml = '<table style="margin: 10px;" border="1"><thead><tr>';
    	var col;
    	for(col of data.columns)
    	{
    		sHtml += '<th style="padding: 2px;">' + col + '</th>';
    	}

    	sHtml += '</tr></thead><tbody>';
    	
    	var row, cell;
    	for(row of data.results)
    	{
    		sHtml += '<tr>';
    		for (cell of row)
    		{
    			sHtml += '<td style="padding: 2px;">' + cell + '</td>';
    		}
    		sHtml += '</tr>';
    	}
    	
    	sHtml += '<tbody></table>';
    	
    	const frag = document.createRange().createContextualFragment(sHtml)
    	this.div.node().appendChild( frag );
    }
}
