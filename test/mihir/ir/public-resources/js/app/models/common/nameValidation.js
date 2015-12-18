/*global define:false*/
define([], function() {
    "use strict";

    var NameValidation = {
        _valid: /^[A-Za-z0-9_\-\. ]+$/,

        tooShort: function(value) {
            if (!value || value.length < 1) {
                return 'name.error.short';
            }
        },

        tooLong: function(value) {
            if (value && value.length > 256) {
                return 'name.error.long';
            }
        },

        badChar: function(value) {
            if (value && !this._valid.test(value)) {
                return 'name.error.content.badchar';
            }
        },

        badCharNoSpace: function(value) {
            if (value) {
                if (!this._valid.test(value) || value.indexOf(' ') > -1 ) {
                    return 'name.error.content.nospace';
                }
            }
        }
    };

    return NameValidation;
});