/* global define:false */
define([
    'jquery',
    'underscore',
    'backbone',
    'models/filterChain',
    'collections/filterCollection',
    'views/filterChains/filterChainView',
    'events/eventDispatcher'
].concat(
    'bootstrap.modal',
    'bootstrap.modalmanager'
), function(
    $,
    _,
    Backbone,
    FilterChain,
    FilterCollection,
    FilterChainView,
    dispatcher
) {
    'use strict';

    var FilterChainEditingView = Backbone.View.extend({

        _filterChainView: null,
        
        initialize: function(options) {
            options = options || {};
            this._filterChainDialogSelector = options.filterChainDialogSelector || '#filter-chain-dialog';
            this._filterChain = options.filterChain || null;
            this._analysisId = options.analysisId;
            this.createFilterChain = options.createFilterChain;
            this.modifyFilterChain = options.modifyFilterChain;
            this.onSuccessfulCreate = options.onSuccessfulCreate;
            this.onSuccessfulUpdate = options.onSuccessfulUpdate;
            this.primaryButtonKey = options.primaryButtonKey;
            this._allAvailableFilters = null;
        },

        delegateEvents: function() {
            Backbone.View.prototype.delegateEvents.apply(this, arguments);
            dispatcher.on('filterChain:selectionChanged', _.bind(this._onFilterChainSelectionChanged, this));
        },

        undelegateEvents: function() {
            dispatcher.off('filterChain:selectionChanged');
            Backbone.View.prototype.undelegateEvents.apply(this, arguments);
        },

        events: {
            'click #edit-filter-chain': '_editCurrentFilterChain',
            'click #clone-filter-chain': '_cloneCurrentFilterChain',
            'click #create-new-filter-chain': '_createNewFilterChain'
        },

        render: function() {
            this._showFilterChainEditButtons();
            return this;
        },

        _onFilterChainSelectionChanged: function(filterChain) {
            this._filterChain = filterChain;
            this._showFilterChainEditButtons();
        },

        _showFilterChainEditButtons: function() {
            var cloneButton = this.$('#clone-filter-chain'),
                editButton = this.$('#edit-filter-chain');
            if (this._filterChain) {
                editButton.show();
                if (this._filterChain.get('status') === 'LOCKED') {
                    editButton.hide();
                } else {
                    editButton.show();
                }
            } else {
                cloneButton.hide();
                editButton.hide();
            }
        },

        _editCurrentFilterChain: function(e) {
            e.preventDefault();
            if (!($(e.currentTarget).find('i').hasClass('disabled'))) {
                this._prepareFiltersAndOpenFilterChainDialog(this._filterChain,
                        this.modifyFilterChain,
                        this.onSuccessfulUpdate, "EDIT");
            }
        },

        _cloneCurrentFilterChain: function(e) {
            e.preventDefault();
            if (!($(e.currentTarget).find('i').hasClass('disabled'))) {
                var newFilterChain = this._filterChain.clone();
                newFilterChain.unset('id');
                newFilterChain.unset('name');
                this._createNewFilterChain(e, newFilterChain);
            }
        },

        _createNewFilterChain: function(e, aNewFilterChain) {
            e.preventDefault();
            this._prepareFiltersAndOpenFilterChainDialog(
                aNewFilterChain || new FilterChain(),
                this.createFilterChain,
                this.onSuccessfulCreate, "CREATE");
        },

        _prepareFiltersAndOpenFilterChainDialog: function(filterChain, persist, onSuccessfulPersist, action) {
            if(this._allAvailableFilters) {
                this._launchFilterChainDialog(filterChain, null, {
                    filterChain: filterChain,
                    action: action,
                    persist: persist,
                    onSuccessfulPersist: onSuccessfulPersist
                });
            } else {
                this._allAvailableFilters = new FilterCollection(null, {analysisId: this._analysisId});
                this._allAvailableFilters.fetch({
                    success: _.bind(this._launchFilterChainDialog, this),
                    filterChain: filterChain,
                    persist: persist,
                    onSuccessfulPersist: onSuccessfulPersist
                });
            }
        },

        _launchFilterChainDialog: function(model, response, options) {
            var self = this,
                filterChain = options.filterChain,
                onPersistFilterChain = options.persist && function() {
                    options.persist.call(self, filterChain);
                },
                filterChainView = new FilterChainView({
                    el: this._filterChainDialogSelector,
                    model: filterChain,
                    primaryButtonKey: this.primaryButtonKey,
                    collection: this._allAvailableFilters,
                    action: options.action,
                    onPersistFilterChain: onPersistFilterChain,
                    onComplete: options.onSuccessfulPersist
                });
            this._filterChainView = filterChainView;
            dispatcher.on('filterChain:createSuccess', _.bind(this._onFilterCreateSuccess, this));
            filterChainView.render().$el.modal({
                width: (function() {
                    return ($(window).width() <= 1024) ? '92%' : '75%';
                }()),
                backdrop: 'static',
                attentionAnimation: null,
                keyboard: false,
                show : true,
                maxHeight : function() {
                    return $(window).height() - 200;
                }
            });
        },
        
        _onFilterCreateSuccess: function() {
            this._filterChainView.closeDialog();
        }

    });

    return FilterChainEditingView;
});
