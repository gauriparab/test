/*global define:false*/
define(['jquery', 
        'underscore', 
        'kendo', 
        'views/formView', 
        'collections/sample/barcodes', 
        'models/sample/barcode', 
        'collections/sampleAttributes', 
        'views/errorsView', 
        'collections/sample/gender', 
        'collections/sample/cancerType', 
        'collections/sample/sampleType', 
        'hb!templates/sample/edit-sample.html'].concat('bootstrap'),
function($, 
		_, 
		kendo, 
		FormView, 
		Barcodes, 
		Barcode, 
		SampleAttributes, 
		ErrorsView, 
		Gender, 
		CancerType, 
		SampleType, 
		template) {
        'use strict';
        var EditSampleView = FormView.extend({

            el: '#editSampleModal',

            initialize: function(options) {
                options = options || {};
                this.manageAction = 'Edit';
                this.grid = options.grid;
                this.errorsView = new ErrorsView({
                    model: this.model
                });
                this.barcodes = new Barcodes();
                this.sampleAttributes = new SampleAttributes();
                this.genders = new Gender();
                this.sampleTypes = new SampleType();
                this.cancerTypes = new CancerType();
            },

            events: {
                'click #editSampleSaveButton': 'saveSampleData'
            },

            render: function() {
            	var self = this;
            	$.when(this.barcodes.fetch(), this.sampleAttributes.fetch(), this.sampleTypes.fetch(), 
				this.cancerTypes.fetch(), 
				this.genders.fetch()).done(function() {
						self.barcodes.models.unshift(new Barcode({id:"0",idstr:"Null"}));
						self.genders.models.unshift(new Barcode({value:""}));
					    self.sampleTypes.models.unshift(new Barcode({value:""}));
					    self.cancerTypes.models.unshift(new Barcode({value:""}));
						_.each(self.sampleAttributes.toJSON(), function(attribute) {
							var temp = _.find(self.model.toJSON().sampleAttributes, function(attr) { return attr.id === attribute.id});
							if(!temp) {
							    delete attribute.cid;
							    self.model.get("sampleAttributes").push(attribute);
							}			
						});
						self._renderEditForm();
						self.renderSubView(self.errorsView, "#errors");
						self.$el.unbind('hide').on('hide', function () {
	                        self.undelegateEvents();
	                        self.unbind();
	                    });
					
					for(var i=0, len = self.model.toJSON().sampleAttributes.length; i<len; i++){
						if(self.model.toJSON().sampleAttributes[i].attributeUIName === 'Gender'){
							$("#manageSampleGender").val(self.model.toJSON().sampleAttributes[i].value);
						}else if(self.model.toJSON().sampleAttributes[i].attributeUIName === 'Cancer_Type'){
							$("#manageCancerType").val(self.model.toJSON().sampleAttributes[i].value);
						}else if(self.model.toJSON().sampleAttributes[i].attributeUIName === 'Sample_Type'){
							$("#manageSampleType").val(self.model.toJSON().sampleAttributes[i].value);
						}
					}
					$("#sampleBarcode").val(self.model.toJSON().barcode.id);
				});
                return this;
            },
            
            destroy: function() {
                return this;
            },

            _renderEditForm: function() {
                this.$el.html(template({
                    manageAction: this.manageAction,
                    model: this.model.toJSON(),
                    barcodes: this.barcodes.toJSON(),
                    genders : this.genders.toJSON(),
                    sampleTypes : this.sampleTypes.toJSON(),
                    cancerType : this.cancerTypes.toJSON()
                }));
                this.$el.modal({
                    backdrop: 'static',
                    attentionAnimation: null,
                    keyboard: false,
                    show : true
                });
            },

            saveSampleData:function() {
            	var self = this;
                this.model.set('sampleId', $("#sampleId").val());
                this.model.set('sampleName', $("#sampleName").val());
                this.model.set('libraryPrepReagentBarcode', $("#libraryKit").val());
				if(parseInt($("#sampleBarcode").val())) {
				    var barcode = {};
				    barcode.id = $("#sampleBarcode").val();
				    barcode.idStr = this.barcodes.get(barcode.id).toJSON().idStr;
				    this.model.set('barcode', barcode);
				} else{
				    this.model.unset('barcode');
				}
                this.model.set('description', $("#description").val());
                var sampleAttr = [];
                for(var i=0, len = this.model.toJSON().sampleAttributes.length; i<len; i++){
                	var attr = this.model.toJSON().sampleAttributes[i].attributeUIName;
        			var value = "";
        			if(this.model.toJSON().sampleAttributes[i].dataType === 'Multiple'){
        				if(this.model.toJSON().sampleAttributes[i].attributeName === 'Cancer Type'){
        					value = $("#manageCancerType").val();
        				}else if(this.model.toJSON().sampleAttributes[i].attributeName === 'Sample Type'){
        					value = $("#manageSampleType").val();
        				}else if(this.model.toJSON().sampleAttributes[i].attributeName === 'Gender'){
        					value = $("#manageSampleGender").val();
        				}
        			}else{
        				 value = this.$el.find("input[name="+attr+"]").val(); 
        			}
                    this.model.toJSON().sampleAttributes[i].value = value;                    	      
                    }
                $('#editSampleModal #ajaxerror').remove();
                this.model.save(null, {
                    success: function() {
                    	self.grid.refresh();
                    	self.closeDialog();
                    }
                });
            },

            closeDialog: function() {
                this.$el.modal('hide');
            },

		    undelegateEvents: function() {
		    	Backbone.View.prototype.undelegateEvents.apply(this, arguments);
		    }
        });

        return EditSampleView;
    });
