/*global define:false*/
define(['jquery', 'underscore', 'events/eventDispatcher', 'collections/specimens', 
    'views/analysis/analysisLaunchSamplesView'],
    function($, _, dispatcher, SpecimenCollection, AnalysisSamplesView) {
        'use strict';

        var SamplesRelationshipView = AnalysisSamplesView.extend({

            _initialize: function() {
                this.selectedSamples = new SpecimenCollection();
                this.gridView.on('dataBound', this._clearSelected, this);
                this.gridView.on('select', this._sampleSelected, this);
                this.gridView.on('unselect', this._sampleSelected, this);
                dispatcher.on("specimenGroup:requestSelections", this._notifyWithSelections, this);
            },
            
            _clearSelected: function() {
                this.selectedSamples.reset();
                this.gridView.clearSelection();
                dispatcher.trigger("specimenGroup:selectionsChanged", this.selectedSamples);
            },

            _sampleSelected: function(samples) {
                samples = _.flatten([samples]);
                _.each(samples, function(sample) {
                    var existing = this.selectedSamples.get(sample.id); 
                    if (existing) {
                        this.selectedSamples.remove(existing);
                    } else {
                        this.selectedSamples.add(sample);
                    }
                    
                }, this);
                dispatcher.trigger("specimenGroup:selectionsChanged", this.selectedSamples.models);
            },
            
            _notifyWithSelections : function() {
                dispatcher.trigger("samples:selected", this.selectedSamples.models);
                this._clearSelected();
            }
        });

        return SamplesRelationshipView;

    }
);