/*global define:false*/
define([ 'underscore', 'models/baseModel', 'models/analysis/specimenGroupRelationshipModel',
    'collections/specimenGroupRelationships'],
    function(_, BaseModel, SpecimenGroupRelationship, SpecimenRelationshipModels) {
        "use strict";
        var SpecimenGroup = BaseModel.extend({
            groupTypes: {
                SINGLE: 'SINGLE',
                SINGLE_RNA_FUSION: 'SINGLE_RNA_FUSION',
                PAIRED: 'PAIRED',
                PAIRED_TN: 'PAIRED_TUMOR_NORMAL',
                MULTI: 'MULTI',
                TRIO: 'TRIO',
                DNA_RNA_FUSION: 'DNA_RNA_FUSION'
            },

            _valid: /(^[A-Za-z0-9_\-\. ]{1,256}$)/,

            defaults: function() {
                return {
                    groupType: this.groupTypes.SINGLE,
                    members: new SpecimenRelationshipModels(),
                    metadata: null
                };
            },

            initialize: function() {
                this.attributes = this.parse(this.attributes);
            },

            parse: function(resp) {
                resp.members = new SpecimenRelationshipModels(_.map(resp.members, function(member) {
                    return (member instanceof SpecimenGroupRelationship) && member || new SpecimenGroupRelationship(member);
                }));
                return resp;
            },

            toSlimJSON: function() {
                var json = _.clone(this.attributes);
                json.members = this.attributes.members.map(function(member) {
                    return member.toSlimJSON();
                });
                return json;
            },

            isValidRelationship: function() {
                var sampleRoles = {};
                this.attributes.members.each(function(member) {
                    sampleRoles[member.get("role")] = member.get("specimen");
                });
                switch (this.get("groupType")) {
                case this.groupTypes.TRIO:
                    return this.isNameValid() && this._isValidTrio(sampleRoles);
                case this.groupTypes.PAIRED_TN:
                    return this.isNameValid() && this._isValidPairedTN(sampleRoles);
                case this.groupTypes.PAIRED:
                    return this.isNameValid() && this._isValidPaired(sampleRoles);
                case this.groupTypes.DNA_RNA_FUSION:
                    return this.isNameValid() && this._isValidFusion(sampleRoles);
                }

                return false;
            },

            isNameValid: function() {
                var name = this.attributes.name;
                return name && this._valid.test(name);
            },

            _isValidTrio: function(sampleRoles) {
                return this.attributes.members.length === 3 && sampleRoles.FATHER && sampleRoles.MOTHER && sampleRoles.CHILD;
            },

            _isValidPairedTN: function(sampleRoles) {
                return this.attributes.members.length === 2 && sampleRoles.TUMOR && sampleRoles.NORMAL;
            },

            _isValidPaired: function(sampleRoles) {
                return this.attributes.members.length === 2 && sampleRoles.SAMPLE && sampleRoles.CONTROL;
            },

            _isValidFusion: function(sampleRoles) {
                return this.attributes.members.length === 2 && sampleRoles.DNA_FUSION && sampleRoles.RNA_FUSION;
            }

        });

        return SpecimenGroup;
    });
