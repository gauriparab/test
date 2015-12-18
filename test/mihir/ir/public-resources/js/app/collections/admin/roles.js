/*global define:false*/
define(['backbone', 'models/admin/role'], function (Backbone, Role) {
    'use strict';
    var Roles = Backbone.Collection.extend({
        model: Role,
        url: '/ir/secure/api/user/allRoles'
    });
    return Roles;
});
