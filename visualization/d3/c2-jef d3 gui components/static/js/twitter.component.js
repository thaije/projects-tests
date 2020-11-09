"use strict";


class Twitter extends KnowledgeGuiComponent {

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
    	this.div.attr("class", "twitter-window");

    	container.getElement().append(this.div.node());
    }
    
    update(data)
    {
        const sHtml = '<a class="twitter-timeline" data-width="100%" data-height="100%" data-chrome="nofooter noheader transparent" data-dnt="true" href="https://twitter.com/' + data.account + '?ref_src=twsrc%5Etfw">Tweets by ' + data.account + '</a> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>';
    	const frag = document.createRange().createContextualFragment(sHtml)
    	this.div.node().appendChild( frag );
    }
    
}
