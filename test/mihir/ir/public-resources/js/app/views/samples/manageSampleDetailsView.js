/*global define:false*/
define([ 'jquery', 'underscore', 'kendo', 'views/templateView',
         'hb!templates/sample/manageSample-details.html',  'hb!templates/sample/sample-files-popover.html'],
         function($, _, kendo, TemplateView, template, sampleFilesPopover) {
	'use strict';

	/**
	 * A view of Sample details
	 *
	 * @type {*}
	 */
	var ManageSampleDetailsView = TemplateView.extend({

		template : template,

        initialize: function() {
            this._oldContent = this.$el.html();
        },

		/**
		 * Render the template inside container. Add a popover on attachments.
		 */
		render : function() {
			var viewModel = this._modelToJSON();
			this.$el.html(this.template(viewModel));
			this.$("#specimenGroup").popover({
                trigger: "hover",
                placement: "top",
                content: sampleFilesPopover(viewModel),
                html: true
            });
            return this;
		},

        destroy: function() {
            this.$el.html(this._oldContent);
            this.stopListening();
            return this;
        },

		/**
		 * Custom analysis serialization for this view.
		 *
		 * @returns {*}
		 * @private
		 */
		_modelToJSON : function() {
			var json = this.model.toJSON();

			return _.defaults(_.extend(json, {
				// fields here that override the default values
				name : json.name && $.t(json.name),
				gender : json.attributeValueMap && json.attributeValueMap.Gender,
				role : (json.metadata && json.metadata.Role) ? json.metadata.Role.toLowerCase() : 'Unknown',
				isLocked : json.status === 'LOCKED',
                customFields : json.attributeValueMap && _.map(_.pairs(_.omit(json.attributeValueMap, 'Gender', 'Role')), function(item) { return {label: item[0], value: item[1]}; }),
                meta : json.metadata && _.map(_.pairs(_.omit(json.metadata, 'Role')), function(item) { return {label: item[0], value: item[1]}; }),
                reportFiles: json.reportFiles && _.map(_.compact(json.reportFiles), function(item) { return _.extend(item, {id: encodeURIComponent(item.id)}); }),
				createdBy : json.createdBy && json.createdBy.lastName + ', '+ json.createdBy.firstName,
				createdOn : json.createdOn && kendo.toString(new Date(Date.parse(json.createdOn)), 'MMM dd yyyy hh:mm tt')

			}), {
				// default values here to apply in case of null
				name : '',
				gender : '',
				role : '',
				createdBy : '',
				createdOn : ''
			});
		}

	});

	return ManageSampleDetailsView;

});
