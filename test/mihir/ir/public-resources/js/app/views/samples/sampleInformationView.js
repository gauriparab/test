/*global define:false*/
define([
    'jquery',
    'underscore',
    'backbone',
    'hb!templates/sample/sample-information.html'
],
    function($,
             _,
             Backbone,
             template) {
        'use strict';

        var SampleInformationView = Backbone.View.extend({

            _template: template,

            initialize: function() {
                this.listenTo(this.model, "sync", this.render);
            },

            render: function() {
                // If the sample doesn't have a name yet, it hasn't been synced to the server. Wait for a sync
                // to render so we don't display a weird nonsense view.
                if (this.model.get('name')) {
                    this.$el.html(this._template(this._json()));
                }
            },

            _json: function () {
                var attributes = [];
                attributes.push({
                    name: 'Sample Name',
                    id: 'sampleName',
                    value: this.model.get('name'),
                    imgUrl: 'sample.png'
                });
                this.model.get('attributes').forEach(function (attribute) {
                    attributes.push({
                        name: attribute.get('attribute').get('name'),
                        value: attribute.get('value'),
                        id: attribute.get('attribute').get('id'),
                        imgUrl: this._getImgUrlForName(attribute.get('attribute').get('name'))
                    });
                }, this);
                var metadata = this.model.get('metadata') || {}; // this is null if no metadata is set.
                _.each(metadata, function (value, key) {
                    attributes.push({
                        name: key,
                        value: value,
                        id: this._transformMetadataKeyToId(key) + "_" + this.model.get('id'),
                        imgUrl: this._getImgUrlForName(key)
                    });
                }, this);

                var json = {
                    attributeRows: [
                        {
                            attributes: []
                        }
                    ]
                };
                for (var i = 0; i < 4 && attributes.length > 0; i++) {
                    _.last(json.attributeRows).attributes.push(attributes.shift());
                    if (i === 3 && attributes.length > 0) {
                        i = 0;
                        json.attributeRows.push({
                            attributes: []
                        });
                    }
                }

                return json;
            },

            _getImgUrlForName: function (name) {
                // Many of these names are guesses. If they end up being different when returned from the SL,
                // we may have to change this.
                switch (name.toLowerCase()) {
                case "gender":
                    return 'gender.png';
                case "role":
                case "relationship":
                    return 'annotations.png';
                case "bar code":
                    return 'barcode.png';
                case "chip type":
                case "chip id":
                    return 'three_chip_icon.png';
                case "library preparation":
                    return 'library.png';
                case "device id":
                    return 'pgm.png';
                default:
                    return null;
                }
            },

            _transformMetadataKeyToId: function (key) {
                return key.replace(/[^a-z0-9]/gi, '');
            }


        });

        return SampleInformationView;
    }
);