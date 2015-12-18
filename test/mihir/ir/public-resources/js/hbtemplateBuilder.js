/*global define:false */
(function () {
    "use strict";
	define({
		load: function (name, req, load) {
			req([("text!" + name)], function (value) {
				load(value);
			});
		}
	});
}());