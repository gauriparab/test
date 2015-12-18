/*global define:false*/
define(['jquery', 'underscore', 'backbone', 'models/admin/userModel', 'views/admin/manageUserView', 'views/errorsView'],
		function($, _, Backbone, UserModel, ManageUserView, ErrorsView) {
	"use strict";

	var AcceptUserView = ManageUserView.extend({
		initialize : function(options) {
			options = options || {};
            this._allowedUserStates = null;

            this._errorsView = new ErrorsView({
                model: this.model
            });
            
			ManageUserView.prototype.initializeModel.call(this, options); 
			this.manageAction = "Accept";
			this.model.fetch({
				contentType: 'application/json;charset=UTF-8',
				success: _.bind(this._fetchSuccessful, this)
			});
		},

		_fetchSuccessful: function() {
			this.render();
		},

		_save : function() {
			var validationResult = this.model.validate();
			if (!validationResult) {
				this.model.accept({
					error : _.bind(this.onSaveError, this),
					success : _.bind(this._onSaveSuccess, this)
				});
			} else {
				this._onValidationFailure(validationResult);
			}
		}

	});

	return AcceptUserView;
});