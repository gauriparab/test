/*global define:false*/
define(['underscore', 'views/ParentView'], 
    function(_, ParentView) {

    'use strict';

    var TemplateView = ParentView.extend({
        /**
         * Default rendering.
         */
        render: function() {
            this.$el.html(this.template(_.extend({id: this.model.cid }, 
                _.result(this, 'subTemplates'),
                _.result(this, 'options'),
                this.model.toJSON())));
            return this;
        }

    });

    return TemplateView;
});
