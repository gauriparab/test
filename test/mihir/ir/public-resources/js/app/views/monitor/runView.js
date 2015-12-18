/* global define:false*/
define([
    'jquery',
    'underscore',
    'backbone',
    'views/ParentView',
    'views/common/bannersView',
    'views/monitor/otView',
    'views/monitor/pgmView',
    'views/monitor/qcDataView',
    'models/monitor/run',
    'views/assay/assayDetailView',
    'views/assay/templateDetailsView',
    'views/assay/plannedRunsDetailsView',
    'events/eventDispatcher',
    'hb!templates/monitor/run-view.html'
].concat(
    'views/common/grid/plugins/actionsGridPlugin',
    'views/common/grid/plugins/rowSelectionGridPlugin',
    'views/common/grid/plugins/multiSelectionGridPlugin'
),
    function(
        $,
        _,
        Backbone,
        ParentView,
        BannerView,
        OTView,
        PGMView,
        QcDataView,
        Run,
    	AssayDetailModel,
    	TemplateDetailsView,
    	PlannedRunDetailsView,
    	Dispatcher,
        template) {

	'use strict';

    var RunView = ParentView.extend({

        _template: template,

        initialize: function(options) {
            this.model = new Run(options.data);
		    this.otView = new OTView({
		    	data: options.data.otDto,
		    	showOT: options.data.showOT
		    });
		    this.pgmView = new PGMView({
		    	data: options.data.pgmDto
		    });
		    Dispatcher.on('change:libraries', this._selectLibrary, this);
        },
        
        events:{
        	'click .planDetails' : '_showPlanDetails',
        	'click #accordion-heading' : '_toggle'
        },

        delegateEvents: function() {
            Backbone.View.prototype.delegateEvents.apply(this, arguments);
        },

        undelegateEvents: function() {
            Backbone.View.prototype.undelegateEvents.apply(this, arguments);
        },

        render: function() {
            this.$el.html(this._template(this.model.toJSON()));
            this.renderSubView(this.otView, this.$el.find('.otView'));
            this.renderSubView(this.pgmView, this.$el.find('.pgmView'));
            var resultId= this.options.selectedLibrary ? this.options.selectedLibrary : this.model.toJSON().libraryResultDtos[0].id;
            $("select#libraries").val(resultId);
        	this._showResultForLibrary(resultId);
        },
       
    	_showPlanDetails: function(e){
    		var test ={};
    		test.id= this.model.toJSON().planId;
        	new PlannedRunDetailsView({
        		plan: test
        	}).render();
        },
        
        _showResultForLibrary:function(resultId) {
        	this.qcDataView = new QcDataView({
		    	data: this.options.data,
		    	resultId: resultId
		    });
        	this.renderSubView(this.qcDataView, this.$el.find('.qcDataView'));
        },
        
        _selectLibrary: function() {
        	var lib = $("#libraries").val();
        	this._showResultForLibrary(lib);
        	
        },
        
        _toggle: function() {
        	var open= $("#collapseQC").hasClass('in');
        	if(open){
        		$("i#toggle-qc").removeClass('icon-minus-sign').addClass('icon-plus-sign');
        	} else {
        		$("i#toggle-qc").removeClass('icon-plus-sign').addClass('icon-minus-sign');
        	}
        }
	
    });

    return RunView;
});
