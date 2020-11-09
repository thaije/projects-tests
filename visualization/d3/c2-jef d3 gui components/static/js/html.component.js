"use strict";


class HTML extends KnowledgeGuiComponent {

    // call KnowledgeGUIComponent constructor
    constructor(container, state) {
        super(container, state);
    }

    /*
	 * Init function
	 */
    initialize(container, state) {
    	var sHtml = this.state.html;
    	const frag = document.createRange().createContextualFragment(sHtml)
    	container.getElement().append(frag);
    }
    
    update(data)
    {
    }
}
