/*global define:false*/
define([ 'underscore', 'backbone', 'models/baseModel', 'collections/finalReportSectionCollection', 'models/common/nameValidation'],
    function(_, Backbone, BaseModel, FinalReportSectionCollection, NameValidation) {
    "use strict";

    var EDIT_ACTION = 'EDIT';

    var FinalReportTemplate = BaseModel.extend({
        urlRoot : '/ir/secure/api/v40/finalreporttemplates',

        initialize : function() {
            if (this.attributes.sections && !(this.attributes.sections instanceof FinalReportSectionCollection)) {
                this.attributes.sections = new FinalReportSectionCollection(this.attributes.sections);
            }
        },

        validations: {
            nameShort: function(attrs) {
                return NameValidation.tooShort(attrs.name);
            },

            nameLong: function(attrs) {
                return NameValidation.tooLong(attrs.name);
            },

            nameContent: function(attrs) {
                return NameValidation.badChar(attrs.name);
            }
        },

        parse : function(response) {
            response.sections = new FinalReportSectionCollection(response.sections);
            return response;
        },

        getPrimaryAction: function() {
            var allActions = this.get('actions');
            if (_.contains(allActions, EDIT_ACTION)) {
                return EDIT_ACTION;
            } else {
                return null;
            }
        }
    });

    return FinalReportTemplate;
});
