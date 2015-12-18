/*global define:false*/
define([ 'collections/BaseCollection', 'models/dataType' ], function(BaseCollection, DataType) {

    "use strict";

    var DataTypes = BaseCollection.extend({
        model: DataType,
        url: '/ir/secure/api/attributes/allAttributeDataTypes',
    });

    return DataTypes;
});