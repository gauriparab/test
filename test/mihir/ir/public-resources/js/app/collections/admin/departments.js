/*global define:false*/
define([ 'underscore', 'backbone', 'models/admin/departmentModel' ], function(_, Backbone, Department) {

    "use strict";

    var Departments = Backbone.Collection.extend({
        model : Department,

        url: '/ir/secure/api/v40/departments',

        getDepartments :function() {
            return this.fetch({
                'dataType' : "json",
                'type' : 'GET',
                'contentType' : 'application/json',
                reset : true
            });
        },

        fetch: function(options) {
            return Backbone.Collection.prototype.fetch.call(this, _.extend(options || {}, {
                contentType: 'application/json'
            }));
        }

    });

    return Departments;
});
