/*global define:false */
// hbtemplate.js plugin for requirejs / text.js
// it loads and compiles Handlebars templates
// see: http://stackoverflow.com/a/11061975
define(['handlebars', 'handlebarHelper'], function (Handlebars) {
	"use strict";
    var loadResource = function (resourceName, parentRequire, callback) {
        parentRequire([("text!" + resourceName)],
            function (templateContent) {
                var template = Handlebars.compile(templateContent);
                callback(template);
            }
        );
    };

    return {
        pluginBuilder: './hbtemplateBuilder',
        load: loadResource
    };

});