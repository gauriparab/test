define([
    'models/sample/deleteSpecimen',
    'views/ParentView',
    'views/common/searchView',
    'views/samples/specimensGridView',
    'views/samples/addEditSpecimenView',
    'views/samples/prepareLibraryBatchView',
    'views/samples/extractionView',
    'views/addNotesView',
    'views/viewNotes',
    'views/common/baseModalView',
    'views/common/bannersView',
    'views/common/confirmDeleteModalView',
    'views/common/auditReasonView',
	'views/common/auditTrailView',
    'views/samples/specimenDetailsView',
    'collections/sample/specimenAttributes',
    'collections/sample/barcodes',
    'collections/assay/assays',
    'hb!templates/sample/manage-specimens-overview.html'],
        function(
        		DeleteSpecimen,
                ParentView,
                SearchView,
                GridView,
                AddEditSpecimenView,
                PrepareLibraryBatchView,
                ExtractionView,
                AddNotesView,
                ViewNotes,
                BaseModalView,
                BannerView,
                ConfirmDeleteModalView,
                AuditReasonView,
				AuditTrailView,
                SpecimenDetailsView,
                SpecimenAttributes,
                Barcodes,
                Assays,
                template) {
            'use strict';

            var manageSpecimensOverview = ParentView.extend({
                _searchEl: '#query-form',
                _gridEl: '#specimen-grid',
                initialize: function(options) {
                	var that = this;
                	this.hasViewPermission = options.hasViewPermission;
                    this.searchView = new SearchView({
                        placeHolder: 'grid.column.specimenId'
                    });
                    this.needsReason = options.auditConfig['Sample'].needsReason;
                    this.needsReasonLibrary = options.auditConfig['Libraries'].needsReason;

                    this.gridView = new GridView({
                    	hasViewPermission: this.hasViewPermission
                    });
                    this.barcodes = new Barcodes();
                    this.assays = new Assays();
                    this.searchView.on('search', this._onSearch, this);
                    this.searchView.on('reset', this._onReset, this);
                    this.gridView.on('action:prepare_library', this._onOpenAddLibrary, this);
                    this.gridView.on('action:extraction', this._onOpenExtraction, this);
                    this.gridView.on('action:edit', this._onEditSpecimen, this);
                    this.gridView.on('action:add-note', this._onAddNote, this);
                    this.gridView.on('action:view-notes', this._viewNotes, this);
                    this.gridView.on('action:view-details', this._viewDetails, this);
					this.gridView.on('action:audit_trail', this._onAudit, this);
                    this.gridView.on('multiSelect', this._onGridMultiSelect, this);
                    this.gridView.addFilter('show', "all");
                    this.gridView.addFilter('specimenId', "");
                    this.specimenAttributes = new SpecimenAttributes();
                    this.specimenAttributes.fetch();
                    this.barcodes.fetch();
                    this.assays.fetch();
                },
                events: {
                    'click #btnAddSpecimen': '_onOpenAddSpecimen',
                    'click div#filterGroup > button': '_filterGridData',
                    'click #manageSpecimenDelete': '_deleteSpecimens',
                    'click #prepareLibraryBatchBtn': '_prepareLibraryBatch',
                    'click #manageSpecimenPrint': '_onPrint',
                    'click #manageSpecimenExport': '_onExportSepecimen',
                    'click #extract': '_onExtractspecimen'
                },
                render: function() {
                    this.$el.html(template());
                    this.renderSubView(this.searchView, this._searchEl);
                    this.renderSubView(this.gridView, this._gridEl);
                },
                _onPrint: function() {
                    var specimens = this.gridView.getSelected();
                    if (specimens.length === parseInt(0)) {
                        alert('Please select at least one Specimen.');
                        return false;
                    }
                    var html = '<html><head><style>@media print {.row {-webkit-print-color-adjust: exact; } hr{background:black;color:black;}}.row{background:#f5f5f5;width:100%;}.row:nth-child(even){background:white;}.row .cell{width:44%;display:inline-block;padding:10px;}</style></head><body>';
                    for (var i = 0, len = specimens.models.length; i < len; i++) {
                        html += '<div class="row"><div class="cell">'+$.t('grid.label.specimenId')+'</div><div class="cell">' + specimens.models[i].get("specimenId") + '</div></div>' +
                                '<div class="row"><div class="cell">'+$.t('grid.label.patientId')+'</div><div class="cell">' + specimens.models[i].get("patientId") + '</div></div>' +
                                '<div class="row"><div class="cell">'+$.t('grid.label.dateOfBirth')+'</div><div class="cell">' + specimens.models[i].get("dateOfBirth") + '</div></div>' +
                                '<div class="row"><div class="cell">'+$.t('grid.label.specimenSource')+'</div><div class="cell">' + specimens.models[i].get("specimenSource") + '</div></div>' +
                                '<div class="row"><div class="cell">'+$.t('grid.label.orderingPhysician')+'</div><div class="cell">' + specimens.models[i].get("orderingPhysician") + '</div></div>' +
                                '<div class="row"><div class="cell">'+$.t('grid.label.specimenCondition')+'</div><div class="cell">' + specimens.models[i].get("specimenCondition") + '</div></div>' +
                                '<div class="row"><div class="cell">'+$.t('grid.label.sampleType')+'</div><div class="cell">' + specimens.models[i].get("sampleType") + '</div></div>' +
                                '<div class="row"><div class="cell">'+$.t('grid.label.collectionDate')+'</div><div class="cell">' + specimens.models[i].get("collectionDate") + '</div></div>' +
                                '<div class="row"><div class="cell">'+$.t('grid.label.receiveTime')+'</div><div class="cell">' + specimens.models[i].get("receiveDate") + '</div></div>' +
                                '<div class="row"><div class="cell">'+$.t('grid.label.referenceInterval')+'</div><div class="cell">' + specimens.models[i].get("referenceInterval") + '</div></div>' +
                                '<div class="row"><div class="cell">'+$.t('grid.label.gender')+'</div><div class="cell">' + specimens.models[i].get("gender") + '</div></div>' +
                                '<div class="row"><div class="cell">'+$.t('grid.label.percentCellularity')+'</div><div class="cell">' + (specimens.models[i].get("tumorCellularity") !== null ? specimens.models[i].get("tumorCellularity") : "") + '</div></div>' +
                                '<div class="row"><div class="cell">'+$.t('grid.label.tumorSite')+'</div><div class="cell">' + (specimens.models[i].get("tumorSite") !== null ? specimens.models[i].get("tumorSite") : "") + '</div></div>' +
                                '<div class="row"><div class="cell">'+$.t('grid.label.percentNecrosis')+'</div><div class="cell">' + (specimens.models[i].get("necrosis") !== null ? specimens.models[i].get("necrosis") : "") + '</div></div>';
                        if (i < len - 1) {
                            html += '<div><hr></div>';
                        }
                    }
                    var printWindow = window.open();
                    if (!printWindow) {
                        alert("Please allow pop-ups");
                    } else {
                        printWindow.document.write(html);
                        printWindow.print();
                        printWindow.close();
                    }
                },
                _onOpenAddSpecimen: function() {
                    var self = this;
                    BaseModalView.open(null, {
                        type: "add",
                        el: "#addEditSpecimen",
                        data: {specimenAttributes: this.specimenAttributes.toJSON(),reason:this.needsReason},
                        hasViewPermission: self.hasViewPermission,
                        onComplete: function() {
                            self._onCompleteFunc('specimen.add.success');
                        }
                    }, AddEditSpecimenView);
                },

                _onOpenExtraction: function(e, model) {
                    var self = this;
                    BaseModalView.open(null, {
                        el: "#extraction",
                        data: {
                            specimenData: {
                            	specimenId: model.toJSON().specimenId,
                            	extractionKit:  model.toJSON().extractionKit
                            }
                        },
                        onComplete: function() {
                        	self._onCompleteFunc('specimen.add.extractionKitBarcode.success');
                        }
                    }, ExtractionView);
                },

                _onEditSpecimen: function(e, model) {
                    var self = this;
                    model.set('reason',this.needsReason);
                    BaseModalView.open(null, {
                        type: "edit",
                        el: "#addEditSpecimen",
                        data: model.toJSON(),
                        hasViewPermission: self.hasViewPermission,
                        onComplete: function() {
                            self._onCompleteFunc('specimen.edit.success');
                        }
                    }, AddEditSpecimenView);
                },
                _onAddNote: function(e, model) {
                    var self = this;
                    BaseModalView.open(null, {
                        el: "#addNotes",
                        entityId: model.toJSON().id,
                        entity: 'specimen',
                        onComplete: function() {
                            self._onCompleteFunc('specimen.add.notes.success');
                        }
                    }, AddNotesView);
                },
                _viewNotes: function(e, model) {
                    var self = this;
                    BaseModalView.open(null, {
                        el: "#viewNotes",
                        entityId: model.toJSON().id,
                        entity: 'specimen',
                        url: '/ir/secure/api/specimen/notes?specimenId=' + model.toJSON().id
                    }, ViewNotes);
                },
                _viewDetails: function(e, model) {
                    var self = this;
                    BaseModalView.open(null, {
                        el: "#viewSpecimen",
                        model: model,
                        hasViewPermission:this.hasViewPermission
                    }, SpecimenDetailsView);
                },
				_onAudit: function(e, model){
					var data=[];
					var temp={};
					temp.key="audit.trail.specimenid";
					temp.value=model.attributes.specimenId;
					data.push(temp);
					var self = this;
					BaseModalView.open(null, {
						type: "audit_trail",
						el: "#auditTrailModal",
						model:model,
						data:data,
						gridViewUrl:'/ir/secure/api/auditmanagement/sample',
						filters:{sampleId : model.toJSON().id},
						detailsViewUrl:'/ir/secure/api/auditmanagement/sample/getAuditDetails' + "?sampleId=" + model.toJSON().id
					}, AuditTrailView);
			    },

                _onGridMultiSelect: function(specimens) {
                    $("#manageSpecimenCount").html(specimens.length);
                    if (specimens.length > 0) {
                        this.$('#manageSpecimenPrint').removeAttr('disabled').find("i").css('background-image',"url('../resources/img/glyphicons-halflings-white.png')");
                        this.$('#manageSpecimenDelete').removeAttr('disabled').find("i").css('background-image',"url('../resources/img/glyphicons-halflings-white.png')");
                        this.$('#manageSpecimenExport').removeAttr('disabled').find("i").css('background-image',"url('../resources/img/glyphicons-halflings-white.png')");
                        this.$('#prepareLibraryBatchBtn').removeAttr('disabled').find("i").css('background-image',"url('../resources/img/glyphicons-halflings-white.png')");
                        if(this.$('div#filterGroup').find('.btn-pressed').attr('val').trim() === "toBeExtracted"){
                        	this.$('#extract').removeAttr('disabled').find("i").css('background-image',"url('../resources/img/glyphicons-halflings-white.png')");
                        }
                    } else {
                        this.$('#manageSpecimenPrint').attr('disabled', 'disabled').find("i").css('background-image',"");
                        this.$('#manageSpecimenDelete').attr('disabled', 'disabled').find("i").css('background-image',"");
                        this.$('#manageSpecimenExport').attr('disabled', 'disabled').find("i").css('background-image',"");
                        this.$('#prepareLibraryBatchBtn').attr('disabled', 'disabled').find("i").css('background-image',"");
                        this.$('#extract').attr('disabled', 'disabled').find("i").css('background-image',"");
                    }
                },

                _onSearch: function(query) {
                    this.gridView.addFilter('specimenId', query);
                },
                _onReset: function() {
                    this.gridView.addFilter('specimenId', "");
                },
                _filterGridData: function(e) {
                    $(e.currentTarget).parent().find('.btn-pressed').removeClass('btn-pressed');
                    $(e.currentTarget).addClass('btn-pressed');
                    this.gridView._filters["show"] = $(e.currentTarget).attr('val').trim();
                    this.gridView._filters["specimenId"] = "";
                    $("#query-form > input").val("");
                    this.gridView._loadedPlugins.multiSelection._clearSelection();
                    this.gridView.refresh();
                },

                _deleteSpecimens: function() {
                    var self = this;
                    ConfirmDeleteModalView.open(function() {
                    	var that = this;
                    	var model = new DeleteSpecimen();
                        var reason;

                    	var ids = _.pluck(self.gridView.getSelected().toJSON(), 'id');
                    	var reasonEl = arguments[0].$el.find('#reason-for-change');
	                    if(reasonEl.length > 0) {
	                    	reason = reasonEl.val()
	                    }

                        model.set('reason',reason);
					    model.set('ids',ids);


                        model.save(null,{
                        	success:function(){
                        		self.gridView._loadedPlugins.multiSelection._clearSelection();
                                self._onCompleteFunc('specimen.delete.success');
                        	}
                        });
                    }, {
                        headerKey: 'specimen.delete.label',
                        confirmMessageKey: 'specimen.delete.message',
                        cancelClass: 'btn-default',
                        confirmClass: 'btn-primary',
                        needsReason:this.needsReason
                    }, ConfirmDeleteModalView);
                },

                _prepareLibraryBatch: function(e){
    		    	var self= this;
                	BaseModalView.open(null, {
                		el: '#prepareLibraryBatch',
                		needsRason:this.needsReasonLibrary,
    	                assays: self.assays.toJSON(),
    	                barcodes: self.barcodes.toJSON(),
    	                data: self.gridView.getSelected().toJSON(),
    	                onComplete: function(){ window.location = "library.html" ;}
    	            },PrepareLibraryBatchView);
    		    },


                _onExportSepecimen: function() {
                	var self = this;
                	var ids = _.pluck(self.gridView.getSelected().toJSON(), 'id');
                	$.ajax({
              		    url: '/ir/secure/api/export/specimen',
              		    type: 'POST',
            		    data: JSON.stringify(ids),
              		    contentType: 'application/json',
            		    success: function(data) {
            		    	window.location = "/ir/secure/api/export/downloadFile?path="+data;
            		    },
                		error: function(resp) {
        		        			var error = JSON.parse(resp.responseText);
        		                    if (error && error.status < 500) {
        		                        //jshint nonew:false
        		                        new BannerView({
        		                            container: $('.modal-body'),
        		                            style: 'error',
        		                            title: error.message,
        		                            messages: error.errors && error.errors.allErrors &&
        		                                _.pluck(error.errors.allErrors, 'defaultMessage')
        		                        }).render();
        		                    }
                		}
            		});

                },

                _onCompleteFunc: function(messageKey) {
                    new BannerView({
                        container: this.$('.container-fluid').first(),
                        style: 'success',
                        titleKey: messageKey
                    }).render();
                    if (this.gridView) {
                        this.gridView.refresh();
                    }
                },

                _onExtractspecimen: function() {
                	var self = this;
                	var data=[];
                	data=_.pluck(self.gridView.getSelected().toJSON(), 'specimenId');
                    BaseModalView.open(null, {
                        el: "#extraction",
                        specimenIds: data,
                        onComplete: function() {
                        	self._onCompleteFunc('specimen.add.extractionKitBarcode.success');
                        	self.gridView._loadedPlugins.multiSelection._clearSelection();
                        }
                    }, ExtractionView);
                }
            });

            return manageSpecimensOverview;
        });
