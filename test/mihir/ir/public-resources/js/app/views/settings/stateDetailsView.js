/* global define:false*/
define([ 'views/ParentView',
		'hb!templates/settings/state-details.html'],

		function(ParentView,
				template) {

			'use strict';

			
			var StateDetailsView = ParentView.extend({
						
				el: ".main-content",
				 
				_template : template,
				

				initialize : function(options) {
					this.fileName=options.fileName;
					this.filePath=options.filePath;
				},


				render : function() {
								this.$el.html(this._template({
                                            fileName: this.fileName,
                                            path: this.filePath
                                }));
					   
					
				}

			});

			return StateDetailsView;
		});
		
