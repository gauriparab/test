/*global define:false*/
define(['jquery', 'models/baseModel'], function ($, BaseModel) {
    "use strict";

    var RequestAccount = BaseModel.extend({

        validations: {
            organizationName: function(attrs) {
                if (!attrs.organizationName || !attrs.organizationName.match(/(^[a-zA-Z0-9-'. ]{1,256}$)/)) {
                    return {
                        field: 'organizationName',
                        code: 'request.account.organizationName.invalid'
                    };
                }
            },
            organizationAddress: function(attrs) {
                if (!attrs.organizationAddress) {
                    return {
                        field: 'organizationAddress',
                        code: 'request.account.organizationAddress.invalid'
                    };
                }
            },
            firstName: function(attrs) {
                if (!attrs.firstName || !attrs.firstName.match(/(^[\w \-',\.]{1,256}$)/)) {
                    return {
                        field: 'firstName',
                        code: 'request.account.firstName.invalid'
                    };
                }
            },
            lastName: function(attrs) {
                if (!attrs.lastName || !attrs.lastName.match(/(^[\w \-',\.]{1,256}$)/)) {
                    return {
                        field: 'lastName',
                        code: 'request.account.lastName.invalid'
                    };
                }
            },
            email: function(attrs) {
                //from: http://www.regular-expressions.info/email.html but modified to supported TLDs of up to 22 characters, see http://data.iana.org/TLD/tlds-alpha-by-domain.txt
                if (!attrs.email || !attrs.email.match(/\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,22}\b/)) {
                    return {
                        field: 'email',
                        code: 'request.account.email.invalid'
                    };
                }
            }
        },

        requestAccount: function(params, success, error) {
            if (params.organizationCountry) {
                params.organizationCountry = {
                    name: params.organizationCountry
                };
            }
            params.recaptchaChallengeField = params.recaptcha_challenge_field;
            params.recaptchaResponseField = params.recaptcha_response_field;
            delete params.recaptcha_challenge_field;
            delete params.recaptcha_response_field;
            $.ajax({
                type: 'POST',
                url: 'requestAccount',
                contentType: 'application/json',
                data: JSON.stringify(params),
                success: success,
                error: error
            });
        },

        getCountries: function(success) {
            $.ajax({
                type: 'GET',
                url: 'requestAccount/countries',
                success: success
            });
        }

    });
    return RequestAccount;
});
