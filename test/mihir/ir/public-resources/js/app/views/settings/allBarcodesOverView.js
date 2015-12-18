/* global define:false*/
define([ 'jquery', 
         'underscore', 
         'backbone', 
         'views/settings/allBarcodeGrid', 
         'hb!templates/settings/all-barcode.html' ],

		function($, 
				_, 
				Backbone, 
				AllBaroceGrid, 
				template) {

			'use strict';

			var DnaBaroceView = Backbone.View.extend({

				_template : template,
				_gridEl : '#allBarcode-grid',
				

				initialize : function(options) {
					this.name = options.name;
					this.gridView = new AllBaroceGrid({
						name : options.name
					});
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
						name : this.name
					}));
					this.gridView.setElement(this.$(this._gridEl)).render();
				},

			});

			return DnaBaroceView;
		});
