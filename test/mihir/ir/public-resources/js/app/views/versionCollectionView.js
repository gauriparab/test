/*global define:false*/
define(['jquery', 
        'underscore', 
        'backbone', 
        'events/eventDispatcher',
        'hb!templates/versions.html'], 
    function($, 
    		_, 
    		Backbone, 
    		dispatcher,
    		template) {
	
    "use strict";
    var VersionCollectionView = Backbone.View.extend({
    	
        initialize: function() {
		    if(!this.model.getVersion()) {
		    	this.model.setVersion(this.collection[0]);
		    }
        },

        events: {
            'change select#version': 'selectionChanged'
        },

        render: function() {
            this.$el.html(template({
                versions: this.collection
            }));
            if(!(this.model.getVersion()==null)) {
            	$("#version").val(this.model.getVersion().id);
            }            
            return this;
        },

        selectionChanged: function(e) {
            var value = $(e.currentTarget).val();
            var selectedVersion = $.grep(this.collection, function( n, i ) {return n.id == value;});
            dispatcher.trigger('change:version', selectedVersion[0]);
        }
    });

    return VersionCollectionView;
});
