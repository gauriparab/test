/*global define:false*/
define([ 'collections/BaseCollection', 'models/genericRef' ], function(BaseCollection,
		ReferenceGenome) {
	"use strict";
	var ReferenceGenomes = BaseCollection.extend({
		model : ReferenceGenome,
		url: '/ir/secure/api/assay/getReferenceFiles',
		
		initialize: function(options){
			if(options){
				this.url += "?appType=" + options.applicationType + "&fileType=Genomic Reference";
			}
		}
	});

	return ReferenceGenomes;
});
