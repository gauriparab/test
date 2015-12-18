/*global define:false*/
define(['jquery', 'underscore', 'backbone', 'i18n', 'views/formView', 'views/errorsView', 'collections/dataTypes', 'models/sampleAttribute',
        'hb!templates/sample/edit-new-attribute.html'].concat('bootstrap.modal', 'bootstrap.modalmanager'),
    function($, _, Backbone, i18n, FormView, ErrorsView, DataTypesCollection, SampleAttribute, template) {
    "use strict";

    var AddAttributeView = FormView.extend({

        id: 'editAttributeModal',

        tagName: 'div',

        className: 'modal fade',

        // FormView
        //submitButtonSelector: '#addAttributeBtn',
        cancelButtonSelector: '.btn-secondary',

        initialize: function(options) {
            this.modalVisible = false;
            this.dataTypes = new DataTypesCollection();
           // this.model = new SampleAttribute();
	        this.grid = options.grid;
	        this.errorsView = new ErrorsView({
                model: this.model
            });
        },

        events: {
            'show' : '_modalShowHandler',
            'hide' : '_modalHideHandler',
            'change input#editAttributeName' : 'setAttributeName',
            'click input#editIsMandatory' : 'setRequired',
            'change select#editDataTypes' : 'selectionChanged',
	    'click #editAttributeBtn' : 'save'
        },
        
        delegateEvents: function() {
            FormView.prototype.delegateEvents.apply(this, arguments);
        },

        render: function() {
			var self=this;
			this.dataTypes.fetch().done(function(){
		        self.$el.html(template({
		            attribute: self.model.toJSON(),
		            dataTypes: self.dataTypes.toJSON()
		        }));
		        self.renderSubView(self.errorsView, "#errors");
			$("#editDataTypes").val(self.model.toJSON().attributeTypeID);
			});
            this.$el.modal({
                show: false,
                backdrop: 'static',
                attentionAnimation: null,
                keyboard: false
            });
            this._updateDialogButtonStates();
            return this;
        },

        showModal: function () {
            this.delegateEvents();
            this.$el.modal('show');
        },

        isModalVisible: function () {
            return this.modalVisible;
        },

        _updateDialogButtonStates: function () {
            this.enableButton(this.cancelButtonSelector);
            this.enableButton(this.submitButtonSelector);
        },

        // FormView
        save : function () {
            var self = this;
            //this.disableButton(this.cancelButtonSelector);
	    if(!this.model.get("attributeTypeID")){
		this.model.set("attributeTypeID", $("#editDataTypes").val());
	    }
	    if(!this.model.get("isMandatory")){
		this.model.set("isMandatory", false);	    
	    }
            this.model.save(null, {
                success : function(){
                    self.$el.modal('hide');
                    self._updateDialogButtonStates();
                    self.grid.refresh();
                }
            });
        },
        
        _modalShowHandler: function () {
            this.modalVisible = true;
        },

        _modalHideHandler: function () {
            this.modalVisible = false;
        },
        
        setAttributeName: function(e) {
            this.model.set(e.currentTarget.name, e.currentTarget.value);
        },
        
        setRequired: function(e) {
            this.model.set(e.currentTarget.name, e.currentTarget.checked);
        },
        
        selectionChanged: function(e){
            this.model.set("attributeTypeID", e.currentTarget.value);
        },
        
    });

    return AddAttributeView;
});
