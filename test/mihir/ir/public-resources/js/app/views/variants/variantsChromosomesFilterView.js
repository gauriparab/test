/* global define:false */
define(['jquery',
    'underscore',
    'views/templateView',
    'events/eventDispatcher',
    'hb!templates/variants/variants-chromosomes-filtering.html',
    'hb!templates/options.html'].concat('bootstrap.select'),
    function($,
            _,
            TemplateView,
            dispatcher,
            Template,
            OptionsTemplate) {
    'use strict';

    var ChromosomesFilterView = TemplateView.extend({

        initialize: function(options) {
            this.analyses = options.analyses;
            this.variantsSearchContext = options.variantsSearchContext;
        },
        
        events: {
        	'change #chromsomes-filter': '_updateChromosome'
        },

        render: function() {
        	var chromosomes=[{"name":"All"},{"name":"1"},{"name":"2"},{"name":"3"},{"name":"4"},{"name":"5"},{"name":"6"},{"name":"7"},{"name":"8"},{"name":"9"},{"name":"10"},{"name":"11"},{"name":"12"},{"name":"13"},{"name":"14"},{"name":"15"},{"name":"16"},{"name":"17"},{"name":"18"},{"name":"19"},{"name":"20"},{"name":"21"},{"name":"22"},{"name":"X"}];
        	//this.analyses.getChromosomes(_.bind(function(chromosomes) {
        		this.$el.html(Template({
        			chromosomes:chromosomes,
        			selectedChromosome: this.variantsSearchContext._chromosome
        		}));
        	//}, this));
        },

        _updateChromosome: function() {
            var chromosome = this.$('#chromsomes-filter').val();
            this.variantsSearchContext.setChromosome(chromosome);
            dispatcher.trigger('variants:countChanged');
        }

    });
    return ChromosomesFilterView;
});