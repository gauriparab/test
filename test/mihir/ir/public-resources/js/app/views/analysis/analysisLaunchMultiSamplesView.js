/*global define:false*/
define(['jquery', 'underscore', 'views/analysis/analysisLaunchSamplesView', 'models/analysis/specimenGroupModel',
    'models/analysis/specimenGroupRelationshipModel'],
    function($, _, AnalysisSamplesView, SpecimenGroup, SpecimenRelationship) {
        'use strict';

        var MultiSamplesView = AnalysisSamplesView.extend({

            _initialize: function() {
                this.gridView.on('select', this._sampleSelected, this);
                this.gridView.on('unselect', this._sampleDeselected, this);
                this.gridView.on('dataBound', this._selectSample, this);

                if (!this.model.has('specimenGroup') ||
                    this.model.getSub('specimenGroup.groupType') !== SpecimenGroup.prototype.groupTypes.MULTI) {
                    // if it doesn't exist yet, create the specimen group object that will store the selected samples.
                    // don't fire an event because that would trigger the validation to early and display the error
                    // banner before the user has a chance to make a selection
                    this.model.set('specimenGroup', new SpecimenGroup({
                        groupType: SpecimenGroup.prototype.groupTypes.MULTI
                    }), { silent: true });
                }

            },

            _sampleSelected: function(sample) {
                this._doAddOrRemoveIfNecessary(sample, function(collection, relationship, model) {
                    if (!relationship) {
                        collection.add(new SpecimenRelationship({
                            specimen: sample
                        }));
                        model.trigger('change');
                    }
                });
            },

            _doAddOrRemoveIfNecessary : function(sample, action) {
                var selectedSpecimens = this.model.getSub('specimenGroup.members');

                var existingRelationship = selectedSpecimens.find(function(member) {
                    return member.getSub('specimen.id') === sample.id;
                });

                action(selectedSpecimens, existingRelationship, this.model);

                this.sidebarView.render();
            },

            _sampleDeselected: function(sample) {
                this._doAddOrRemoveIfNecessary(sample, function(collection, relationship, model) {
                    if (relationship) {
                        collection.remove(relationship);
                        model.trigger('change');
                    }
                });
            },

            _selectSample: function() {
                var members = this.model.getSub('specimenGroup.members');
                members.each(function(member) {
                    this.gridView.selectItem(member.getSub('specimen.id'));
                }, this);
            }
        });

        return MultiSamplesView;

    }
);