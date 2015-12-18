/*global define:false*/
define(['underscore', 'jquery', 'backbone', 'global', 'hb!templates/annotation-set-source.html', 'models/annotationSource',
        'views/annotationSetSourceTypesView', 'views/ParentView', 'hb!templates/error.html'
    ].concat('views/fileUpload') /* enhanced fileupload widget is defined in views/fileupload */,

    function(_, $, Backbone, Global, template, AnnotationSource, AnnotationSetSourceTypesView, ParentView, errorTemplate) {

        "use strict";

        var AnnotationSetSourceView = ParentView.extend({

            initialize: function() {
                this.sources = this.collection || null;
                this.types = this.options.typeCollection || null;
                this.annotationSet = this.model && this.model || null;

                this.listenTo(this.types.selected, 'change', this.render);
                this.listenTo(this.annotationSet.get("sources"), 'add', this.render);
                this.listenTo(this.annotationSet.get("sources"), 'remove', this.render);

                this.annotationSetSourceTypesView = new AnnotationSetSourceTypesView({
                    collection: this.types
                });
            },

            events: {
                'click a.useChoiceBtn': 'addSource',
                'click a#annotationInstanceUpdateBtn': 'addMutableSource',
                'change input.annotation-source-input': 'enableDisableUpdateButton',
                'change #real_deal': '_validateFileType'
            },

            valid: /(^$)|(^[A-Za-z0-9_\- ]{1,256}$)/,

            render: function() {

                var type = this.types.selected;
                var filteredSources = this.sources.findByType(type);
                var mutable = type && type.get("mutable");
                var fileBased = type && type.isFileBased();
                var supportedTypesMsgKey = this._getSupportedTypesMsgKey(type);
                this.updateUsableSources();
                this.$el.html(template({
                    sources: filteredSources,
                    mutable: mutable,
                    fileBased: fileBased,
                    supportedTypesMsgKey : supportedTypesMsgKey
                }));

                // hide create if it's not applicable to the selected type
                if (!type || !mutable) {
                    $('li#annotation-set-source-tab-create').hide();
                }

                this.renderSubView(this.annotationSetSourceTypesView, "#annotation-set-source-types");

                this.enableDisableUpdateButton();
                return this;
            },
            
            _getSupportedTypesMsgKey: function(AnnotationSourceType) {
                return (AnnotationSourceType && AnnotationSourceType.isFileBased() && AnnotationSourceType.get('name')) ? '' + AnnotationSourceType.get('name') + '.upload.supportedTypes' : '';  
            },

            updateUsableSources: function() {

                var selectedSources = this.annotationSet.get("sources");
                if (selectedSources) {
                    this.sources.forEach(function(source) {

                        var type = source.get("type");

                        source.usable = true;

                        if (selectedSources.get(source.id)) {
                            source.usable = false;
                        } else if (selectedSources.length && !type.get("multipleAllowedPerAnnotationSet")) {
                            source.usable = selectedSources.findByType(type).length === 0;
                        }

                    });
                }
            },

            addSource: function(e) {

                e.preventDefault();

                var $currentTarget = $(e.currentTarget);
                if ($currentTarget.hasClass('disabled')) {
                    return;
                }

                var selectedAnnotationSourceId = $currentTarget.data('id');
                var selectedAnnotationSource = this.sources.get(selectedAnnotationSourceId);

                this.annotationSet.get("sources").push(selectedAnnotationSource);
            },

            enableDisableUpdateButton: function() {

                var sourceName = this.$('input#name_field').val();
                var sourceVersion = this.$('input#version_field').val();
                var $doneButton = this.$('#annotationInstanceUpdateBtn');
                var type = this.types.get(this.types.selected.id);

                this.$('input#name_field').parent().toggleClass('error', !this.valid.test(sourceName));

                if (sourceName && sourceVersion && this.valid.test(sourceName)) {
                    if (type.isFileBased() && this._invalidSourceFileType) {
                        $doneButton.addClass("disabled").prop('disabled', 'disabled');
                    } else {
                        $doneButton.removeClass("disabled").removeProp('disabled');
                    }
                } else {
                    $doneButton.addClass("disabled").prop('disabled', 'disabled');
                }

            },

            _showError: function(msg){
                if (msg){
                    this.$el.parent().parent().find('#errors').html(errorTemplate({message:msg}));
                }
            },

            addMutableSource: function(e) {
                e.preventDefault();

                var $currentTarget = $(e.currentTarget);
                if ($currentTarget.hasClass('disabled')) {
                    return;
                }

                var name = this.$('input#name_field').val();
                var type = this.types.get(this.types.selected.id);
                var version = this.$('input#version_field').val();

                // prevent adding new source with the same name+version as an existing source
                if (this.sources.findWhere({name:name,version:version})){
                    this._showError($.t('annotationSet.error.source.exists'));
                    return;
                } else {
                    this.$el.parent().parent().find('#errors > .alert').hide();
                }

                var annotationSource = new AnnotationSource({
                    name: name,
                    type: type,
                    version: version
                });

                if (type.isFileBased()) {
                    var annotationSourceType = '.FileBasedAnnotationSource';
                    var uploadUrl = '/ir/secure/api/annotationSourceSet/upload/annotationSourceFile';
                    if (type.get('name') === 'PREFERRED_TRANSCRIPT_SET') {
                        // use TranscriptionSetAnnotationSource type for custom transcription sets
                        annotationSourceType = '.TranscriptionSetAnnotationSource';
                        uploadUrl = '/ir/secure/api/annotationSourceSet/upload/transcriptionSourceFile';
                    }
                    annotationSource.set('_type', annotationSourceType);

                    var self = this;
                    $('#sourceFile_field').enhancedFileupload({
                        autoUpload: false,
                        url: uploadUrl,
                        progress: function(e, data) {
                            var progress = parseInt(data.loaded / data.total * 100, 10);
                            annotationSource.trigger('fileUploadProgress', progress);
                        },
                        done: function(evt, data) {
                            var result = data.result;
                            if (result.success) {
                                annotationSource.set("id", result.uploadedFile.id);
                                self.sources.push(annotationSource);
                                annotationSource.trigger('fileUploadSuccess');
                            }
                        },
                        fail: function() {
                            annotationSource.trigger('fileUploadError');
                        },
                        always: function() {
                            annotationSource.trigger('fileUploadComplete');
                        }
                    });

                    $('#sourceFile_field').enhancedFileupload('send', {
                        fileInput: $('#real_deal'),
                        dataType: 'json',
                        formData: {
                            'annotationSource._type': annotationSourceType,
                            'annotationSource.name': name,
                            'annotationSource.type': type.get('name'),
                            'annotationSource.version': version,
                            'X-IonReporter-CSRF-Token': Global.csrfToken
                        }
                    });

                } else {
                    this.sources.push(annotationSource);
                }

                this.annotationSet.get('sources').push(annotationSource);

                if (type.isFileBased()) {
                    annotationSource.trigger('fileUploadStart');
                }
            },

            _validateFileType: function(e) {
                var file = e.target.files !== undefined ? 
                        e.target.files[0] : 
                        (e.target.value ? { name: e.target.value.replace(/^.+\\/, '') } : undefined);
                var type = this.types.get(this.types.selected.id);
                if (file && type.isFileTypeAccepted(file.name)) {
                    this._invalidSourceFileType = false;
                } else {
                    this._invalidSourceFileType = true;
                }
                this.$('#invalid-filetype-message').toggle(file !== undefined && this._invalidSourceFileType);
                this.enableDisableUpdateButton();
            }

        });

        return AnnotationSetSourceView;
    });