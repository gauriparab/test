/*global define:false*/
define(['jquery', 'underscore', 'backbone', 'models/filterChain', 'models/filter', 'collections/filterCollection',
        'views/filterChains/filterView', 'views/filterChains/selectedFiltersView', 'views/formView',
        'views/errorsView', 'events/eventDispatcher', 'hb!templates/filterChain/filter-chain-edit.html'],
    function($, _, Backbone, FilterChain, Filter, FilterCollection, FilterView, SelectedFiltersView, FormView,
             ErrorsView, dispatcher, template) {

    "use strict";

    var MIN_NAME_LENGTH = 1;

    var FilterChainView = FormView.extend({

        submitButtonSelector: '#workflow-preset-btn-save',

        initialize: function() {
            this.model = this.options.model || new FilterChain();
            this.primaryButtonKey = this.options.primaryButtonKey || 'button.save';
            this._filterChain = new FilterChain();
            this.availableFilters = this.collection || new FilterCollection();
            this._selectedFilter = this.options.selectedFilter || new Filter();
            this._filterChain.set({
                name: this.model.get('name'),
                description: this.model.get('description'),
                filters: this.model ? this.model.getFilters() : new FilterCollection()
            });

            this.filterView = new FilterView({
                collection: this.availableFilters,
                model: this._filterChain,
                selectedFilter: this._selectedFilter
            });

            this.errorsView = new ErrorsView({
                model: this._filterChain
            });

            this.selectedFiltersView = new SelectedFiltersView({
                model: this._filterChain
            });
        },

        delegateEvents: function() {
            FormView.prototype.delegateEvents.call(this);

            // enable/disable the save button...
            this.listenTo(this._filterChain, 'change', this.enableDisableSaveButton);
            this.listenTo(this._filterChain.get('filters'), 'add', this.enableDisableSaveButton);
            this.listenTo(this._filterChain.get('filters'), 'remove', this.enableDisableSaveButton);

            // enable/disable the configure button...
            this.listenTo(this.filterView, FilterView.Event.FILTER_VALUE_SELECTION_CHANGED, this.enableDisableConfigureFilterButton);
        },

        undelegateEvents: function() {
            this.stopListening(this.filterView);

            this.stopListening(this._filterChain);
            this.stopListening(this._filterChain.get('filters'));

            FormView.prototype.undelegateEvents.call(this);
        },

        events: {
            'click #workflow-preset-btn-cancel': 'closeDialog',
            'click a.filter-chain-filter-btn-trash': 'trash',
            'keyup input.filter-input': 'enableDisableConfigureFilterButton',
            'change input.filter-input': 'enableDisableConfigureFilterButton',
            'click tr': 'enableDisableConfigureFilterButton',
            'change select.filter-input': 'enableDisableConfigureFilterButton',
            'keyup input.filter-chain-input': 'enableDisableSaveButton',
            'click button.filter-chain-filter-btn-configure': 'addFilter',
            'change select#filter-select': 'enableDisableConfigureFilterButton',
            'keyup input#filter-chain-name' : 'validateName'
        },

        enableDisableConfigureFilterButton: function(e) {
            var $configureButton = this.$el.find('button.filter-chain-filter-btn-configure');
            if (this._isValidFilter(this._selectedFilter)) {
                $configureButton.removeClass("disabled").removeProp('disabled');
                var allControls = this.$el.find(".filter-input").closest(".control-group");
                allControls.removeClass("error");
            } else {
                $configureButton.addClass("disabled").prop('disabled', 'disabled');
                var control = $(e.currentTarget).filter(".filter-input").closest(".control-group");
                control.addClass("error");
            }
        },

        enableDisableSaveButton: function() {
            if (this._isValidFilterChain()) {
                this.enableButton(this.submitButtonSelector);
            } else {
                this.disableButton(this.submitButtonSelector);
            }
        },

        render: function() {
            this.$el.html(template({
                action: this.options.action || 'CREATE',
                name : this._filterChain.get("name"),
                description : this._filterChain.get("description"),
                primaryButtonKey: this.primaryButtonKey
            }));

            this.renderSubView(this.errorsView, "#errors");
            this.renderSubView(this.filterView, "#filter-chain-edit-filter");
            this.renderSubView(this.selectedFiltersView, "#filter-chain-edit-selected-filters");

            this.enableDisableSaveButton();
            return this;
        },

        closeDialog : function() {
            this.$el.modal('hide');
            this.undelegateEvents();
            this.filterView.remove();
            this.errorsView.remove();
            this.selectedFiltersView.remove();
        },

        save: function() {
            var filterChainName = this.$el.find('input#filter-chain-name').val().trim();
            var filterChainDescription = this.$el.find('input#filter-chain-desc').val();

            // clean up multi-filter configured values on save if filter option != 'CONFIGURED'
            var filters = this._filterChain.getFilters();
            filters.each(function(filter) {
                var configuredFilterOption = filter.get('configuredFilterOption');
                if (configuredFilterOption && configuredFilterOption !== 'CONFIGURED') {
                    filter.set('configuredValues', []);
                }
            });
            
            this.model.set({
                name: filterChainName,
                description: filterChainDescription,
                filters: filters
            });

            this.persistFilterChain();
            dispatcher.trigger('filterChain:createSuccess', null);
        },

        persistFilterChain: function() {
            if (_.isFunction(this.options.onPersistFilterChain)) {
                this.options.onPersistFilterChain(this.model);
            } else {
                this.model.save({}, {
                    noGlobalErrorHandler: true,
                    success: _.bind(this.success, this)
                });
            }
        },

        trash: function(e) {
            e.preventDefault();

            var $currentTarget = $(e.currentTarget);
            var selectedFilterId = $currentTarget.data('cid');
            var selectedFilter = this._filterChain.getFilters().get(selectedFilterId);

            this._filterChain.getFilters().remove(selectedFilter);
            this.errorsView.clear();
        },

        success: function(model, response) {
            if (this.options.onComplete && _.isFunction(this.options.onComplete)) {
                var filterChain = new FilterChain(response);
                this.options.onComplete(filterChain);
            }

            this.closeDialog();
        },

        addFilter: function(e) {
            e.preventDefault();

            this.errorsView.clear();

            var $currentTarget = $(e.currentTarget);
            if ($currentTarget.hasClass('disabled')) {
                return;
            }

            // delegate to the sub view to configure the filter to be added to the chain
            this.filterView.prepareFilterForAdd();

            var newFilter = this.filterView._currentEditView.filter.clone();

            // add/update the selected filter without removing other filters...
            this._filterChain.getFilters().set(newFilter, {remove: false});
            this.selectedFiltersView.render();
        },

        _isValidFilterChain: function() {

            // at least one filter...
            if (this._filterChain.getFilters().length <= 0) {
                return false;
            }

            // validate name exists (shallow client side validation)
            var name = this.$el.find('input#filter-chain-name').val();
            if (!name || !name.trim().length || name.trim().length < MIN_NAME_LENGTH) {
                return false;
            }
            return true;
        },

        _isValidFilter: function(filter) {
            // delegate to the filter view since different filters may have different validation reqs
            return this.filterView.isValidFilter(filter);
        },

        validateName : function(e) {
            this.errorsView.clear();
            this.model.set('name', $(e.currentTarget).val());
            var validationErrors = this.model.validate();
            if (validationErrors) {
                this.errorsView.showErrorsByKeys("Name", validationErrors);
                this.disableButton(this.submitButtonSelector);
                this.$(".control-group:first").addClass("error");
            } else {
                this.$(".control-group:first").removeClass("error");
            }
        }

    });

    return FilterChainView;
});
