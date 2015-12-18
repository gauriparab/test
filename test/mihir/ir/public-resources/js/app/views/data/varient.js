/*global define:false*/
define(['jquery', 
        'underscore', 
	'backbone',
        'kendo', 
        'views/formView', 
        'models/data/varient', 
        'views/errorsView', 
        'views/data/VarientGridView',
        'hb!templates/data/varient.html']
    .concat('bootstrap'),

    function($,
    		_, 
		Backbone,
    		kendo, 
    		FormView, 
    		Varient, 
    		ErrorsView, 
    		VarientGridView, 
    		template) {
        'use strict';
        var VarientView = Backbone.View.extend({

        	_gridEl: '#varient-grid',

            initialize: function(options) {
                this._oldContent = this.$el.html();
                options = options || {};
                this.id = options.resultId;
                this.model = new Varient({id:this.id});
                this.varientGridView = new VarientGridView({
                	resultId : this.id
                });
                
            },


            render: function() {
            	this.$el.html(template({
                    model: this.model.toJSON()
                }));
            	this.varientGridView.setElement(this.$(this._gridEl)).render();
            	return this;
            },
            
            destroy: function() {
                this.$el.html(this._oldContent);
                this.stopListening();
                return this;
            },
            
		    delegateEvents: function() {
	                FormView.prototype.delegateEvents.apply(this, arguments);
	        }
	        
	       
        });

        return VarientView;
    });