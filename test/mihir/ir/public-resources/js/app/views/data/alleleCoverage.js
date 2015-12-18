/*global define:false*/
define(['jquery', 
        'underscore', 
	'backbone',
        'kendo', 
        'views/formView', 
        'models/data/alleleCoverage', 
        'views/errorsView', 
        'views/data/alleleCoverageGridView',
        'hb!templates/data/alleleCoverage.html']
    .concat('bootstrap'),

    function($,
    		_, 
		Backbone,
    		kendo, 
    		FormView, 
    		AlleleCoverage, 
    		ErrorsView, 
    		AlleleCoverageGridView, 
    		template) {
        'use strict';
        var AlleleCoverageView = Backbone.View.extend({

        	_gridEl: '#alleleCoverage-grid',

            initialize: function(options) {
                this._oldContent = this.$el.html();
                options = options || {};
                this.model = new AlleleCoverage(options.resultId);
                this.id = options.resultId;
                this.alleleCoverageGridView = new AlleleCoverageGridView({
                	resultId : this.id
                });
            },

            events: {
            },

            render: function() {
            	this.$el.html(template({
                    model: this.model.toJSON()
                }));
            	this.alleleCoverageGridView.setElement(this.$(this._gridEl)).render();
            	return this;
            },
            
            destroy: function() {
                this.$el.html(this._oldContent);
                this.stopListening();
                return this;
            },
            
		    delegateEvents: function() {
	                FormView.prototype.delegateEvents.apply(this, arguments);
	        },
        });

        return AlleleCoverageView;
    });