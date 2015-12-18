/* global define:false */
define([
    'jquery',
    'underscore',
    'models/filterChain',
    'models/baseModel',
    'models/assay/assayModel',
    'collections/filterCollection',
    'views/templateView',
    'views/variants/variantsSummariesView',
    'views/filterChains/filterChainView',
    'views/common/bannersView',
    'views/filterChains/filterChainEditControlsView',
    'events/eventDispatcher',
    'hb!templates/variants/variants-editable-filtering.html',
    'hb!templates/variants/variants-non-editable-filtering.html'
], function(
    $,
    _,
    FilterChain,
    BaseModel,
    AssayModel,
    FilterCollection,
    TemplateView,
    VariantsSummariesView,
    FilterChainView,
    BannerView,
    FilterChainEditControlsView,
    dispatcher,
    editableFiltersTemplate,
    nonEditableFiltersTemplate
) {
    'use strict';

    var VariantsFilteringView = TemplateView.extend({

        _editableFiltersTemplate : editableFiltersTemplate,

        _nonEditableFiltersTemplate : nonEditableFiltersTemplate,

        initialize: function(opts) {
            var options = opts || {};

            this._analysis = options.analysis;
            this.assayId= options.assayId;
            this.assay= new AssayModel({id: this.assayId});
            this._filterChains = options.filterChains;
            this._variantsSearchContext = options.variantsSearchContext;
            this._filterCollection = null;
            this._readOnly = options.readOnly;
            this._variantsSummariesView = new VariantsSummariesView({
                variantsSearchContext: this._variantsSearchContext,
                analysis: this._analysis
            });
            this._filterChainEditControlsView = new FilterChainEditControlsView({
                filterChainDialogSelector: '#filterChain-dialog',
                primaryButtonKey: 'button.apply',
                filterChain: null,
                analysisId: this._analysis.id,
                createFilterChain: _.bind(this._createNewFilterChain, this),
                modifyFilterChain: _.bind(this._updateFilterExistingChain, this)
            });
            this.currentFilterChain;
            this.getFilterChainForAssay(this.assayId);
        },

        events: {
            'click #save-filter-changes': '_saveCurrentFilterChain'
        },

        render: function() {
            var self = this;
            if (!this._readOnly && this._filterChains) {
            	/*this._filterChains.fetch({
                    noGlobalErrorHandler: true,
                    data: {
                        'page.size': 1000
                    },
                    success: function() {
                        self.readOnly = false;
                        self._renderSelectableFilterChain();
                    },
                    error: function() {
                        self.readOnly = true;
                        self._filterChains = null; // reset so that next time we don't try the remote call
                        self._renderNonSelectableFilterChain();
                    }
                });*/
            	this.temp = new BaseModel();
                this.temp.set("applicationType", this.assay.getApplicationType());
                this.temp.set("version", this.assay.getVersion());
                this._filterChains.getAllowed(this.temp, function() {
            		self.readOnly = false;
                    self._renderSelectableFilterChain();
            	});
            	
            } else {
                this._renderNonSelectableFilterChain();
            }
        },
        

        _renderNonSelectableFilterChain: function() {
            var currentFilterChain=self.currentFilterChain;
            var templateVars = {
                filterName: currentFilterChain ? currentFilterChain.get('name') : ""
            };
            this.$el.html(this._nonEditableFiltersTemplate(templateVars));

            this._prepareVariantsSearchContext(currentFilterChain);
            this._displayVariantsSummariesForFilterChain();
            this._variantsSearchContext.trigger('refreshVariantsGrid');
        },

        _renderSelectableFilterChain: function() {
        	var self=this;
            var filterChains = {
                filterChains: this._filterChains.toJSON()
            };
            var currentFilterChain=self.currentFilterChain;
            self.$el.html(self._editableFiltersTemplate(filterChains));
            self.$("[data-toggle='tooltip']").tooltip();
            self._filterChainEditControlsView.setElement(self.$el);
            self.$('#filter-chain-selection')
                .val( (currentFilterChain) ? currentFilterChain.id : '')
                .on('change', _.bind(self._updateFilterChainSelection, self));
            self._updateFilterChainSelection();
        },

        _updateFilterChainSelection: function() {
            var self = this,
                filterChainModel = this._getSelectedFilterChain();
            if (filterChainModel) {
                this.$('#edit-filter-chain > i, #clone-filter-chain > i').addClass('disabled');
                //$.when(filterChainModel.fetch()).done(function() {
                    self.$('#edit-filter-chain > i, #clone-filter-chain > i').removeClass('disabled');
                    self._refreshVariantsGrid(filterChainModel);
                //});
            } else {
                this._refreshVariantsGrid(null);
            }
        },

        _refreshVariantsGrid: function(filterChainModel) {
            this._prepareVariantsSearchContext(filterChainModel);
            this._displayVariantsSummariesForFilterChain();
            this._variantsSearchContext.trigger('refreshVariantsGrid');
        },
        
        _getSelectedFilterChain: function() {
            var selectedFilterChainId = this.$('#filter-chain-selection').val();
            return this._filterChains.findFilterChain(selectedFilterChainId);
        },

        _prepareVariantsSearchContext: function(filterChain) {
            dispatcher.trigger('filterChain:selectionChanged', filterChain);
            if (this._isFilterChainSaved(filterChain)) {
                this._clearBanner();
                this._enableOrDisableSaveButton(false);
            } else {
                this._displayBanner('warning', $.t('analysis.filter.chain.changed'), true);
                this._enableOrDisableSaveButton(true);
            }
            if (filterChain) {
                this._variantsSearchContext.setFiltering(true);
                if (filterChain.get('notPersisted')) {
                    this._enableOrDisableSaveButton(true);
                    this._variantsSearchContext.setTransientFilters(filterChain);
                    this._displayBanner('warning', $.t('analysis.filter.chain.changed'), true);
                } else {
                    this._variantsSearchContext.setFilterChainCriteria(filterChain);
                }
            } else {
                this._variantsSearchContext.setFiltering(false);
                this._variantsSearchContext.setFilterChainCriteria(null);
            }
            dispatcher.trigger('variants:countChanged');
        },

        _isFilterChainSaved: function(filterChain) {
        		this.getFilterChainForAssay(this.assayId);
	        	var assayFilterChain= this.currentFilterChain;
	            return (!assayFilterChain.id && !filterChain ||
	            	assayFilterChain && filterChain && assayFilterChain.id === filterChain.id);
        },

        _enableOrDisableSaveButton: function(enabled) {
            var saveButton = this.$("#save-filter-changes");
            if (enabled) {
                saveButton.removeClass("disabled").removeProp('disabled');
            } else {
                saveButton.addClass("disabled").prop('disabled', 'disabled');
            }
        },

        _displayVariantsSummariesForFilterChain: function() {
            this.renderSubView(this._variantsSummariesView, '#filter-summaries');
            dispatcher.trigger('variantsgrid:OnAfterParse');
        },

        _createNewFilterChain: function(filterChain) {
        	var self=this;
    		filterChain.set('notPersisted', true);
    		filterChain.save(null,{
    			success: function(data) {
    				   			self.currentFilterChain=data;
    							self.render();
    	    	                dispatcher.trigger('filterChain:createSuccess', null);
    			}
    	 	});
        },

        _updateFilterExistingChain: function(updatedFilterChain) {
            var filterChainSelection = this.$('#filter-chain-selection');
            var selectedFilterChainId = this.$('#filter-chain-selection').val();
            var selectedFilterChain = this._filterChains.findFilterChain(selectedFilterChainId);
            selectedFilterChain.set('notPersisted', true);
            filterChainSelection.find(':selected').text(updatedFilterChain.get('name'));
            filterChainSelection.selectpicker('refresh');
            this._refreshVariantsGrid(selectedFilterChain);
        },

        _saveCurrentFilterChain: function(e) {

            var self = this;
            var selectedFilterChainId = this.$('#filter-chain-selection').val();
            var selectedFilterChain = this._filterChains.findFilterChain(selectedFilterChainId);
            this._enableOrDisableSaveButton(false);
            /*var previousFilterChain;
            var xhr;

            e.preventDefault();

            previousFilterChain = this._analysis.getFilterChain();

            this._analysis.setFilterChain(selectedFilterChain);

            xhr = this._analysis.save({}, {
                success: function(analysis) {
                    if (selectedFilterChain) {
                        if (selectedFilterChain.isNew()) {
                            selectedFilterChain.set('id', analysis.get('filterChain').id);
                        }
                        selectedFilterChain.unset('notPersisted');
                        self._displayBanner("success", $.t('filter.chain.successful.save', {
                            name: selectedFilterChain.get('name')
                        }));
                    } else {
                        self._displayBanner("success", $.t('filter.chain.successful.reset'));
                    }
                },
                error: function() {
                    self._enableOrDisableSaveButton(true);
                    if (selectedFilterChain) {
                        self._displayBanner('error', $.t('filter.chain.failed.save', {
                            name: selectedFilterChain.get('name')
                        }));
                    } else {
                        self._displayBanner('error', $.t('filter.chain.failed.reset'));
                    }
                }
            });
            if (!xhr) {
                this._enableOrDisableSaveButton(true);
                this._analysis.setFilterChain(previousFilterChain);
                if (this._analysis.validationError) {
                    self._displayBanner('error', $.t(this._analysis.validationError[0], true));
                }
            }*/
            
            var FilterChainAssayDto = {
            		assayId: this.assay.assayId,
            		filterChainId: selectedFilterChainId
            }
            $.ajax({
                url: '/ir/secure/api/data/mapFilterChainToAssay',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(FilterChainAssayDto),
                success: function() {
                	self._displayBanner("success", $.t('filter.chain.successful.save', {
                        name: ((selectedFilterChain=== null) ?'No filter' : selectedFilterChain.get('name'))
                    }));
                },
                error: function() {
                	this._enableOrDisableSaveButton(true);
                }
            });
            
            
        },

        _displayBanner: function(style, title, stable) {
            new BannerView({
                id: "filter-chain-banner",
                container: $('#varient'),
                style: style,
                title: title,
                static: stable
            }).render();
        },

        _clearBanner: function() {
            new BannerView({
                id: "filter-chain-banner"
            }).clearBanner();
        },
        
        getFilterChainForAssay: function(assayId) {
        	var self = this;
            $.ajax({
                url: '/ir/secure/api/filterChain/getFilterChainOfAssay?assayId='+assayId,
                type: 'GET',
                async: false,
                contentType: 'application/json',
                success: function(response) {
                	self.currentFilterChain=response;
                }
            });
            
        }

    });

    return VariantsFilteringView;
});
