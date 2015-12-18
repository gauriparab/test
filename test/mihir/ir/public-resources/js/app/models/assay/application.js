define(['models/baseModel'], function(BaseModel){
	'use strict';
	
	var Application = BaseModel.extend({		
		url: function(){
			return "/ir/secure/api/assay/getTemplateAssay";
		}
	});
	
	return Application;
});