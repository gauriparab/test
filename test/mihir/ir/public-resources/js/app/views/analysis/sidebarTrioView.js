/*global define:false */
define(['jquery', 'underscore', 'events/eventDispatcher', 'models/analysis/specimenGroupRelationshipModel',
    'views/analysis/sidebarRelationshipView', 'hb!templates/sample/samples-trio-body.html'],
    function($, _, dispatcher, SpecimenGroupRelationShip, RelationshipView, TrioBodyTemplate) {
        'use strict';

        /**
         * A summary view of Analysis details
         *
         * @type {*}
         */
        var AnalysisSamplesTrioView = RelationshipView.extend({

            _nameValidation: /^[\w ]*$/,
            /*
             * The type of the relationship to set on the SpecimenGroups that are created.
             */
            _relationshipType: "TRIO",

            /*
             * The maximum # of samples that this relationship supports.
             */
            _maxSamples: 3,

            /*
             * Defines the Template that should be used for the Sample relationship.
             */
            _bodyTemplate: TrioBodyTemplate,

            /*
             * a single function or array of functions that will be run in addition to the defaults in here
             * in order to dictate if the selected samples can be added to this relationship. a return value of
             * True should indicate valid, False should indicate invalid.
             */
            _selectionValidations: "_validateSamplesHaveSlots",

            _validateSamplesHaveSlots: function(selectedSamples) {
                var members = this.model.get("members").map(function(member) {
                    return member.toJSON();
                });
                var childSlots = _.findWhere(members, {role: "CHILD"}) ? 0 : 1;
                var fatherSlots = _.findWhere(members, {role: "FATHER"}) ? 0 : 1;
                var motherSlots = _.findWhere(members, {role: "MOTHER"}) ? 0 : 1;
                return _.every(selectedSamples, function(sample) {
                    if (sample.get("attributeValueMap").Gender === "Male") {
                        return fatherSlots-- > 0 || childSlots-- > 0;
                    } else if (sample.get("attributeValueMap").Gender === "Female") {
                        return motherSlots-- > 0 || childSlots-- > 0;
                    }
                });
            },

            _addToRelationship: function(selectedSamples) {

                _.each(selectedSamples, function(sample) {
                    var attributeMap = sample.get("attributeValueMap");
                    if (attributeMap.Gender === "Male") {
                        return this._addRoleIfNecessary(sample, this.model, "FATHER") ||
                            this._addRoleIfNecessary(sample, this.model, "CHILD");
                    } else if (attributeMap.Gender === "Female") {
                        return this._addRoleIfNecessary(sample, this.model, "MOTHER") ||
                            this._addRoleIfNecessary(sample, this.model, "CHILD");
                    }
                }, this);
                this.reRenderAndValidate();
            },

            _swapRoles: function(e) {
                e.preventDefault();
                if (this.model.get("members").length) {
                    var father = null, mother = null, child = null;
                    this.model.get("members").each(function(member) {
                        switch (member.get("role")) {
                        case "FATHER":
                            father = member;
                            break;
                        case "MOTHER":
                            mother = member;
                            break;
                        case "CHILD":
                            child = member;
                            break;
                        }
                    });

                    if (child) {
                        if (child.get("specimen").get("attributeValueMap").Gender === "Male") {
                            changeRole(child, "FATHER");
                            changeRole(father, "CHILD");
                        } else {
                            changeRole(child, "MOTHER");
                            changeRole(mother, "CHILD");
                        }
                    } else {
                        changeRole(mother || father, "CHILD");
                    }
                    this.reRenderAndValidate();
                }

                function changeRole(member, role) {
                    if (member) {
                        member.set("role", role);
                    }
                }
            }
        });

        return AnalysisSamplesTrioView;

    }
)
;
