/*global define:false*/
define(['jquery', 'underscore', 'data/workflow', 'views/ParentView', 'views/metagenomicRef',
        'views/common/bannersView', 'collections/metagenomicReferences', 'models/metagenomicRef', 'events/eventDispatcher', 'hb!templates/workflow-reference.html'],
        function($, _, Constants, ParentView, ReferenceGenomesView, BannerView, ReferenceGenomesCollection, MetagenomicRef, dispatcher, template) {
    "use strict";
            
    var ReferenceView = ParentView.extend({
        initialize: function() {
            this.referenceGenomes = new ReferenceGenomesCollection({
            	applicationType: this.model.getApplicationType()
            });
            this.referenceGenomeView = new ReferenceGenomesView({
                collection: this.referenceGenomes,
                model: this.model
            });
            this.modelFragement = new MetagenomicRef();
	        dispatcher.on('change:metagenomicReference', this._referenceChanged, this)
        },
        
        delegateEvents: function() {
            ParentView.prototype.delegateEvents.apply(this, arguments);
            this.listenTo(this.referenceGenomes, 'sync', this.selectSingle);
        },
        
        undelegateEvents: function() {
            this.stopListening(this.model);
            this.stopListening(this.referenceGenomes);
            ParentView.prototype.undelegateEvents.apply(this, arguments);
        },

        render: function() {
            var referenceGenomePromise = this.referenceGenomes.fetch();
            var combinedRequest = $.when(referenceGenomePromise);

            combinedRequest.done(_.bind(this._renderReferenceGenomes, this));

            return this;
        },

        _renderReferenceGenomes: function() {
            this.$el.html(template({}));
            this.renderSubView(this.referenceGenomeView, "#referenceDiv");
        },

        selectSingle : function() {
            if (this.referenceGenomes.length === 1) {
                // if the references are already set to the same genome
                // then there is no need to update and trigger a change event
                var existing = this.model.getMetagenomicRef();
                if (!existing || existing.models[0].id !== this.referenceGenomes.models[0].id) {
                    this.model.setMetagenomicRef(this.referenceGenomes.toJSON());
                    this.modelFragement.setReference(this.referenceGenomes.toJSON());
                }
            }
        },
        
        _referenceChanged : function(referenceGenomes) {
        	this.modelFragement.setReference(referenceGenomes);
        },

        _createBannerViewWithMessage: function (messageKey) {
            return new BannerView({
                id: 'success-banner',
                container: $('.main-content>.container-fluid'),
                style: 'success',
                title: $.t(messageKey)
            });
        }

    });

    return ReferenceView;
});