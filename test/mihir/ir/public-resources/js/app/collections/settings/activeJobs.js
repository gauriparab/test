/*global define:false*/
define([ 'collections/BaseCollection'], 
function(
		BaseCollection) {
	'use strict';
	
	var ActiveJobs = BaseCollection.extend({
		
		url: '/ir/secure/api/settings/getActiveJobDetails'
	});
	return ActiveJobs;
});
