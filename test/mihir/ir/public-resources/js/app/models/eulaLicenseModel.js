/*global define:false*/
define([
	'jquery',
	'underscore',
	'backbone'
], function($, _, Backbone) {

	'use strict';

	var EULAModel = Backbone.Model.extend({
		/**
		 * Model URL
		 * @returns {string}
		 */
		url : '/ir/secure/eulaLicence/license/download'
	});

	return EULAModel;
});
