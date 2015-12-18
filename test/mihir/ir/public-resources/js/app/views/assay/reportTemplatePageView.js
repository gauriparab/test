/* global define:false*/
define([
        'views/ParentView',
        'global',
        'collections/assay/assays',
		'models/assay/presetsModel',
		'models/assay/defaultSampleAttribute',
		'models/assay/genesToReport',
		'views/assay/genesToReport',
		'views/common/bannersView',
		'events/eventDispatcher',
		'hb!templates/assay/report-template-overview.html',
		'views/fileUpload'
	].concat([
	     'jqSortable',
		'bootstrap.fileupload'
	]),
		function(ParentView, Global, Assays, PresetsModel, DefaultSampleAttribute, GenesModel, GenesToReport, BannerView, Dispatcher, template) {

			'use strict';

			var AssayPreset = ParentView.extend({

						_template : template,
						_genesEl : '#genesToReport',

						initialize : function(options) {
							this.model = new PresetsModel();
							this.defaultSampleAttribute = new DefaultSampleAttribute();
							this.reportSaved=false;
							this.reportSavedLabel="";
							this.genesToReport = {};
							this.assayId = false;
							this.assays = new Assays({
								url: '/ir/secure/api/rdxReportTemplate/reportAssay'
							});

              this.forAssay = this.getUrlParameter('forAssay');

						},

						events : {
							'click #reportTemplateSaveButton' : 'save',
							'change select#assay' : '_toggleTestReport'
						},

						_toggleTestReport: function(ev){
							//this.$el.find('input#includeClinicalSummary').prop('checked',false);
							var el = $(ev.target).find('option:selected');
							var isEnabled = el.data('is-summary-report');
							/*if(isEnabled){
								this.$el.find('input#includeClinicalSummary').prop('disabled',false);
							} else{
								this.$el.find('input#includeClinicalSummary').prop('disabled',true);
							}*/

							var description = el.data('description');
		                	if(description) {
		                		$('#description').val(description);
			                	$('#description').attr('disabled', 'disabled');
		                	} else {
		                		$('#description').val("");
			                	$('#description').removeAttr('disabled');
		                	}

						},

						delegateEvents : function() {
							Backbone.View.prototype.delegateEvents.apply(this,
									arguments);
							Dispatcher.on('genes:unchecked', this.genesUnchecked, this);
							Dispatcher.on('genes:checked', this.genesChecked, this);
						},

						undelegateEvents : function() {
							Backbone.View.prototype.undelegateEvents.apply(
									this, arguments);
							Dispatcher.off('genes:unchecked');
							Dispatcher.off('genes:checked');
						},

						render : function() {
							var self = this;
							this.assays.fetch({
								success:function(){
									$.when(self.defaultSampleAttribute.fetch()).done(function(){
										self.$el.html(self._template({
											defaultAttributes: self.defaultSampleAttribute.toJSON(),
											assays:self.assays.toJSON()
										}));
										self.$el.find('select#assay').trigger('change');
										$("#default1, #default2, #default3, #sortable1, #sortable2").sortable({
											connectWith : ".connected",
											items : "li:not(.disabled)"
										}).disableSelection();

										var defaultOptions = {
											autoUpload : false,
											dataType : 'json',
											formData : {
												'X-IonReporter-CSRF-Token' : Global.csrfToken
											},
											add : function(e, data) {
												self.$('#upload').unbind();
												self.$('#upload').click(function(e) {
													e.preventDefault();
													self.handleUpload();
													data.submit();
												});
											},
											progress : function(e, data) {
												var progress = parseInt(data.loaded
														/ data.total * 100, 10);
												self._uploadProgress(progress);
											},
											done : function(e, data) {
												// self.render();
												new BannerView(
														{
															id : 'success-banner',
															container : $('.main-content>.container-fluid'),
															style : 'success',
															static : false,
															title : data.result
														}).render();
											},
											fail : function(e, data) {
												self._uploadError(data);
                                                self.$el.find("div.fileupload").removeClass("fileupload-exists").addClass("fileupload-new");
                                                self.$el.find("div.fileupload > input[type='hidden']").attr("name", "filedata");
                                                self.$el.find("#removeFile").click();
                                                self.$el.find('span.btn-file').show();
                                                self.$el.find("#removeFile").css("display", "");
                                                self.$el.find("#upload").css("display", "");
                                            }
										};
										self.$el.find('#regionFileUpload')
												.enhancedFileupload(defaultOptions);

										if(self.reportSaved) {
											new BannerView({
												id : 'success-banner',
												container : $('.main-content>.container-fluid'),
												style : 'success',
												static : false,
												title : self.reportSavedLabel,
											}).render();
											this.reportSaved=false;
										}

                    if(self.forAssay){
                      var assaySelector = $('select#assay');
                      assaySelector.val(self.forAssay);
                      assaySelector.prop('disabled',true);
                    }

										/*self.$('#assayDropdown select#assay').on('change',function(){
											self.renderGenesToReport(self.$(this).val());
										});

										self.$('#assayDropdown select#assay').trigger('change',{});*/
									});
								}
							});
						},

          getUrlParameter: function(sParam) {
              var sPageURL = window.location.search.substring(1);
              var sURLVariables = sPageURL.split('&');
              for (var i = 0; i < sURLVariables.length; i++) {
                  var sParameterName = sURLVariables[i].split('=');
                  if (sParameterName[0] == sParam) {
                      return sParameterName[1];
                  }
              }
          },

						renderGenesToReport: function(assayId){
							var that = this;
							this.genesModel = new GenesModel({id:assayId});
							this.genesModel.fetch({
								 success: function(){
									 that.assayId = assayId;
									 //that.genesModel.unset('id');
									 that.genesModel.unset('cid');
									 that.genesToReport = new GenesToReport({
										 genes : that.genesModel.toJSON()
									  });
									 that.renderSubView(that.genesToReport, that._genesEl);
									 /*var genesPresent;

									 _.each(that.genesModel.toJSON(), function(gene) {
										 if(gene.id){
											 genesPresent=true;
										 }
									 });

									 if(!genesPresent) {
										 that.$("#includeClinicalSummarySection").hide();
									 } else {
										 that.$("#includeClinicalSummarySection").show();
										 that.$("#includeClinicalSummary").removeAttr('disabled');
										 that.$("#includeClinicalSummary").prop('checked', 'true');

									 }*/
								 }
							});
						},



						handleUpload : function() {
							this._resetProgress();
							this.$('.btn-file').hide();
							this.$('#upload').hide();
							this.$('#removeFile').hide();
							this.$('#cancelFileUpload').hide();
							this._uploadStart();
						},

						_resetProgress : function() {
							this._uploadProgress(0);
							this.$('.progress').removeClass('progress-danger')
									.removeClass('progress-success').hide();
						},

						_uploadStart : function() {
							this.$('.progress').show();
						},

						_uploadProgress : function(data) {
							this.$('.progress .bar').css("width", data + '%');
							this.$('#progressBar').addClass('active');
						},

						_uploadComplete : function() {
							this.$('.progress').removeClass('progress-striped');
							this.$('#close').show();
						},

						_uploadError : function(data) {
							this.$('.progress').removeClass('progress-striped')
									.addClass('progress-danger');
							this._uploadProgress(100);
							this.$('#close').show();
							if (data.jqXHR.status === 0) {
								new BannerView({
									style : 'error',
									static : true,
									title : $.t('upload.file.missing') + ". "
											+ $.t('upload.failed')
								}).render();
							}
						},

						onRemove : function() {
							this.$('#upload').unbind();
						},

						/*genesUnchecked: function() {
							this.$("#includeClinicalSummary").attr('disabled', 'disabled');
							this.$("#includeClinicalSummary").removeProp('checked');
						},

						genesChecked: function() {
			        		this.$("#includeClinicalSummary").removeAttr('disabled');
			        		this.$("#includeClinicalSummary").prop('checked', 'true');
						},*/

						save : function(event) {
							var that = this;
							var values = {};

							if (event) {
								event.preventDefault();
							}

							this.model.set('name', $("#templateName").val());
							this.model.set('description', $("#description")
									.val());
							this.model.set('organizationName', $(
									"#organizationName").val());
							this.model.set('organizationAddr', $(
									"#organizationAddress1").val());
							this.model.set('organizationAddr2', $(
									"#organizationAddress2").val());
							this.model.set('organizationLogoFileName', $(
									".fileupload-preview").html());

							this.model.set('watermarkType', $(
									'input[name=watermark]').filter(':checked')
									.val());
							this.model.set('watermarkLabel', $("#customLevel")
									.val());

							this.model.set('telephone', $("#telephone")
									.val());

							this.model.set('fax', $("#fax")
									.val());

							this.model.set('website', $("#website")
									.val());

							this.model.set('email', $("#email")
									.val());


							if ($('input[name=testDecInExclude]').filter(
									':checked').val() == "true") {
								this.model.set('isTestDescIncluded', true);
							} else {
								this.model.set('isTestDescIncluded', false);
							}
							this.model.set('testDesc', $("#testDescTextA")
									.val());
							this.model.set('isTestDescEditable', $(
									'#testDecEditable').is(':checked'));

							if ($('input[name=AnalyticaltestInExclude]')
									.filter(':checked').val() == "true") {
								this.model.set('isAnalyticalTestDescIncluded',
										true);
							} else {
								this.model.set('isAnalyticalTestDescIncluded',
										false);
							}
							this.model.set('analyticalTestDesc', $(
									"#AnalyticaltestDescTextA").val());
							this.model.set('isAnalyticalTestDescEditable', $(
									'#AnalyticaltestDecEditable')
									.is(':checked'));

							if ($('input[name=AppendixInExclude]').filter(
									':checked').val() == "true") {
								this.model.set('isAppendixIncluded', true);
							} else {
								this.model.set('isAppendixIncluded', false);
							}
							this.model.set('appendix', $("#AppendixTextA")
									.val());
							this.model.set('isAppendixEditable', $(
									'#AppendixDecEditable').is(':checked'));

							this.model.set('labDirectorName', $(
									"#labDirectorName").val());
							this.model
									.set('cliaNumber', $("#cliaNumber").val());
							this.model.set('legalDisclaimer', $(
									"#legaldisclaimerTextA").val());

							var collection = _.union(this.defaultSampleAttribute.toJSON().columnOneList, this.defaultSampleAttribute.toJSON().columnTwoList);


							var columnOneList = [];
							_.each($("#default1 li").find('input'), function(checkbox){
								var id = $(checkbox).attr('id');
								var attribute = _.filter(collection, function(attr){
									return attr.id === id;
								});
								if($(checkbox).is(':checked')){
									attribute[0].isChecked =true;
								} else {
									attribute[0].isChecked =false;
								}
								columnOneList.push(attribute[0]);
							});

							var columnTwoList = [];
							_.each($("#default2 li").find('input') , function(checkbox){
								var id = $(checkbox).attr('id');
								var attribute = _.filter(collection, function(attr){
									return attr.id === id;
								});
								if($(checkbox).is(':checked')){
									attribute[0].isChecked =true;
								} else {
									attribute[0].isChecked =false;
								}
								columnTwoList.push(attribute[0]);
							});
							var columnThreeList = [];
							_.each($("#default3 li").find('input') , function(checkbox){
								var id = $(checkbox).attr('id');
								var attribute = _.filter(collection, function(attr){
									return attr.id === id;
								});
								if($(checkbox).is(':checked')){
									attribute[0].isChecked =true;
								} else {
									attribute[0].isChecked =false;
								}
								columnThreeList.push(attribute[0]);
							});

							this.model.set("columnOneList", columnOneList);
							this.model.set("columnTwoList", columnTwoList);
							this.model.set("columnThreeList", columnThreeList);

							var selectedGenes = [];
							this.$('#genesToReport input:checked').each(function(){
								selectedGenes.push(that.$(this).val());
							});

							this.model.set('geneIds',selectedGenes);
							this.model.set('assayId',parseInt($("#assay").val()));

							this.model.set('requiredAnalyticalSummary',$('#includeAnalyticalSummary').is(':checked'));
							this.model.set('requiredClinicalSummary', true); // Always show test report

							var self = this;
							this.model.save(this.model.toJSON(), {
								success: function(e) {
									if(self.$("select#assay").prop('disabled')) {
										window.location="/ir/secure/library.html";
									} else {
										window.location="/ir/secure/assay-presets.html#reportTemplate";
									}
								}
							});

						}
					});

			return AssayPreset;
		});
