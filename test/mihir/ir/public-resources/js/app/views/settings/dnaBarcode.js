/* global define:false*/
define([ 'jquery',
         'underscore',
         'backbone',
         'views/settings/dnaBarcodeGrid',
         'views/settings/allBarcodeGrid',
         'hb!templates/settings/dna-barcode.html' ],

		function($,
				_,
				Backbone,
				DnaBaroceGrid,
        AllBaroceGrid,
				template) {

			'use strict';

			var DnaBaroceView = Backbone.View.extend({

				_template : template,
				_gridEl : '#dnaBarcode-grid',
        _allBarcodesGridEl:'#allBarcode-grid',


				initialize : function(options) {
					options = options || {};
					this.gridView = new DnaBaroceGrid();
					this.gridView.on('action:view_AllBarcode',
							this._showAllBarcode, this);
				},

        events:{
          'click #goBack': '_goBack'
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

					}));
					this.gridView.setElement(this.$(this._gridEl)).render();
				},

				_showAllBarcode : function(e, model) {

          $('#ctrl').css('display','none');
          $('#detail').css('display','block');

					//window.location = "references/barcodeset/" + assay.get('name');
          this.allBarcodesGridView = new AllBaroceGrid({
            name : model.toJSON().name
          });
          this.allBarcodesGridView.setElement(this.$(this._allBarcodesGridEl)).render();
				},

        _goBack: function(){
          delete this.allBarcodesGridView;
          $('#detail').css('display','none');
          $('#ctrl').css('display','block');
        }

			});

			return DnaBaroceView;
		});
