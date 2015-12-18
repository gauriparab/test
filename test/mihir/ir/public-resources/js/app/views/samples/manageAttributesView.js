/* global define:false*/
define([
    'jquery',
    'underscore',
    'backbone',
    'views/samples/manageAttributesGridView',
    'views/samples/addNewAttributeView',
    'views/samples/editAttributeView',
    'views/common/bannersView',
    'views/common/dialog',
    'views/samples/confirmObsoleteAttribute',
    'views/samples/confirmActivateAttribute',
    'views/common/baseModalView',
    'hb!templates/sample/sample-manage-attributes.html'
],

    function(
        $,
        _,
        Backbone,
        AttributesGridView,
        AddNewAttributeView,
	EditAttributeView,
        BannerView,
        Dialog,
	ConfirmActivateAttribute,
	ConfirmObsoleteAttribute,
	BaseModalView,
        template) {

	'use strict';

    /**
     * 
     *
     * @type {*}
     */
    var AttributesOverviewPageView = Backbone.View.extend({

        _template: template,
        _gridEl: '#viewattributes-grid',

        initialize: function() {
            this.gridView = new AttributesGridView();
	    this.gridView.on('action:edit', this._onEdit, this);
	    this.gridView.on('action:shuffleState', this._onShuffleState, this);
        },
        
        events:{
            'click #addNewAttribute' : '_addNewAttributeHandler',
        },

        delegateEvents: function() {
            Backbone.View.prototype.delegateEvents.apply(this, arguments);
        },

        undelegateEvents: function() {

            Backbone.View.prototype.undelegateEvents.apply(this, arguments);
        },

        render: function() {
            this.$el.html(this._template());
            this.gridView.setElement(this.$(this._gridEl)).render();
        },
	
        _addNewAttributeHandler : function(e) {
            e.preventDefault();
             BaseModalView.open(null, {
                 el: "#addNewAttributeModal",
                 grid: this.gridView
             }, AddNewAttributeView);
        },

	_onEdit: function(e, attribute){
	    e.preventDefault();
	    this.editAttributeView = new EditAttributeView({
		grid: this.gridView,
		model: attribute
	    });
	    this.editAttributeView.render();
	    this.editAttributeView.showModal();
	},
	
	_onShuffleState: function(e, model){
	    e.preventDefault();
	    var self = this;
	   // var model = this.gridView.getSelected().models[0];
	    model.set("isObsolete", !model.get("isObsolete"));
	    if(!model.get("isObsolete")) {
	    ConfirmObsoleteAttribute.open(function() {
		model.save(null, {
                    success: function() {
                        self.gridView.refresh();
                    }
            	});
	    });
	    } else{
		ConfirmActivateAttribute.open(function() {
                model.save(null, {
                    success: function() {
                        self.gridView.refresh();
                    }
                });
            });
	    }
	}

    });

    return AttributesOverviewPageView;
});
