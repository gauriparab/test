/* global define:false*/
define([
    'jquery',
    'underscore',
    'backbone',
    'models/monitor/run',
    'views/data/qcView',
    'views/data/internalControlQCView',
    'hb!templates/monitor/run-qcdata-view.html'
],
    function(
        $,
        _,
        Backbone,
        Run,
        QCView,
        InternalControlQCView,
        template) {

	'use strict';

    var QcDataView = Backbone.View.extend({

        _template: template,
        _runQcEl: "#runQc",
        _controlQcEl: "#controlQc",
        _sampleQcEl: "#sampleQc",
        _internalControlQcEl: "#internalControlQc",

        initialize: function(options) {
            this.model = new Run(options.data);
            this.runQcView = new QCView({
            	id: options.resultId,
            	type: "Run QC"
            });
            this.sampleQcView = new QCView({
            	id: options.resultId,
            	type: "Sample QC"
            });
            this.controlQcView = new QCView({
            	id: options.resultId,
            	type: "Internal Control QC"
            });
            this.internalControlQcView = new InternalControlQCView({
            	id: options.resultId
            });
        },
        
        events:{
        },

        delegateEvents: function() {
            Backbone.View.prototype.delegateEvents.apply(this, arguments);
        },

        undelegateEvents: function() {
            Backbone.View.prototype.undelegateEvents.apply(this, arguments);
        },

        render: function() {
            this.$el.html(this._template(this.model.toJSON()));
            if(!this.model.toJSON().template) {
            	this.runQcView.setElement(this.$(this._runQcEl)).render();
            	this.controlQcView.setElement(this.$(this._controlQcEl)).render();
	            if(!(this.model.toJSON().metagenomics || this.model.toJSON().genericWorkflow)) {
	            	this.sampleQcView.setElement(this.$(this._sampleQcEl)).render();
	            }
            } else {
            	this.internalControlQcView.setElement(this.$(this._internalControlQcEl)).render();
            }
            
        }
	
    });

    return QcDataView;
});
