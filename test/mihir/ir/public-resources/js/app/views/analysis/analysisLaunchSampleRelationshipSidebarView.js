/*global define:false */
define(['jquery', 'underscore', 'events/eventDispatcher', 'views/ParentView',
    'hb!templates/analysis/analysis-samples-relationships-sidebar.html'],
    function($, _, dispatcher, ParentView, template) {
        'use strict';

        /**
         * The common sidebar for defining relationships during an analysis
         *
         * @type {*}
         */
        var AnalysisSamplesRelationshipsSidebarView = ParentView.extend({

            /*
             * Override in subclasses to define the view that will be used for individual relationships.
             */
            relationshipView: null,

            /*
             * Override in subclasses to dictate the Title of the sidebar
             */
            headerKey: null,

            initialize: function() {
                this.sampleViews = {};
                this.header = new this.relationshipView({id : null});
                this.listenTo(dispatcher, 'specimenGroup:analyze', this._addRelationshipFromTemplate);
                this.listenTo(dispatcher, 'specimenGroup:remove', this._removeRelationship);
                this.listenTo(dispatcher, "specimenGroup:change:name", this._relationshipNameChanged);
            },

            render: function() {
                this.$el.html(template({ titleKey : this.headerKey }));
                this.renderSubView(this.header, ".specimengroups-header");
                this.model.get("specimenGroups").each(this._addRelationshipFromTemplate, this);
                return this;
            },

            _addRelationshipFromTemplate : function (specimenGroup) {
                if (!this.sampleViews[specimenGroup.cid]) {
                    this.model.get("specimenGroups").add(specimenGroup);
                    dispatcher.trigger("validate");
                    var newView = new this.relationshipView({
                        model: specimenGroup,
                        id: specimenGroup.cid
                    }).render();
                    this.$(".specimengroups").prepend(newView.$el);
                    this.sampleViews[specimenGroup.cid] = newView;
                }
            },

            _removeRelationship: function(specimenGroup) {
                this.model.get("specimenGroups").remove(specimenGroup);
                delete this.sampleViews[specimenGroup.cid];
                var viewsWithSameName =
                    this._findSampleViewWithSameRelationshipName(specimenGroup, specimenGroup.attributes.name);
                if (viewsWithSameName.length === 1) {
                    // previously there was exactly one other group with the same name
                    // so we update that one since the one duplicate was removed
                    // otherwise if there were more than one don't make any other change because there are still duplicates
                    _.each(viewsWithSameName, function(sampleView) {
                        sampleView.refreshDisplayedName(sampleView.model.isNameValid());
                        sampleView.duplicateNameError(!sampleView.model.isNameValid());
                    }, this);
                }
                dispatcher.trigger("validate");
            },

            _findSampleViewWithSameRelationshipName: function(specimenGroup, searchedName) {
                var viewsWithSameName = _.filter(this.sampleViews, function(sampleView) {
                    return specimenGroup.cid !== sampleView.model.cid &&
                        sampleView.model.get('name') === searchedName;
                });
                if (specimenGroup.cid !== this.header.model.cid &&
                        this.header.model.get('name') === searchedName) {
                    viewsWithSameName.push(this.header);
                }
                return viewsWithSameName;
            },

            _relationshipNameChanged: function(specimenGroup, changedRelationshipView) {
                var viewsWithSameNewName =
                    this._findSampleViewWithSameRelationshipName(specimenGroup, specimenGroup.attributes.name);
                if (viewsWithSameNewName.length > 0) {
                    changedRelationshipView.refreshDisplayedName(false);
                    changedRelationshipView.duplicateNameError(true);
                } else {
                    changedRelationshipView.validateName();
                }
                dispatcher.trigger("validate");
            }

        });

        return AnalysisSamplesRelationshipsSidebarView;

    }
);
