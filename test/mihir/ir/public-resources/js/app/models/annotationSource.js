/*global define:false*/
define(['underscore','backbone','models/annotationSourceType'], function(_, Backbone, AnnotationSourceType) {

	"use strict";
	var AnnotationSource = Backbone.Model.extend({
		urlRoot : '/ir/secure/api/v40/annotationsources',

        usable: true,
        
        initialize: function() {
            if (this.attributes.type && !(this.attributes.type instanceof AnnotationSourceType)) {
                this.attributes.type = new AnnotationSourceType(this.attributes.type);
            }
        },

        fetch : function(options) {
            return Backbone.Model.prototype.fetch.call(this, _.extend(options || {}, {
                contentType: 'application/json'
            }));
        },

        parse : function(response) {
            response.type = new AnnotationSourceType(response.type);
            return response;
        }
	});

    return AnnotationSource;
});