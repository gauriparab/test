/*global define:false*/
define([ 'backbone', 
         'models/data/signedOffFile' ], 
function(
		Backbone, 
		FileModel) {
	'use strict';
	
	var Files = Backbone.Collection.extend({
		model: FileModel,
		
		urlRoot : '/ir/secure/api/signoff/getFileList',

		initialize : function(options) {
			this.id = options.id;
		},
		
		url : function() {
			return this.urlRoot + "?resultId=" + this.id;
		}
	});
	return Files;
});
