/*global define:false*/
/*jshint unused:false*/
define(['jquery', 'underscore', 'kendo', 'backbone'],
    function($, _, kendo, Backbone) {
        'use strict';

        var KendoTreeView = Backbone.View.extend({

            initialize: function() {
                var self = this;

                this.dataSourceConfig = {
                    type : 'json',
                    transport : {
                        read: function(options) {
                            $.ajax({
                                url: self._url,
                                type: 'GET',
                                contentType: 'application/json',
                                success: function(resp) {
                                    resp = self._parseResponse(resp);
                                    options.success(resp);
                                },
                                error: options.error
                            });
                        }
                    },
                    schema: {
                        model: {
                            id: 'id',
                            children: this._childrenField || 'items'
                        }
                    }
                };

                this.treeConfig = {
                    dataTextField: this._dataTextField || 'text',
                    select: function(e) {
                        var tree = self.$el.data('kendoTreeView');
                        self._onSelect(tree.dataItem(e.node));
                    },
                    dataBound: function(e) {
                        var tree = self.$el.data('kendoTreeView');
                        self._onDataBound(tree, e.node && tree.dataItem(e.node));
                    }
                };
            },

            render: function() {
                this.$el.kendoTreeView($.extend({}, this.treeConfig, {
                    dataSource: kendo.data.HierarchicalDataSource.create(this.dataSourceConfig)
                }));
                return this;
            },

            selectItem: function(index) {
                var tree = this.$el.data('kendoTreeView');
                if (tree) {
                    var selector = '.k-item:eq('+index+')';
                    tree.select(selector);
                    var node = tree.dataItem(this.$(selector));
                    if (node) {
                        this._onSelect(node);
                    }
                }
            },

            // path is a hierarchical array of node text (0->topmost)
            expandAndSelect: function(path) {
                this._withTree(function(tree, path) {
                    var $node,
                        $root = this.$el.find('.k-item:first'),
                        id = [];
                    while (path.length) {
                        var name = path.shift(),
                            $child = ($node || this.$el).find('.k-item:has(.k-in:contains(' + name + '))');

                        id.push(name);

                        if (!$child.length) {
                            $child = tree.append({
                                id: '/'+id.join('/'),
                                name: name,
                                leaf: !path.length
                            }, ($node || $root));
                        }

                        if (path.length) {
                            tree.expand($child);
                        }

                        $node = $child;
                    }
                    tree.select($node);
                    this._onSelect(tree.dataItem(this.$($node)));
                }, path);
            },

            _withTree: function(fn) {
                var tree = this.$el.data('kendoTreeView'),
                    args = [].slice.call(arguments, 1);
                if (tree) {
                    fn.apply(this, [tree].concat(args));
                }
            },

            _parseResponse: function(resp) {
                return resp;
            },

            _onSelect: function(node) {
                if (node) {
                    var model = new this._model(node);
                    this.trigger('select', model);
                }
            },

            _onDataBound: function(tree) {
                this.trigger('dataBound', tree);
            }

        });

        return KendoTreeView;
    }
);

