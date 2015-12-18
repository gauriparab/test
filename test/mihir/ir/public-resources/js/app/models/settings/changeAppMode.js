/*global define:false*/
define(['backbone'], function (Backbone) {
	"use strict";
	var urls = {
			get:'/ir/secure/api/settings/getServerMode',
			set:'/ir/secure/api/user/changeMode?mode='
	}
	var ChangeAppMode = Backbone.Model.extend({
		initialize: function(options){
			this.url = urls[options.type];
			
			if(options.type === 'set'){
				this.url += options.mode;
			}
		}
	});
	return ChangeAppMode;
});