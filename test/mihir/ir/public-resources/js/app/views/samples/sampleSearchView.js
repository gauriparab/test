/*global define:false */
define(['jquery', 'underscore', 'kendo', 'backbone', 'hb!templates/sample/search-sample.html'],
    function($, _, kendo, Backbone, template) {
        'use strict';

        /**
         * A search widget
         *
         * @type {*}
         */
        var SearchView = Backbone.View.extend({

            valid: /(^$)|(^[A-Za-z0-9_. " ' \-:]{1,256}$)/,

            template: template,

            events: {
                'click button[type=submit]': '_onSearch',
                'keyup input[type=text]': '_onKeyUp'
            },

            /**
             * Take the ID and validation regex as parameters
             *
             * @param options
             */
            initialize: function(options) {
                _.extend(this, _.pick(options || {}, ['valid', 'template']));
            },

            render: function() {
                    this.$el.html(this.template());
                    this.startDate = $("#startDate").kendoDatePicker({
                        parseFormats: ["YYYY-MM-DD"]
                    }).data("kendoDatePicker");
                    this.endDate = $("#endDate").kendoDatePicker({
                        parseFormats: ["YYYY-MM-DD"]
                    }).data("kendoDatePicker");
                    $(".k-datepicker").find('span').find('input').attr("readonly", "readonly");
                    $("#startDate").parent().parent().hide();
                    $("#endDate").parent().parent().hide();
                    this.$queryField = this.$('input[type=text]');
                    return this;
                },

            /**
             * Fire a search event if the current query is valid
             *
             * @param e
             * @private
             */
            _onSearch: function(e) {
                e.preventDefault();
                var filter = $("#filterCondition").val();
                var query = this.$queryField.val() ? this.$queryField.val().trim() : null;
                var sDate = this.startDate.value() ? kendo.toString(this.startDate.value(), "u") : null;
                var eDate = this.endDate.value() ? kendo.toString(this.endDate.value(), "u") : null;
                //if (this.valid.test(query)) {
                    // trim at first non-alphanumeric character
                    var data = [];
                    if(null !== query || null !== sDate || null !== eDate){
                        if(filter !== "createdOn"){
                            var qur =  query ? filter+"="+query :"";
                            data.push(qur);
                        }
                        var d1 = sDate ? "startDate="+sDate :null;
                        if(d1){
            				data.push(d1);
            			}
                        var d2 = eDate ? "endDate="+eDate :null;
                        if(d2){
            				data.push(d2);
            			}
                    }
                    this.trigger('search',(data.length ? data : ""));
                //}
            },

            /**
             * Highlight search box in red for invalid queries
             *
             */
            _onKeyUp: function() {
                var query = this.$queryField.val().trim();
                if (this.valid.test(query)) {
                    this.$('.control-group').removeClass('error');
                } else {
                    this.$('.control-group').addClass('error');
                }
            }

        });

        return SearchView;
    }
);
