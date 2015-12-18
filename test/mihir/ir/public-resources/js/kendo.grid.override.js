/* global define:false */
define([ 'jquery', 'domready', 'kendo' ], function($, domReady, kendo) {
	"use strict";
	var initialize = function() {
		domReady(function() {
			kendo.notify = function(kendoGridObject) {
				var kendoGridObjectName = "#" + kendoGridObject.element.attr('id');

				kendoGridObject.bind("dataBound", function(e) {
					var _kendoGridObject = e.sender;
					kendoGridObjectName = "#" + e.sender.element.attr('id');
					if (_kendoGridObject) {
						if (_kendoGridObject.options.scrollable) {
							// TS-5226: dropdown not visible if there
							// are
							// less than 3
							// entries in the scrollable table
							var rowCount = $(_kendoGridObject.tbody).find('tr:visible').length;
							if (rowCount > 2) {
								$(_kendoGridObject.tbody).find('tr:last').prev('tr').andSelf().find('.btn-group')
										.addClass('dropup');
							}

						}
						/*
						 * TS-4938: dropdowns not visible within any k-grid due
						 * to k-grid td overflow being hidden td:last-child CSS
						 * selector does not work in IE <9 therefore we have to
						 * manually set overflow:visible any k-grid instances
						 * containing a .dropdown-menu class
						 */
						$(_kendoGridObject.tbody).find('.dropdown-menu').parents('td').css({
							overflow : 'visible'
						});
					}
				});
			};
		});
	};
	return {
		initialize : initialize
	};
});
