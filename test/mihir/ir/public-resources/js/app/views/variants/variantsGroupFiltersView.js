/* global define:false */
define(['jquery', 'underscore', 'backbone',
        'hb!templates/variants/variants-group-filter.html',
        'hb!templates/variants/variants-group-filters.html' ], 
        function($, _, Backbone, GroupFilterTemplate, GroupFiltersTemplate) {
    'use strict';
    
    /**
     * View component that displays the variant groups and their associated variant
     * counts.  When a group is clicked the search context is updated and other views 
     * will update themselves.
     */
    var VariantsGroupFiltersView = Backbone.View.extend({

        _displayLink: true,

        events: {
            'click a': '_changeGroup'
        },

        initialize: function(options) {
            this.analyses = options.analyses;
            this.searchContext = options.searchContext;
            this.resultsSummary = options.resultsSummary;
            this.variantsCount= options.variantsCount;
            //update the group counts whenever we get a new results summary
            this.listenTo(this.resultsSummary, 'change', this.render, this);
        },

        render: function() {
            this.$el.html(GroupFiltersTemplate(this._makeViewModel()));
            return this;
        },
        
        // dynamically determine which groups to be shown
        // the hash returned is uses group as key and the name of the field that holds the 
        // total count as the value
        _showGroups: function() {
            var groups = { 
                DEFAULT: 'totalVariantsFilteredIn'        
            };
            //if (this.analyses.displayTotalVariantsHidden()) {
                //groups.HIDDEN = 'totalVariantsHidden';
            //}
            //if (this.analyses.displayTotalVariantsFilteredOut()) {
                groups.FILTEREDOUT ='totalVariantsFilteredOut';
            //}
            return groups;
        },

        _makeViewModel: function() {
            // create an array of the groups that should be shown and stick it in the model
            // each group will have a name and a total count
        	var self=this;
            return {
                groupTemplate: GroupFilterTemplate,
                displayLink: this._displayLink,
                groups: _.map(this._showGroups(), function(groupTotalField, group) {
                	var variantsCount;
                	if(group == 'DEFAULT')
                		variantsCount=self.variantsCount.filterInCount;
                	//else if(group == 'HIDDEN')
                	//	variantsCount=self.variantsCount.filterHiddenCount;
                	else 
                		variantsCount=self.variantsCount.filterOutCount;
                    return {
                        currentGroup: this.searchContext.get('group'),
                        group: group,
                        //groupTotal: this.resultsSummary.get(groupTotalField)
                        groupTotal: variantsCount
                    };
                }, this)
            };
        },
        
        _changeGroup: function(e) {
            e.preventDefault();
            var group = $(e.target).attr('role');
            this.searchContext.setGroup(group);
            this.render();
        }
    });
     
    return VariantsGroupFiltersView;
});
