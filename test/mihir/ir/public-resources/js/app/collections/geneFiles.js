/*global define:false*/
define([
        'collections/BaseCollection',
        'models/geneFile'
       ],
function(BaseCollection, GeneFile) {
	"use strict";
	var GeneFiles = BaseCollection.extend({
		model : GeneFile,
  		url : '/ir/secure/api/assay/getGeneFiles'
	});

	return GeneFiles;
});
