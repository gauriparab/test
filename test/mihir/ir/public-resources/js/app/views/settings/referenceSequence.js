/* global define:false*/
define([ 'jquery', 'underscore', 'backbone', 'views/settings/referenceGenomeGrid',
         'views/settings/addReferenceGenomeView', 'views/common/baseModalView', 'events/eventDispatcher',
		'hb!templates/settings/reference-sequence.html' ],

function($, _, Backbone, ReferenceGenomeGrid, AddReferenceGenomeView, BaseModalView, Dispatcher, template) {

	'use strict';

	var ReferenceSequence = Backbone.View.extend({

		_template : template,
		_gridEl : '#reference-sequence-grid',

		initialize : function(options) {
			options = options || {};
			this.canAddReference = options.canAddReference;
			this.gridView = new ReferenceGenomeGrid();
			Dispatcher.on('upload:referenceSequence', this._uploadSuccess, this);
		},
		
		events: {
			'click #addReference': '_onAddReferenceGenome'
		},

		delegateEvents : function() {
			Backbone.View.prototype.delegateEvents.apply(this, arguments);
		},

		undelegateEvents : function() {
			Backbone.View.prototype.undelegateEvents.apply(this, arguments);
		},

		render : function() {
			this.$el.html(this._template({
				canAddReference:this.canAddReference
			}));
			this.gridView.setElement(this.$(this._gridEl)).render();
		},
		
		_onAddReferenceGenome: function() {
            var self = this;
            BaseModalView.open(null, {
                el: "#addReferenceSequenceModal"
            }, AddReferenceGenomeView);
        },
        
        _uploadSuccess:function(data){
        	var that = this;
			setTimeout(function(){
				that.gridView.refresh();
			},250);
		}
	});

	return ReferenceSequence;
});
