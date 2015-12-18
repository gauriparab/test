/*global define:false */
define(['underscore', 'models/analysis/specimenGroupRelationshipModel', 
    'views/analysis/sidebarRelationshipView', 'hb!templates/sample/samples-paired-body.html'],
    function(_, SpecimenGroupRelationship, RelationshipView, PairedTemplate) {
        'use strict';

        /**
         * A summary view of Analysis details
         *
         * @type {*}
         */
        var AnalysisSamplesPairedTNView = RelationshipView.extend({

            /*
             * The type of the relationship to set on the SpecimenGroups that are created.
             */
            _relationshipType: "PAIRED",

            /*
             * The maximum # of samples that this relationship supports.
             */
            _maxSamples: 2,

            /*
             * Defines the Template that should be used for the Sample relationship.
             */
            _bodyTemplate: PairedTemplate,

            /*
             * a single function or array of functions that will be run in addition to the defaults in here
             * in order to dictate if the selected samples can be added to this relationship. a return value of 
             * True should indicate valid, False should indicate invalid.
             */
            _selectionValidations: null,
            
            _sampleOneRole: "SAMPLE",
            _sampleTwoRole: "CONTROL",

            _getSamples: function() {
                var relationship = {};
                var sampleMap = this.model.get("members").map(function(member) {
                    return {
                        role: member.get("role"),
                        name: member.get("specimen").get("name"),
                        gender: member.get("specimen").get("attributeValueMap").Gender
                    };
                });

                _.each(sampleMap, function(member) {
                    if (member.role === this._sampleOneRole) {
                        relationship.SAMPLE1 = member;
                    } else if (member.role === this._sampleTwoRole) {
                        relationship.SAMPLE2 = member;
                    }

                }, this);
                return relationship;
            },
            
            getAdditionalTemplateParams: function() {
                return {
                    sampleRole1: this._sampleOneRole,  
                    sampleRole2: this._sampleTwoRole  
                }; 
            },

            _addToRelationship: function(selectedSamples) {
                _.each(selectedSamples, function(sample) {
                    return this._addRoleIfNecessary(sample, this.model, this._sampleOneRole) ||
                        this._addRoleIfNecessary(sample, this.model, this._sampleTwoRole);
                }, this);
                this.reRenderAndValidate();
            },

            _swapRoles: function(e) {
                e.preventDefault();
                if (this.model.get("members").length) {
                    this.model.get("members").each(function(member) {
                        if (member.get("role") === this._sampleOneRole) {
                            member.set("role", this._sampleTwoRole);
                        } else {
                            member.set("role", this._sampleOneRole);
                        }
                    }, this);

                    this.reRenderAndValidate();
                }
            }

        });

        return AnalysisSamplesPairedTNView;

    }
)
;
