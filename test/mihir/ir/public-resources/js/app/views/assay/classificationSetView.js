/* global define:false*/
define([
        'jquery',
        'underscore',
        'backbone',
        'views/common/baseModalView',
        'views/assay/addClassificationSetView',
        'views/assay/classificationSetsGrid',
        'views/common/auditReasonView',
        'views/common/bannersView',
        'views/common/confirmModalView',
        'views/addNotesView',
        'views/viewNotes',
        'events/eventDispatcher',
        'hb!templates/assay/classification-sets-view.html',
        ],
function(
		$,
		_,
		Backbone,
		BaseModalView,
		AddClassificationSetView,
		ClassificationSetsGrid,
		AuditReasonView,
		BannerView,
		Confirm,
		AddNotesView,
        ViewNotes,
		Dispatcher,
		template) {
			'use strict';

			var ClassificationSetView = Backbone.View.extend({

				_template : template,
				_gridEl : '#classification-sets-grid',

				initialize : function(options) {
					options = options || {};
					this.gridView = new ClassificationSetsGrid();
					this.gridView.on('action:obsolete', this.onObsolete, this);
					this.gridView.on('action:add-note', this._onAddNote, this);
                    this.gridView.on('action:view-notes', this._viewNotes, this);
					Dispatcher.on('add:classificationSet', this.onComplete, this)
				},
				
				events: {
					"click a#addClassificationSets" : "addClassificationSets"
				},

				delegateEvents : function() {
					Backbone.View.prototype.delegateEvents.apply(this,
							arguments);
				},

				undelegateEvents : function() {
					Backbone.View.prototype.undelegateEvents.apply(this,
							arguments);
				},

				render : function() {
					this.$el.html(this._template);
					this.gridView.setElement(this.$(this._gridEl)).render();
				},
				
				addClassificationSets : function() {
                    BaseModalView.open(null, {
                        el: "#preset-dialog",
                    }, AddClassificationSetView);
				},
				
				onObsolete: function(e, classificationSet) {
					var self = this;
					Confirm.open(function() {
							$.ajax({
								url : '/ir/secure/api/rdxClassifications/makeObesolute?classificationId='+ classificationSet.toJSON().id,
								type : 'GET',
								contentType : 'application/json',
								success : function() {
									new BannerView({
										id : 'change-state-success-banner',
										container : $('.main-content>.container-fluid'),
										style : 'success',
										title : $.t('classificationSet.obsolete.success')
									}).render();
									self.gridView.refresh();
								}
							});
					},{
						headerKey : 'confirm.obsolete.classificationSet.title',
						bodyKey : 'classificationSet.obsolete.confirm'
					});
					
				},
				
				onComplete: function(messageKey) {
					 new BannerView({
			                container: $('.main-content').first(),
			                style: 'success',
			                titleKey: messageKey
			            }).render();
					 this.gridView.refresh();
				},
				
				_onAddNote: function(e, model) {
                    var self = this;
                    BaseModalView.open(null, {
                        el: "#addNotes",
                        entityId: model.toJSON().id,
                        entity: 'rdxClassifications',
                        onComplete: function() {
                            self.onComplete('specimen.add.notes.success');
                        }
                    }, AddNotesView);
                },
                _viewNotes: function(e, model) {
                    var self = this;
                    BaseModalView.open(null, {
                        el: "#viewNotes",
                        entityId: model.toJSON().id,
                        entity: 'rdxClassifications',
                        url: '/ir/secure/api/rdxClassifications/notes?classificationId=' + model.toJSON().id
                    }, ViewNotes);
                },
				
			});

			return ClassificationSetView;
		});
