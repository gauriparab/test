/*global define:false*/
define(['jquery', 
        'underscore', 
	'backbone',
        'kendo', 
        'views/formView', 
        'models/data/audit', 
        'views/errorsView', 
        'views/data/auditTrailGridView',
        'hb!templates/data/audit-trail.html']
    .concat('bootstrap'),

    function($,
    		_, 
		Backbone,
    		kendo, 
    		FormView, 
    		Audit, 
    		ErrorsView, 
    		AuditTrailGridView, 
    		template) {
        'use strict';
        var AuditResultView = Backbone.View.extend({

        	_gridEl: '#viewAuditTrail-grid',

            initialize: function(options) {
                this._oldContent = this.$el.html();
                options = options || {};
                this.model = new Audit(options.resultId);
                this.id = options.resultId;
                this.auditTrailGridView = new AuditTrailGridView({
                	resultId : this.id
                });
            },

            events: {
            },

            render: function() {
            	this.$el.html(template({
                    model: this.model.toJSON()
                }));
            	this.auditTrailGridView.setElement(this.$(this._gridEl)).render();
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

        return AuditResultView;
    });