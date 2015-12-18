/*global define:false*/
define(['jquery', 'underscore', 'backbone', "modules/annotationSetModule", "modules/filterChainModule", "modules/finalReportTemplateModule", 'views/common/bannersView',
        'views/common/filterView', 'hb!templates/common/versionFilter.html']
    .concat('i18n', 'bootstrap.modal', 'bootstrap.modalmanager'),
    function($, _, Backbone, annotationSetModule, filterChainModule, finalReportTemplateModule, BannerView, FilterView, versionFilterTemplate) {
        'use strict';

        var presetsView = Backbone.View.extend({

            el: '.main-content',
            versionFilterEl: '#version-filter-pane',

            selectedPreset: '',
            events: {
                'click #annotation-set-dialog-btn': '_onClickCreateAnnotationSet',
                "click #filter-chain-dialog-btn": "_onClickCreateFilterChain",
                "click #final-report-template-dialog-btn": "_onClickCreateFinalReportTemplate",
                "click #refreshData": "_onRefresh"
            },

            initialize: function(options) {
                this.options = options || {};
                this.gridEl = this.options.gridEl || null;
                this.gridView = this.options.gridView || null;
                this.versionFilterView = new FilterView({
                    url: '/ir/secure/api/v40/application/versions',
                    title: $.t('filter.version'),
                    template: versionFilterTemplate
                });
                this.versionFilterView.on('filter', this._onVersionFilter, this);
                this.versionFilterView.setElement($(this.versionFilterEl)).render();
            },

            launchDialog : function(action, model) {
                switch (this.selectedPreset || 'annotationSet') {
                case 'annotationSet':
                    this._openAnnotationSetModal(action, model);
                    break;
                case 'filterChain':
                    this._openFilterChainModal(action, model);
                    break;
                case 'finalReportTemplate':
                    this._openFinalReportTemplateModal(action, model);
                    break;
                }
            },
            
            setGridView : function(newGridView) {
                if (this.gridView && this.gridView.getFilters) {
                    _.each(this.gridView.getFilters(), function(value, key) {
                        if (key === 'versionFilter') {
                            newGridView.addFilter(key, value);
                        }
                    }, this);
                }
                this.gridView = newGridView;
            },

            _onClickCreateAnnotationSet: function(e) {
                e.preventDefault();

                this._openAnnotationSetModal('CREATE');
            },
            
            _openAnnotationSetModal: function(action, model) {
                var msgKey = model ? 'workflow.annotation.set.successful.creation' 
                                   : 'workflow.annotation.set.successful.modification';

                annotationSetModule.initialize({
                    model: model,
                    modalSelector: '#preset-dialog',
                    action: action,
                    onComplete: _.bind(this._getCompletePresetModalFunc, this, msgKey, model)
                });
            },

            _onClickCreateFilterChain: function(e) {
                e.preventDefault();

                this._openFilterChainModal('CREATE');
            },

            _openFilterChainModal: function(action, model) {
                var msgKey = model ? 'workflow.filter.chain.successful.creation' 
                                   : 'workflow.filter.chain.successful.modification';

                filterChainModule.initialize({
                    model: model,
                    modalSelector: '#preset-dialog',
                    action: action,
                    onComplete: _.bind(this._getCompletePresetModalFunc, this, msgKey, model)
                });
            },

            _onClickCreateFinalReportTemplate: function(e) {
                e.preventDefault();
                this._openFinalReportTemplateModal('CREATE');
            },
            
            _openFinalReportTemplateModal: function(action, model) {
                var msgKey = model ? 'workflow.final.report.template.successful.modification' 
                                   : 'workflow.final.report.template.successful.creation';
                
                finalReportTemplateModule.initialize({
                    model: model,
                    modalSelector: '#preset-dialog',
                    action: action,
                    onComplete: _.bind(this._getCompletePresetModalFunc, this, msgKey, model)
                });
            },

            _getCompletePresetModalFunc: function(messageKey, model) {
                new BannerView({
                    container: this.$('.container-fluid').first(),
                    style: 'success',
                    titleKey: messageKey
                }).render();
                this.gridEl.data('kendoGrid').dataSource.read();
                if (model) {
                    model.trigger('refresh');
                }
            },
            
            _onVersionFilter: function(version) {
                if (_.isEmpty(version)) {
                    this.gridView.clearFilter('versionFilter');
                } else {
                    this.gridView.addFilter('versionFilter', version);
                }
            },

            _onRefresh: function(e) {
                e.preventDefault();
                this.gridEl.data('kendoGrid').dataSource.read();
            }

        });

        return presetsView;
    });
