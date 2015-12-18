/*global define:false*/
define([ 'underscore', 'backbone', 'models/annotationSource' ], function(_, Backbone, AnnotationSource) {

	"use strict";

	var AnnotationSourceCollection = Backbone.Collection.extend({
		model : AnnotationSource,

        url: '/ir/secure/api/annotationSourceSet/findAll',

        findByType: function(type) {
            if (!type) {
                return null;
            }
            return _.filter(this.models, function(source) {
                return source.get("type").id === type.id;
            });
        },

        fetch : function(options) {
            return Backbone.Collection.prototype.fetch.call(this, _.extend(options || {}, {
                contentType: 'application/json'
            }));
        },
        comparator: function (m) {
            return m.get("name");
        }
	});

	return AnnotationSourceCollection;
});