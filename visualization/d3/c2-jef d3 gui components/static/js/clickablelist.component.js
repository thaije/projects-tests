"use strict";



/* A list of items with a button that executes some user specified JS */
class ClickableList extends KnowledgeGuiComponent {

    // call KnowledgeGUIComponent constructor
    constructor(container, state) {
        super(container, state);
    }

    /*
	 * Init function
	 */
    initialize(container, state) {
        console.log(container);

        // generate a unique ID for initializing the datatable
        this.datatable_id = "datatable_kgc_" + Math.random().toString(36).substr(2, 9);

        // Creates sources <div> element
    	this.div = d3.create("div");
    	this.div.style("height", "100%");
    	this.div.style("overflow-y","auto");
    	// this is a datatable kgc
    	this.div.node().classList.add("datatable_kgc_container");
    	container.getElement().append(this.div.node());

        this.datatable_initialized = false;
    }

    /* Accepts data input:
    {
        "list": [
            {
                "jscript": 'alert("Opening item with id: factor1");',
                "name": "Factor 1"
            },
            {
                "jscript": 'alert("Opening item with id: factor2");',
                "name": "Factor 2"
            },
            {
                "jscript": 'alert("Opening item with id: factor3");',
                "name": "Factor 3"
            },
            {
                "jscript": 'alert("Opening item with id: factor4");',
                "name": "Factor 4"
            }
        ]
    }

    */
    update(data)
    {
    	// add the header
    	var sHtml = `<table id="${this.datatable_id}" class="datatable_kgc clickable-list display">
    	    <thead>
    	        <tr>
    	            <th>Factor / loop</th><th>Actions</th>
                </tr>
            </thead>
            <tbody>`;

        // add all factors / loops
        data.list.forEach(function(item){
    		sHtml += `<tr><th>${item.name}</th><th style='justify-content: center;display: flex;'><button class="reset_button" onclick="${item.jscript.replace(/"/g,"")}">Show info</button></th></tr>`;
    	});

        // add the footer (replaced by datatable.js with a dropdown filter)
        // uncomment to activate footer dropdown filters
//        sHtml += '<tfoot><tr>';
//    	var col;
//    	for(col of data.columns)
//    	{
//    		sHtml += '<th>' + col + '</th>';
//    	}
//    	sHtml += '</tr></tfoot>';


    	sHtml += '<tbody></table>';

    	const frag = document.createRange().createContextualFragment(sHtml)
    	this.div.node().appendChild( frag );

        // initialize this table as a datatable, if not already done
        if(!this.datatable_initialized) {
            this.datatable_initialized = true;

            // initialize the datatable, and add select search dropdowns for each column
            $("#" + this.datatable_id).DataTable({
                initComplete: function () {
                    console.log("Executing datatable function");
                    this.api().columns().every( function () {
                        console.log("Processing column")
                        var column = this;
                        var select = $('<select><option value=""></option></select>')
                            .appendTo( $(column.footer()).empty() )
                            .on( 'change', function () {
                                var val = $.fn.dataTable.util.escapeRegex(
                                    $(this).val()
                                );

                                column
                                    .search( val ? '^'+val+'$' : '', true, false )
                                    .draw();
                            } );

                        column.data().unique().sort().each( function ( d, j ) {
                            select.append( '<option value="'+d+'">'+d+'</option>' )
                        } );
                    } );
                }
            });
        }
    }
}
