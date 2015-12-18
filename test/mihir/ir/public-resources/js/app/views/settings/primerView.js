/* global define:false*/
define([
        'views/ParentView',
        'views/common/baseModalView',
	    'views/common/bannersView',
        'views/settings/addPrimerView',
        'views/settings/primerGrid',
        'events/eventDispatcher',
        'hb!templates/settings/primer.html'],

		function(
				ParentView,
				BaseModalView,
				BannersView,
				AddPrimerView,
				PrimerGrid,
				Dispatcher,
				template) {

			'use strict';

			var PrimersView = Backbone.View.extend({

				_template : template,
				_gridEl : '#primer-grid',

				initialize : function(options) {
					options = options || {};
					this.gridView = new PrimerGrid();
					var that = this;
					Dispatcher.on('upload:primer', this._uploadSuccess, this);
				},
				
				events: {
					"click a#addPrimer" : "addPrimer"
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
					this.$el.html(this._template({
						canAddPrimer : this.options.canAddPrimer
					}));
					this.gridView.setElement(this.$(this._gridEl)).render();
				},
				
				addPrimer : function() {
                    BaseModalView.open(null, {
                        type: "add",
                        el: "#addPrimerModal"
                    }, AddPrimerView);
				},
				
				_uploadSuccess:function(){
					var self = this;
					setTimeout(function() {
						self.gridView.refresh();
					}, 5000);
				}
				
			});

			return PrimersView;
		});
