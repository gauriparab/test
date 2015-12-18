/*global define:false*/

define(['backbone', 'underscore', 'models/finalReportSection'], function(Backbone, _, FinalReportSection) {

    "use strict";
    var SignOffSection = FinalReportSection.extend({
        initialize : function() {
            if (this.attributes.authors && !(this.attributes.authors instanceof Backbone.Collection)) {
                this.attributes.authors = new Backbone.Collection(this.attributes.authors);
            }
        },

        parse : function(response) {
            response.authors = new Backbone.Collection(response.authors);
            return response;
        }
    });

    return SignOffSection;
});