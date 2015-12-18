/*global define:false*/
define(['jquery', 
        'underscore', 
        'backbone',
        'hb!templates/sample/add-dna-template.html'],
       function($, 
    		   _, 
    		   Backbone,
    		   template) {
    "use strict";
            
    var AddDnaView = Backbone.View.extend({
        initialize: function(options) {
        	options = options || {};
        	this.barcodes = options.barcodes || {};
        	this.data = options.data || {};
        },

        delegateEvents: function() {
            Backbone.View.prototype.delegateEvents.apply(this, arguments);
        },
        
        undelegateEvents: function() {
            Backbone.View.prototype.undelegateEvents.apply(this, arguments);
        },

        render: function() {
			this.$el.html(template({barcodes : this.barcodes, data : this.data}));
            return this;
        }

    });

    return AddDnaView;
});
