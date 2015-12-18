/* global define:false*/
define([
        'views/ParentView',
        'views/common/bannersView',
		'views/settings/referenceSequence',
		'views/settings/panels',
		'views/settings/hotspots',
		'views/settings/dnaBarcode',
		'views/settings/fusionReference',
		'views/settings/fusionPanel',
		'views/settings/geneList',
		'views/settings/controlFragments',
		'views/settings/primerView',
		'events/eventDispatcher',
		'hb!templates/settings/reference-overview-page.html' ],

function(
		ParentView,
		BannersView,
		ReferenceSequence,
		Panels,
		Hotspots,
		DnaBarcode,
		FusionReference,
		FusionPanel,
		GeneList,
		ControlFragments,
		PrimerView,
		Dispatcher,
		template) {

	'use strict';

	var ReferenceOverView = Backbone.View.extend({
		_template:template,
		initialize : function(options) {
			options = options || {};
			this.canAddReference = options.canAddReference;
			this.referenceSequenceView = new ReferenceSequence({
				canAddReference:this.canAddReference
			});
			this.panelsView = new Panels();
			this.hotspotsView = new Hotspots();
			this.dnaBarcodeView = new DnaBarcode();
			this.fusionReferenceView = new FusionReference({
				canAddFusionReference: options.canAddFusionReference
			});
			this.fusionPanelView = new FusionPanel({
				canAddFusionPanel: options.canAddFusionPanel
			});
			this.geneListView = new GeneList({
				canAddGeneList:options.canAddGeneList
			});
			this.primerView = new PrimerView({
				canAddPrimer : options.canAddPrimer
			});
			this.controlFragments = new ControlFragments();
			Dispatcher.on('upload:panel', this._uploadSuccess, this);
			Dispatcher.on('upload:hotspot', this._uploadSuccess, this);
			Dispatcher.on('upload:referenceSequence', this._uploadSuccess, this);
			Dispatcher.on('upload:geneList', this._uploadSuccess, this);
			Dispatcher.on('action:obsolete', this._uploadSuccess, this);
			Dispatcher.on('upload:fusion-reference', this._uploadSuccess, this);
			Dispatcher.on('upload:fusion-panel', this._uploadSuccess, this);
			Dispatcher.on('upload:primer', this._uploadSuccess, this);
			
			this._subViews=[
			            this.referenceSequenceView,
			            this.panelsView,
			            this.hotspotsView,
			            this.dnaBarcodeView,
			            this.fusionReferenceView,
			            this.fusionPanelView,
			            this.geneListView,
			            this.controlFragments,
			            this.primerView
			];
			
		},

		delegateEvents : function() {
			Backbone.View.prototype.delegateEvents.apply(this, arguments);
		},

		undelegateEvents : function() {
			Backbone.View.prototype.undelegateEvents.apply(this, arguments);
		},

		render : function() {
			var that = this;
			this.$el.html(this._template({
				showPrimer: this.options.showPrimer
			}));
			this.$el.find('#reference-tabs a').on('click', function(e){
				var tab = $(this).data('tab-id');
				var target = $(this).attr('href')
				that._subViews[tab].setElement(that.$(target)).render();
			});
			$('#reference-tabs a:first').trigger('click');
		},
		
		_uploadSuccess:function(data){
			new BannersView(data).render();
		}
	});

	return ReferenceOverView;
});