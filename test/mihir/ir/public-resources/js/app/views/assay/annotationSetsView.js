/* global define:false*/
define([
        'jquery',
        'underscore',
        'backbone',
        'views/common/bannersView',
        'views/common/baseModalView',
        'views/common/confirmModalView',
        'views/assay/annotationSetGridView',
        'views/assay/annotationSetsDetailsView',
        'events/eventDispatcher',
		'hb!templates/assay/annotation-sets-view.html' ],

function(
		$,
		_,
		Backbone,
		BannersView,
		BaseModalView,
		Confirm,
		AnnotationSetGridView,
		AnnotationSetsDetailsView,
		Dispatcher,
		template) {

	'use strict';

	var AnnotationSetsView = Backbone.View.extend({

		_template : template,
		_gridEl : '#annotation-sets-grid',

		initialize : function(options) {
			options = options || {};
			this.gridView = new AnnotationSetGridView();
			this.showAnnotationSetAddButton = options.showAnnotationSetAddButton;
			Dispatcher.on('add:annotationSet', this._addSuccess, this);
			this.gridView.on('action:lock', this._lock, this);
			this.gridView.on('action:view_details', this._details, this);
            this.gridView.on('action:obsolete', this._obsolete, this);
		},

		delegateEvents : function() {
			Backbone.View.prototype.delegateEvents.apply(this, arguments);
		},

		undelegateEvents : function() {
			Backbone.View.prototype.undelegateEvents.apply(this, arguments);
		},

		render : function() {
			this.$el.html(this._template({
				showAnnotationSetAddButton:this.showAnnotationSetAddButton
			}));
			this.gridView.setElement(this.$(this._gridEl)).render();
		},
        
		_addSuccess:function(){
			this.gridView.refresh();
		},
		
		_lock: function(e, model){
			var self = this;
			Confirm.open(function() {
				$.ajax({
					url : '/ir/secure/api/annotationSourceSet/lockAnnotationSet',
					type : 'POST',
					data:JSON.stringify(model),
					contentType : 'application/json',
					success : function() {
						new BannersView({
							id : 'change-state-success-banner',
							container : $('.main-content'),
							style : 'success',
							title : 'Successfully Locked Annotation Set'
						}).render();
						self.gridView.refresh();
					}
				});
			},{
				headerKey : 'Lock Annotation Set',
				bodyKey : 'Are you sure you want to lock this Annotation Set?'
			});
		},
		
		_obsolete: function(e, model){
			var self = this;
			Confirm.open(function() {
				$.ajax({
					url : '/ir/secure/api/annotationSourceSet/obsoleteAnnotationSet',
					type : 'POST',
					data:JSON.stringify(model),
					contentType : 'application/json',
					success : function() {
						new BannersView({
							id : 'change-state-success-banner',
							container : $('.main-content'),
							style : 'success',
							title : $.t('annotationSet.obsolete.success')
						}).render();
						self.gridView.refresh();
					}
				});
			},{
				headerKey : 'confirm.obsolete.annotationSet.title',
				bodyKey : 'annotationSet.obsolete.confirm'
			});
		},

		
		_details: function(e, model){
			var _model = model.toJSON();
			var self = this;
            BaseModalView.open(null, {
                el: "#viewAnnotationSetsDetails",
                annotationSetId : _model.id
            }, AnnotationSetsDetailsView);
		}
	});

	return AnnotationSetsView;
});
