/*global define:false*/
define(['jquery', 'underscore', 'views/analysis/analysisLaunchSamplesView', 
    'models/analysis/specimenGroupModel', 'models/analysis/specimenGroupRelationshipModel'],
    function($, _, AnalysisSamplesView, SpecimenGroup) {
        'use strict';

        var SingleSamplesView = AnalysisSamplesView.extend({

            _initialize : function() {
                this.gridView.on('select', this._sampleSelected, this);
                this.gridView.on('unselect', this._sampleDeselected, this);
                this.gridView.on('dataBound', this._selectSample, this);
            },

            _sampleSelected: function(sample) {
                var existing = this._findSample(sample);
                if (!existing) {
                    this.model.get('specimenGroups').add(new SpecimenGroup({
                        name: sample.get('name'),
                        groupType: this.model.get('workflow').getSpecimenGroup(),
                        members: [{
                            specimen: sample,
                            role: this.model.get('workflow').isRnaSingle() ? 'PROBAND' : 'NONE'
                        }]
                    }));
                    this.model.trigger('change');
                    this.sidebarView.render();
                }
            },

            _sampleDeselected: function(sample) {
                var existing = this._findSample(sample);
                if (existing) {
                    this.model.get('specimenGroups').remove(existing);
                    this.model.trigger('change');
                    this.sidebarView.render();
                }
            },
            
            // find the sample, if it exists, in the models specimenGroups collection
            _findSample: function(sample) {
                var found = null;
                this.model.get('specimenGroups').each(function(specimenGroup) {
                    if (specimenGroup.get('members').at(0).get('specimen').get('id') === sample.get('id')) {
                        found = specimenGroup;
                    }
                });
                return found;
            },
            
            _selectSample: function() {
                this.model.get('specimenGroups').each(function(specimenGroup) {
                    this.gridView.selectItem(specimenGroup.get('members').at(0).get('specimen').get('id'));
                }, this);
            }
        });

        return SingleSamplesView;

    }
);