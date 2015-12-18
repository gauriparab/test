/*global define:false*/
define(['views/common/baseModalView', 'collections/dataTypes', 'models/sampleAttribute',
        'hb!templates/sample/add-new-attribute.html', 'hb!templates/common/confirm-modal-footer.html'].concat('bootstrap.modal', 'bootstrap.modalmanager'),
    function(BaseModalView, DataTypesCollection, SampleAttribute, bodyTemplate, footerTemplate) {
    "use strict";

    var AddAttributeView = BaseModalView.extend({

        _options: function() {
			return {
				bodyTemplate: bodyTemplate,
				headerKey: 'add.attribute.title',
				modalOptions : {
                    backdrop: 'static',
                    attentionAnimation: null,
                    keyboard: false,
                    show : true
                }
			}
		},
		
        initialize: function(options) {
            this.modalVisible = false;
            this.dataTypes =new DataTypesCollection();
            this.model = new SampleAttribute();
	        this.grid = options.grid;
	        BaseModalView.prototype.initialize.call(this, options);
        },

        events: {
            'show' : '_modalShowHandler',
            'hide' : '_modalHideHandler',
            'change input#attributeName' : 'setAttributeName',
            'click input#isMandatory' : 'setRequired',
            'change select#dataTypes' : 'selectionChanged',
	    'click #addAttributeBtn' : 'save'
        },
        
        delegateEvents: function() {
			BaseModalView.prototype.delegateEvents.apply(this, arguments);
            this.$el.on('hidden', _.bind(this.onHide, this));
        },

        render: function() {
			var self=this;
			self.dataTypes.fetch().done(function(){
				self.options.dataTypes=self.dataTypes.toJSON();
				BaseModalView.prototype.render.call(self);
				self.$('#modalFooter').html(footerTemplate({
	            	confirmClass: 'btn-primary',
	            	cancelClass: 'btn-default',
	            	cancelKey: 'dialog.cancel',
	            	confirmKey: 'dialog.save',
	            	confirmId: 'addAttributeBtn',
	            }));
			});
            this._updateDialogButtonStates();
            return this;
        },

        _updateDialogButtonStates: function () {
            this.enableButton(this.cancelButtonSelector);
            this.enableButton(this.submitButtonSelector);
        },

        save : function () {
            var self = this;
            this.disableButton();
	    if(!this.model.get("attributeTypeID")){
		this.model.set("attributeTypeID", $("#dataTypes").val());
	    }
	    if(!this.model.get("isMandatory")){
		this.model.set("isMandatory", false);	    
	    }
            this.model.save(null, {
                success : function(){
                    self.$el.modal('hide');
                    self._updateDialogButtonStates();
                    self.grid.refresh();
                },
                error:function() {
        			self.enableButton();
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
        }

    });

    return AddAttributeView;
});
