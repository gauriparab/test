/*global define:false*/
define(['jquery',
        'underscore',
        'domready',
        'views/workflows/presetsView',
        'views/common/actionsView',
        'views/workflows/filterChainPresetsGridView',
        'views/workflows/annotationSetPresetsGridView',
        'views/workflows/cnvBaselinePresetsGridView',
        'views/workflows/finalReportTemplatePresetsGridView',
        'views/workflows/targetRegionFilePresetsGridView',
        'views/workflows/hotspotRegionFilePresetsGridView',
        'views/filterChains/filterChainDetailView',
        'views/annotationSets/annotationSetDetailView',
        'views/cnvbaseline/cnvBaselineDetailView',
        'views/finalReportTemplate/finalReportTemplateDetailView',
        'views/targetRegionFileDetailView',
        'views/hotspotRegionFileDetailView',
        'views/common/bannersView',
        'views/loadingView',
        'views/common/confirmModalView',
        'views/common/confirmModalBodyView',
        'views/cnvbaseline/cnvBaselineConfirmDeleteView',
        'views/filterChains/filterChainConfirmDeleteView',
        'views/targetRegionFileConfirmDeleteView',
        'views/hotspotRegionFileConfirmDeleteView',
        'views/annotationSets/annotationSetConfirmDeleteView',
        'views/finalReportTemplate/finalReportTemplateConfirmDeleteView',
        'views/cnvbaseline/cnvBaselineConfirmAbortView']
    .concat('jqFileDownload', 'jqHashChange', 'bootstrap.fileupload', 'i18n'),
function($,
         _,
         domReady,
         PresetsView,
         ActionsView,
         FilterChainPresetsGridView,
         AnnotationSetPresetsGridView,
         CNVBaselineGridView,
         FinalReportTemplateGridView,
         TargetRegionFileGridView,
         HotspotRegionFileGridView,
         FilterChainDetailView,
         AnnotationSetDetailView,
         CNVBaselineDetailView,
         FinalReportTemplateDetailView,
         TargetRegionFileDetailView,
         HotspotRegionFileDetailView,
         BannerView,
         LoadingView,
         Confirm,
         ConfirmBody,
         ConfirmDeleteBaseline,
         ConfirmDeleteFilterChain,
         ConfirmDeleteTargetRegionFile,
         ConfirmDeleteHotspotRegionFile,
         ConfirmDeleteAnnotationSet,
         ConfirmDeleteFinalReportTemplate,
         ConfirmAbortBaseline
    ) {
    'use strict';

    var CONFIG = {
        annotationSet: {
            gridView: AnnotationSetPresetsGridView,
            detailView: AnnotationSetDetailView,
            deleteConfirmView: ConfirmDeleteAnnotationSet,
            itemType: 'Annotation Set',
            msgKeyPrefix: 'annotationSet'
        },
        filterChain: {
            gridView: FilterChainPresetsGridView,
            detailView: FilterChainDetailView,
            deleteConfirmView: ConfirmDeleteFilterChain,
            itemType: 'Filter Chain',
            msgKeyPrefix: 'filterChain'
        },
        baseline: {
            gridView: CNVBaselineGridView,
            detailView: CNVBaselineDetailView,
            deleteConfirmView: ConfirmDeleteBaseline,
            abortConfirmView: ConfirmAbortBaseline,
            msgKeyPrefix: 'cnvbaseline'
        },
        finalReportTemplate : {
            gridView : FinalReportTemplateGridView,
            detailView : FinalReportTemplateDetailView,
            deleteConfirmView : ConfirmDeleteFinalReportTemplate,
            itemType: 'Final Report Template',
            msgKeyPrefix: 'finalReportTemplate'
        },
        targetRegionFile : {
            gridView : TargetRegionFileGridView,
            detailView : TargetRegionFileDetailView,
            deleteConfirmView : ConfirmDeleteTargetRegionFile,
            msgKeyPrefix: 'targetRegionFile'
        },
        hotspotRegionFile : {
            gridView : HotspotRegionFileGridView,
            detailView : HotspotRegionFileDetailView,
            deleteConfirmView : ConfirmDeleteHotspotRegionFile,
            msgKeyPrefix: 'hotspotRegionFile'
        }
    };

    var _view = null,
        _currentConfig = null,
        _gridView = null,
        _deleteConfirmView = null,
        _abortConfirmView = null,
        _actionView = null,
        _hashchangeHandler = null;

    var _showHelp = function(id) {
        // reset summary content to the help text
        $('#details-options-menu').hide();
        $('#summary-section-content').html('<p>' + $.t('workflow.'+id+'.details.no.record.selected') + '</p>');
    };

    /**
     * Update the page with new settings
     *
     * @param id
     */
    var _updatePage = function(id) {
        var $li = $('#' + id);

        _currentConfig = CONFIG[id];

        _view.selectedPreset = id;

        // update the dropdown's displayed text
        $('#preset-select .selectTitle').text($li.find('a').text());

        // update the title on the summary pane
        $('#summary-section span.detailsTitle').text($li.data('summaryTitle'));

        _showHelp(id);

        _gridView = _initializeView(_gridView, _currentConfig.gridView, '#viewpresets-grid');
        _view.setGridView(_gridView);

        if (_currentConfig.deleteConfirmView) {
            _deleteConfirmView = _currentConfig.deleteConfirmView;
        }

        if (_currentConfig.abortConfirmView) {
            _abortConfirmView = _currentConfig.abortConfirmView;
        }

        _actionView = _initializeView(_actionView, ActionsView, "#details-options-menu");

        _actionView.on("action:edit", function(e, selectedModel) {
            var action = $(e.currentTarget).data("action") || "";
            _view.launchDialog(action.toUpperCase(), selectedModel || _actionView.model);
        });

        _actionView.on("action:delete", _deleteAction, _actionView);

        _actionView.on("action:abort", _abortAction, _actionView);

        _actionView.on("action:lock", _lockAction, _actionView);

        _actionView.on("action:download", _downloadAction, _actionView);

        _gridView.on('no-selection', function() {
            _showHelp(id);
        });

        _gridView.on('rowSelect', function(model) {
            var self = this;
            if (model) {
                model.fetch({
                    success: function () {
                        if (self.detailView) {
                            self.detailView.destroy();
                            self.detailView = null;
                        }
                        self.detailView = new _currentConfig.detailView({
                            el: '#summary-section-content',
                            model: model
                        }).render();
                        _actionView.model = model;
                        _actionView.setActions(model.get('actions'));
                        if (_.isFunction(model.getPrimaryAction)) {
                            _actionView.setPrimaryAction(model.getPrimaryAction());
                        }
                        _actionView.render().show();
                    }
                });

                $('#summary-section-content [data-toggle=tooltip]').tooltip();
            }
        });

        _gridView.on("action:edit", function(e, selectedModel) {
            var action = $(e.currentTarget).data("action") || "";
            _view.launchDialog(action.toUpperCase(), selectedModel || _actionView.model);
        });

        _gridView.on('dataBound', function() {
            $('#viewpresets-grid [data-toggle=tooltip]').tooltip();
        });

        _gridView.render();
    };

    var _initializeView = function(previousView, viewConstructor, viewElSelector) {
        if (previousView) {
            if (previousView.destroy) {
                previousView.undelegateEvents();
                previousView.destroy();
            } else {
                previousView.undelegateEvents();
            }
        }
        return new viewConstructor({
            el: viewElSelector
        });
    };

    var _deleteAction = function(e) {
        var toDelete = this.model,
            itemName = toDelete.get('name'),
            msgKeyPrefix = _currentConfig.msgKeyPrefix;
        e.preventDefault();
        e.stopPropagation();
        Confirm.open(function() {
            toDelete.destroy({
                success: function() {
                    BannerView.show({
                        id: 'success-banner',
                        container: $('.main-content>.container-fluid'),
                        style: 'success',
                        title: $.t(msgKeyPrefix + '.delete.success', { item: { name: itemName}})
                    });
                    _showHelp(location.hash && location.hash.substr(1) || 'annotationSet');
                    _gridView.refresh();
                }
            });
        }, {
            name: itemName,
            dialogName: 'confirm-delete-preset'
        }, _deleteConfirmView);
    };

    var _abortAction = function(e) {
        var toAbort = this.model,
            msgKeyPrefix = _currentConfig.msgKeyPrefix;

        e.preventDefault();

        Confirm.open(function() {
            toAbort.abort({
                success: function(model) {
                    BannerView.show({
                        id: 'success-banner',
                        container: $('.main-content>.container-fluid'),
                        style: 'success',
                        title: $.t(msgKeyPrefix + '.abort.success', { item: { name: model.get('name')}})
                    });
                    _gridView.refresh();
                }
            });
        }, {
            name: toAbort.get('name'),
            dialogName: 'confirm-abort-preset'
        }, _abortConfirmView);
    };

    var _lockAction = function() {
        var lockModel = this.model;
        var itemType = _currentConfig.itemType;
        Confirm.open(function() {
            $.ajax({
                url: lockModel.urlRoot + '/lock/' + lockModel.id,
                type: 'POST',
                noGlobalErrorHandler: true,
                success : function() {
                    new BannerView({
                        id: 'lock-success-banner',
                        container: $('.main-content>.container-fluid'),
                        style: 'success',
                        title: $.t('item.lock.success', { itemType: itemType, itemName: lockModel.get('name')})
                    }).render();
                    _actionView.$el.hide();
                    _gridView.clearRow();
                    _gridView.refresh();
                },
                error : function() {
                    new BannerView({
                        id: 'lock-error-banner',
                        container: $('.main-content>.container-fluid'),
                        style: 'error',
                        title: $.t('item.lock.error', { itemType: itemType, itemName: lockModel.get('name')})
                    }).render();
                }
            });
        }, {
            headerKey: $.t('item.lock.header', { itemType: itemType }),
            warning: $.t('item.lock.warning', { itemType: itemType }),
            description: $.t('item.lock.confirm', { itemType: itemType }),
            cancelClass: 'btn-primary',
            dialogName: 'confirm-lock-preset'
        }, ConfirmBody);
    };

    var _downloadAction = function() {
        var downloadModel = this.model;
        var downloadId = downloadModel.id;

        if (_view.selectedPreset === 'targetRegionFile') {
            _downloadData('/ir/secure/api/v40/targetregions/' + downloadId + '/download',
               'targetregion.download.processing');
        }

        if (_view.selectedPreset === 'hotspotRegionFile') {
            _downloadData('/ir/secure/api/v40/hotspotregions/' + downloadId + '/download',
                'hotspotregion.download.processing');
        }
    };

    var _downloadData = function(url, loadingViewKey) {
        var loadingView = new LoadingView({
            bodyKey: loadingViewKey
        });
        loadingView.render();
        $.fileDownload(url, {
            successCallback: function() {
                loadingView.hide();
            },
            failCallback: function() {
                loadingView.hide();
                new BannerView({
                    id: 'error-banner',
                    container: $('.main-content>.container-fluid'),
                    style: 'error',
                    title: $.t('exception.msg.public.default')
                }).render();
            }
        });
        loadingView.hide();
    };

    /**
     * Initialize this module
     *
     */
    var initialize = function(options) {
        domReady(function() {
            _view = new PresetsView({
                gridEl: $('#viewpresets-grid')
            });

            var summarySection = $(".summary-section");
            summarySection.affix({
                offset: {
                    top: summarySection.position().top
                }
            });
            summarySection.width(summarySection.width());

            // on a hash change, update the page with new settings
            if (!_hashchangeHandler) {
                _hashchangeHandler = $(window).hashchange(function() {
                    _updatePage(location.hash && location.hash.substr(1) || 'annotationSet');
                });
            }

            // trigger an initial hash change
            $(window).hashchange();

            if (options.savedPresetName) {
                new BannerView({
                    id: 'success-alert',
                    container: $('.main-content>.container-fluid'),
                    style: 'success',
                    title: $.t('preset.saved.successfully', { preset: { name: options.savedPresetName }})
                }).render();
            }
        });
    };

    return {
        initialize: initialize,
        actionView: function() {
            return _actionView;
        }
    };

});