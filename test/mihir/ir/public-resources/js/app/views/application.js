/*global define:false*/
define(['views/ParentView', 
        'views/common/bannersView', 
        'events/eventDispatcher', 
        'views/applicationTypes',
        'models/assay/application',
        'hb!templates/application.html'],
    function(ParentView, 
    		BannerView, 
    		dispatcher, 
    		ApplicationTypesView,
    		Application,
    		template) {
        "use strict";
        var ApplicationView = ParentView.extend({
            initialize: function() {
                dispatcher.on('change:applicationType', this.applicationTypeChanged, this);
               // dispatcher.on('change:version', this.versionChanged, this);
                this._applicationTypeCollectionView = new ApplicationTypesView({
                    collection: this.options.options.assayTypes,
                    model: this.model
                });
//                this._versionCollectionView = new VersionCollectionView({
//                    collection: this.options.options.versions,
//                    model: this.model
//                });
                this.modelFragement = new Application();
                //this.modelFragement.set("applicationType", this.model.getApplicationType());
				var assayTypes = this.options.options.assayTypes.models;
				var applicationType = this.model.getApplicationType();
				var versionData = $.grep(assayTypes, function(item, index) {
					return item.get("identifier") === applicationType ? item : ""; 
				});
				if(versionData[0].toJSON().name = 'DNA Germline Default Assay'){
					this.model.set("currentAssayTypeName",versionData[0].toJSON().name);
				}
				var version = {};
                version.id = versionData[0].get('versions')[0].id;
                //this.modelFragement.set("applicationVersion",version);
                if(this.model.get("id")){
                	this.modelFragement.set("assayId", this.model.get("id"));
                }
            },

            render: function() {
                this.$el.html(template);
                this.renderSubView(this._applicationTypeCollectionView, "div.applicationTypes");
               // this.renderSubView(this._versionCollectionView, "div.versions");
                return this;
            },

            applicationTypeChanged: function(applicationType) {
                var currentApplicationType = this.model.getApplicationType();
                var version = this.model.get('version');
                this.model.clear({silent:true});
                if (!currentApplicationType || applicationType.get('identifier') !== currentApplicationType) {
                	this.model.setApplicationType(applicationType.get("identifier"));
                } else {
                	this.model.setApplicationType(currentApplicationType);
                }
                this.modelFragement.set("applicationType", this.model.getApplicationType());
                for (var attrname in this.options.originalModel.toJSON()) { 
                	this.model.set(attrname, this.options.originalModel.toJSON()[attrname]); 
                }
                this.model.set('appTypeVersion',applicationType.toJSON().identifier);
    			this.model.set('applicationTitle', applicationType.toJSON().title);
                this.model.setVersion(version);
                this.model.set("currentAssayTypeName",applicationType.toJSON().name);
                this.modelFragement.set('currentVersion',version);
                this.modelFragement.set("currentAssayTypeName",applicationType.toJSON().name);
                this.modelFragement.set("applicationVersion", version);
            }
            
        });

        return ApplicationView;
    });
