/*global define:false*/
define([ 'underscore', 'backbone', 'models/annotationSourceType' ], function(_, Backbone, AnnotationSourceType) {

	"use strict";

	var AnnotationSourceTypeCollection = Backbone.Collection.extend({
		model : AnnotationSourceType,

		url : '/ir/secure/api/annotationSourceSet/list',

        initialize : function() {
            this.selected = new AnnotationSourceType();
        },

        fetch: function(options) {
            return Backbone.Collection.prototype.fetch.call(this, _.extend(options || {}, {
                contentType: 'application/json'
            }));
        }
        
	});

	return AnnotationSourceTypeCollection;
});