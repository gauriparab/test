/*global define:false*/
define(['jquery', 'underscore', 'kendo', 'views/manageSampleFormView', 'models/sample/sampleModel', 'models/sample/barcode', 'collections/sampleAttributes', 'collections/sample/barcodes', 
    'views/errorsView', 'collections/sample/gender', 'collections/sample/cancerType', 'collections/sample/sampleType', 'hb!templates/sample/manage-sample-new.html']
    .concat('bootstrap'),

    function($, _, kendo, FormView, SampleModel, Barcode, SampleAttributes, Barcodes, ErrorsView, Gender, CancerType, SampleType, template) {
        'use strict';
        var ManageUserView = FormView.extend({
            el: "#addSample",

            // FormView
            //submitButtonSelector: '#createUserSaveButton',

            initialize: function(options) {
                options = options || {};
                this.initializeModel(options);
                this.grid = options.grid;
                this.errorsView = new ErrorsView({
                    model: this.model
                });
                this.sampleAttributes = new SampleAttributes();
                this.barcodes = new Barcodes();
                this.genders = new Gender();
                this.sampleTypes = new SampleType();
                this.cancerTypes = new CancerType();
            },
             
            initializeModel: function(options) {
                this.model = this.model || new SampleModel();
                this.completeAction = options.completeAction;
            },


            render: function() {
		var self =this;
		$.when(this.barcodes.fetch(), this.sampleAttributes.fetch(), 
				this.sampleTypes.fetch(), this.cancerTypes.fetch(), 
				this.genders.fetch()).done(function() {
		    self.barcodes.models.unshift(new Barcode({id:"0",idstr:"Null"}));
		    self.genders.models.unshift(new Barcode({value:""}));
		    self.sampleTypes.models.unshift(new Barcode({value:""}));
		    self.cancerTypes.models.unshift(new Barcode({value:""}));
            	     self.$el.html(template({
                         sampleAttributes: self.sampleAttributes.toJSON(),
                         model: self.model.toJSON(),
                         barcodes: self.barcodes.toJSON(),
                         genders : self.genders.toJSON(),
                         sampleTypes : self.sampleTypes.toJSON(),
                         cancerType : self.cancerTypes.toJSON()
                     }));
                     self.$el.modal({
                         backdrop: 'static',
                         attentionAnimation: null,
                         keyboard: false,
                         show : true
                     });
		      self.$el.unbind('hide').on('hide', function () {
                    self.undelegateEvents();
                    self.unbind();
	                });

                     self.renderSubView(self.errorsView, "#errors");
		 });
                 return this;
            },
            
            events: {
                'click #createUserSaveButton' : 'save'
            },
            
            save: function() {
                this.model.set('sampleId', $("#manageSampleID").val());
                this.model.set('sampleName', $("#manageSampleName").val());
                this.model.set('libraryPrepReagentBarcode', $("#libraryKitName").val());
		if(parseInt($("#manageSampleBarcode").val())) {
		var barcode = {};
		    barcode.id = $("#manageSampleBarcode").val();
		    barcode.idStr = this.barcodes.get(barcode.id).toJSON().idStr;
		    this.model.set('barcode', barcode);
		}
                this.model.set('description', $("#manageSampleDescription").val());
		var sampleAttr = [];
		for(var i=0, len = this.sampleAttributes.models.length; i<len; i++){
			var attr = this.sampleAttributes.models[i].toJSON().attributeUIName;
			var value = "";
			if(this.sampleAttributes.models[i].toJSON().dataType === 'Multiple'){
				if(this.sampleAttributes.models[i].toJSON().attributeName === 'Cancer Type'){
					value = $("#manageCancerType").val();
				}else if(this.sampleAttributes.models[i].toJSON().attributeName === 'Sample Type'){
					value = $("#manageSampleType").val();
				}else if(this.sampleAttributes.models[i].toJSON().attributeName === 'Gender'){
					value = $("#manageSampleGender").val();
				}
			}else{
				 value = this.$el.find("input[name="+attr+"]").val(); 
			}
				this.sampleAttributes.models[i].set('value', value);
				sampleAttr.push(this.sampleAttributes.models[i].toJSON());
		}
		$('#addSample #ajaxerror').remove();
		this.model.set('sampleAttributes', sampleAttr);
                this.model.save(this.model.toJSON(), {
                    success: _.bind(this._onSaveSuccess, this)
                });
            },
            
            _onSaveSuccess: function(model, response) {
                this.closeDialog();
                this.grid.refresh();
                if (_.isFunction(this.completeAction)) {
                    this.completeAction(response);
                }
            },

            closeDialog: function() {
                this.$el.modal('hide');
            }

        });

        return ManageUserView;
    });
