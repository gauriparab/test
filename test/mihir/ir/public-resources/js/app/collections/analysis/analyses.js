/* global define:false */
define(['jquery',
        'underscore',
        'backbone',
        'models/analysis/analysisModel'],
function($,
         _,
         Backbone,
         Analysis) {

    'use strict';

    var Analyses = Backbone.Collection.extend({

        model: Analysis,
        
        url: '/ir/secure/api/v40/analyses/chromosomes?viz=true&analysisIds=',
        
        getChromosomes: function(success) {
            var self = this;
            $.ajax({
                type : 'GET',
                url : self.url + self.getIds().join(),
                success: success
            });
        },

        getIds: function() {
            return this.pluck('id');
        },

        isReportPublished: function() {
            if (_.size(this) === 1) {
                return this.first().isReportPublished();
            } else {
                return false;
            }
        },

        displayTotalVariantsHidden: function() {
            if (_.size(this) === 1) {
                return this.first().isSuccessful();
            } else {
                return false;
            }
        },

        displayTotalVariantsFilteredOut: function() {
            if (_.size(this) === 1) {
                return this.first().isSuccessful();
            } else {
                return true;
            }
        }

    });

    Analyses.create = function(analysisIds) {
        return new Analyses(_.map(analysisIds, function(analysisId) {
            return {id: analysisId};
        }, this));
    };

    return Analyses;

});


