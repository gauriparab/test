/* global define:false*/
define([
        'jquery',
        'underscore',
        'backbone',
        'views/common/bannersView',
        'views/common/baseModalView',
        'views/common/confirmModalView',
        'views/assay/filterChainGridView',
        'views/assay/filterChainDetailsView',
        'events/eventDispatcher',
		'hb!templates/assay/filter-chains-view.html' ],

function(
		$,
		_,
		Backbone,
		BannersView,
		BaseModalView,
		Confirm,
		FilterChainGridView,
		FilterChainDetailsView,
		Dispatcher,
		template) {

	'use strict';

	var FilterChainsView = Backbone.View.extend({

		_template : template,
		_gridEl : '#filter-chains-grid',

		initialize : function(options) {
			options = options || {};
			this.gridView = new FilterChainGridView();
			Dispatcher.on('add:filterChain', this._addSuccess, this);
			this.gridView.on('action:obsolete', this._obsolete, this);
			this.gridView.on('action:view_details', this._details, this);
		},

		delegateEvents : function() {
			Backbone.View.prototype.delegateEvents.apply(this, arguments);
		},

		undelegateEvents : function() {
			Backbone.View.prototype.undelegateEvents.apply(this, arguments);
		},

		render : function() {
			this.$el.html(this._template);
			this.gridView.setElement(this.$(this._gridEl)).render();
		},
        
		_addSuccess:function(){
			this.gridView.refresh();
		},
		
		_obsolete: function(e, model){
			var self = this;
			Confirm.open(function() {
				$.ajax({
					url : '/ir/secure/api/filterChain/obsoleteFilterChain',
					type : 'POST',
					data:JSON.stringify(model),
					contentType : 'application/json',
					success : function() {
						new BannersView({
							id : 'change-state-success-banner',
							container : $('.main-content'),
							style : 'success',
							title : $.t('filterChain.obsolete.success')
						}).render();
						self.gridView.refresh();
					}
				});
			},{
				headerKey : 'confirm.obsolete.filterChain.title',
				bodyKey : 'filterChain.obsolete.confirm'
			});
		},
		
		_details: function(e, model){
			var _model = model.toJSON();
			var self = this;
            BaseModalView.open(null, {
                el: "#viewFilterChainDetails",
                filterChainId : _model.id
            }, FilterChainDetailsView);
		}
	});

	return FilterChainsView;
});
