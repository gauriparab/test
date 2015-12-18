/*global define:false */
define([ 'jquery', 'underscore', 'views/common/confirmModalView', 'hb!templates/admin/confirm-reject-user.html' ],
	function($, _, ConfirmModalView, bodyTemplate) {
		'use strict';
	
		/**
		 * A reject user confirmation dialog
		 * 
		 * @type {*}
		 */
		var ConfirmRejectModalView = ConfirmModalView.extend({
            
            _options: {
                bodyTemplate : bodyTemplate,
                headerKey : 'confirm.reject.title'
            }
		});
	
		return ConfirmRejectModalView;
	});