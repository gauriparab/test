/*global define:false */
define([
    'underscore',
    'views/analysis/sidebarPairedView',
    'models/analysis/specimenGroupRelationshipModel',
    'models/sample/attribute',
    'hb!templates/sample/samples-fusion-body.html'
], function(
    _,
    PairedView,
    SpecimenGroupRelationship,
    Attribute,
    FusionTemplate) {

    'use strict';

    /**
     * A summary view of Analysis details
     *
     * @type {*}
     */
    var AnalysisSamplesFusionPairedView = PairedView.extend({

        /*
         * The type of the relationship to set on the SpecimenGroups that are created.
         */
        _relationshipType: 'DNA_RNA_FUSION',

        /*
         * Defines the Template that should be used for the Sample relationship.
         */
        _bodyTemplate: FusionTemplate,

        /**
         * Placeholder text in name input.
         */
        _placeholderText: 'Group Name (Required)',

        _sampleOneRole: 'DNA_FUSION',
        _sampleTwoRole: 'RNA_FUSION',

        _selectionValidations: ['_checkSampleTypeAdded', '_canAddSamples'],
        
        _currentModel: null,

        _addRoleIfNecessary: function(sample, relationship, role) {
            var members = relationship.get('members').map(function(member) {
                return !member || {
                    id: member.get('specimen').id,
                    role: member.get('role')
                };
            });
            var existingRole = _.findWhere(members, {role: role});
            var existingSample = _.findWhere(members, {id: sample.id});

            if (!existingSample && !existingRole && this._canAddSample(sample, role)) {
                relationship.get('members').push(new SpecimenGroupRelationship({
                    specimen: sample,
                    role: role
                }));
                return true;
            }

            return false;
        },

        _canAddSamples: function(samples) {
            return _.every(samples, this._canAddSample);
        },

        _canAddSample: function(sample, role) {
            var canAdd = sample.cancerType() && sample.percentCellularity() &&
                (Attribute.Type.DNA === sample.type() || Attribute.Type.RNA === sample.type());

            if (role) {
                if ('DNA_FUSION' === role) {
                    canAdd = canAdd && (Attribute.Type.DNA === sample.type());
                } else if ('RNA_FUSION' === role) {
                    canAdd = canAdd && (Attribute.Type.RNA === sample.type());
                }
            }

            return canAdd;
        },
        
        _checkSampleTypeAdded: function(selectedSamples) {
            var members = this.model.get('members').map(function(member) {
                return member.get('specimen').get('attributeValueMap')["Sample Type"];
            });
              
            return _.some(selectedSamples, function(sample) {
                return (!_.contains(members, sample.get('attributeValueMap')["Sample Type"]));
            });
        }

    });

    return AnalysisSamplesFusionPairedView;

});
