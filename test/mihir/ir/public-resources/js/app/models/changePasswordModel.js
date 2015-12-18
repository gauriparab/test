/*global define:false*/
define([
    'jquery',
    'underscore',
    'i18n',
    'models/baseModel'
],
    function ($,
              _,
              i18n,
              BaseModel) {
        'use strict';

        var ChangePasswordModel = BaseModel.extend({

            urlRoot: '/ir/secure/userPassword',

            defaults: {
                existingPassword: "",
                newPassword: "",
                retypedNewPassword: ""
            },
     
            fetch: function () {
                throw 'You cannot fetch a change password model from the server';
            },

            save: function (attrs, options) {
                options = _.extend(options || {}, {
                    url: this.urlRoot + '/change'
                });
                return BaseModel.prototype.save.call(this, attrs, options);
            },

            _createError: function (fieldName, errorText) {
                return {
                    field: fieldName,
                    message: errorText
                };
            }

        });

        return ChangePasswordModel;
    });
