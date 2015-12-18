/*global define:false*/
define(['underscore', 'backbone'], function(_, Backbone) {

	"use strict";
	var AnnotationSourceType = Backbone.Model.extend({

        idAttribute: "name",

        _acceptableFileTypes: {
            'GENOMIC_REGIONS': /^.*\.(bed)$/i,
            'GENESET':  /^.*\.(txt)$/i,
            'VARIANTDB': /^.*\.(vcf|bcf|vcf.gz|bcf.gz)$/i,
            'PREFERRED_TRANSCRIPT_SET': /^.*\.(tsv)$/i,
        },
        
        isFileBased: function() {
            if (this.get("mutable")) {
                return true;
            } else {
                return false;
            }
        },

        isFileTypeAccepted: function(fileName) {
            var sourceType = this.get('name');
            var sourceTypeExp = this._acceptableFileTypes[sourceType];

            return !this.isFileBased() || 
                (sourceTypeExp === undefined || sourceTypeExp.test(fileName));
        },
        
        fetch: function(options) {
            return Backbone.Model.prototype.fetch.call(this, _.extend(options || {}, {
                contentType: 'application/json'
            }));
        }

	});

    return AnnotationSourceType;
});