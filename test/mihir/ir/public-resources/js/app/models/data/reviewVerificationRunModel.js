/*global define:false*/
define([ 'underscore', 'models/baseModel' ], function(_, BaseModel) {

	'use strict';

	var TemplatePrep = BaseModel.extend({
		
		url : "/ir/secure/api/installTemplate/",
		
		initialize: function(options) {
			this.url += options.url;
		}
	});

	return TemplatePrep;

});
