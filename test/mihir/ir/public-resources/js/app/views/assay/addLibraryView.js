/*global define:false*/
define(['collections/sample/reportTemplates', 'views/common/baseModalView', 'views/samples/addLibraryGrid', 'views/common/searchView', 'views/common/bannersView', 'events/eventDispatcher', 'hb!templates/assay/add-library-view.html', 'hb!templates/common/confirm-modal-footer.html']
    .concat('bootstrap'),

    function(ReportTemplates, BaseModalView, LibraryGridView, SearchView, BannerView, Dispatcher, bodyTemplate, footerTemplate) {
        'use strict';
        var AddLibraryView = BaseModalView.extend({
        	
            _searchEl: '#query-form',
            _gridEl: '#viewlibraries-grid',
            
            _options: function(){
    			return {
    				bodyTemplate: bodyTemplate,
    				headerKey: 'planned.runs.addLibraries',
    				onHide: function(){},
    				modalOptions : {
                        backdrop: 'static',
                        attentionAnimation: null,
                        keyboard: false,
                        show : true,
                    }
    			}
    		},

            initialize: function(options) {
                options = options || {};
                this.parentGrid = options.grid;
                this.gridView = new LibraryGridView({
                	hasBatchId: options.batchId ? true : false
                });
                this.gridView.addFilter("show", "all");
                this.gridView.addFilter("libraryName", "");
                if(options.batchId){
                	this.gridView.addFilter("batchId", options.batchId.toString());
                }
                this.searchView = new SearchView({
                	placeHolder: 'grid.column.libraryName'
                });         
                this.searchView.on('search', this._onSearch, this);
    			this.searchView.on('reset', this._onReset, this);
    			BaseModalView.prototype.initialize.call(this, options);
            },
            
            delegateEvents: function() {
    			BaseModalView.prototype.delegateEvents.apply(this, arguments);
                this.$el.on('hidden', _.bind(this.onHide, this));
            },
             
			
            render: function() {
            	BaseModalView.prototype.render.call(this);
                this.$('#modalFooter').html(footerTemplate({
                	confirmClass: 'btn-primary',
                	cancelClass: 'btn-default',
                	cancelKey: 'dialog.cancel',
                	confirmKey: 'dialog.save',
                	confirmId: 'addLibrariesToGrid',
                	cancelId: 'addLibraryCancel'
                }));
            	this.gridView.on('multiSelect', this._onGridMultiSelect, this);
            	this.searchView.setElement(this.$(this._searchEl)).render();
            	this.gridView.setElement(this.$(this._gridEl)).render();

				this.$el.find("span[data-toggle='tooltip']").on('hidden', function(e){
					e.stopPropagation();
				});
                return this;
            },
            
            events: {
                'click button#addLibrariesToGrid' : 'save',
                'click button#gridReset': '_onReset',
                'change #filterCondition': 'onFilterChange'
            },            
            
            save: function() {         	
            	var currentLibraries = this.parentGrid.$el.data('kendoGrid').dataSource.data();
            	var selectedLibraries = this.gridView.getSelected().toJSON();
            	var self= this;
				var batchIds = [];
            	var addControls=true;
            		for(var lib in selectedLibraries){
    					batchIds.push(selectedLibraries[lib].batchId);
    				}
            		if(currentLibraries.length !== 0) {
            			batchIds.push(currentLibraries[0].batchId);
            			addControls=false;
    				} 
    				var toBeSent = {
    						batchIds: batchIds
    				};
    				$.ajax({
    			        url: '/ir/secure/api/planrun/getPlanAddLibraries',
    			        type: 'POST',
    			        contentType: 'application/json',
    			        dataType: 'json',
    			        data: JSON.stringify(toBeSent),
    			        success: function(data) {
    							self.reportTemplates = new ReportTemplates({id:data.assayId});
    							$.when(self.reportTemplates.fetch({
    								success:function(){
    									$("#planRunAssay").html(data.assayName);
    									$("#planRunAssay").attr('value', data.assayId);
    									var reports= self.reportTemplates.toJSON();
    									if(reports.length > 0){
    										$("#reportTemplatesSection div.controls").html("<select id='reportTemplates' name='reportTemplates'></select>")
    									}else{
    										$("#reportTemplatesSection div.controls").html($.t('planRun.noReportTemplates.partOne') + "<br/>" + $.t('planRun.noReportTemplates.please') + 
    										"&nbsp;<a href='/ir/secure/reportTemplate?forAssay=" + data.assayId +"'>" + $.t('planRun.noReportTemplates.clickHere') + "</a>&nbsp;" + $.t('planRun.noReportTemplates.partTwo'));
    									}
    									_.each(reports, function(report){
    										if(report.id){
    											$("#reportTemplates").append('<option value="'+report.id+'">'+report.value+'</option>');
    										}
    									});
    									_.each(selectedLibraries, function(selectedLibrary){
    					            		var temp = _.filter(currentLibraries, function(currentLibrary){
    					            			return currentLibrary.id === selectedLibrary.id;
    					            		});
    					            		if(temp.length === 0){
    					            			currentLibraries.splice(0, 0, selectedLibrary);
    					            		}
    					            	});
    									if(addControls) {
    										_.each(data.planRunControlDtos, function(controlDto){
        					            		var control=controlDto;
        					            		control.specimenId= "NA";
        					            		control.libraries=[];
        					            		var library={
        					            				libraryType: controlDto.name,
        					            				barcode: controlDto.barcodeDto,
        					            				libraryName: controlDto.controlType+'_'+data.batchId
        					            		}
        					            		control.libraries.push(library);
        					            		//control.batchId=data.batchId;
        					            		currentLibraries.push(control);
        					            	});
    									}
    									self.controls= data.planRunControlDtos;
    								}
    							})).done(function(){
    								self._postValidate(currentLibraries, addControls);
    							});
    							if(!data.reportTemplateRequired) {
    								$("#reportTemplatesSection").hide();
    			                } else {
    			                	$("#reportTemplatesSection").show();
    			                }
    			        }
    			        
    			    });
		            
            },
            
            _postValidate: function (currentLibraries, addControls) {
            	var self=this;
		    	self.parentGrid.$el.data('kendoGrid').dataSource.data(currentLibraries);
            	self.parentGrid._loadedPlugins.multiSelection._clearSelection();
            	if(self.controls) {
	            	var checkboxes= self.parentGrid.$el.find('table tbody tr td:first-child :checkbox');
	            	var length= checkboxes.length;
	            	var totalControls= self.controls.length;
	            	for(var i=(length-1); i>(length-totalControls-1); i--) {
	            		checkboxes[i].disabled=true;
	            	}
            	}
            	
            	var libCount = 0;
            	_.each(currentLibraries, function(e) { 
            		if(e.specimenId !== 'NA') {
            			libCount += e.libraries.length;
            		}
            	});
            	Dispatcher.trigger('change:libCount',libCount);
            	
            	this.$el.modal('hide');
		    },

            _onSearch: function(query) {
                this.gridView.addFilter('libraryName', query);     
            }, 
            
            _onGridMultiSelect: function(libCount) {
                if (libCount.length > 0) {
                    this.$('#addLibrariesToGrid').removeAttr('disabled');
                  
                } else {
                    this.$('#addLibrariesToGrid').attr('disabled', 'disabled');
                  
                }
            },
            
            _onReset: function() {
	            this.gridView.addFilter('libraryName', "");     
	        }
        });

        return AddLibraryView;
    });
