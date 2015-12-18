/*global define:false*/
define(['collections/BaseCollection', 'models/data/primer'], function (BaseCollection, Primer) {
    'use strict';
    var Primers = BaseCollection.extend({
        model: Primer,
        url: '/ir/secure/api/assay/getReferenceFiles?appType=METAGENOMICS&fileType=Primer'
    });
    return Primers;
});