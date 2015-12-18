/*global define:false*/
define(['collections/plugins'], function(BasePluginsCollection) {
    'use strict';

    var VariantsPlugins = BasePluginsCollection.extend({
        initialize: function(models, options) {
            options = options || {};
            this._analysisId = options.analysisId;
        },
        url: function() {
            return '/ir/secure/api/v40/analysis/' + this._analysisId + '/plugins';
        }
    });

    return VariantsPlugins;
});