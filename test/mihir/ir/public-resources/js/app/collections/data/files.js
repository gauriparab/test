/*global define:false*/
define([ 'backbone', 
         'models/data/files' ], 
function(
		Backbone, 
		FilesModel) {
	'use strict';
	
	var Files = Backbone.Collection.extend({
		model: FilesModel,
		
		urlRoot : '/ir/secure/api/data/fileLocation',

		initialize : function(options) {
			this.id = options.id;
		},
		
		url : function() {
			return this.urlRoot + "?resultId=" + this.id;
		}
	});
	return Files;
});
