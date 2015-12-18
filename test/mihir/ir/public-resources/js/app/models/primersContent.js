/*global define:false*/
define(['backbone', 'underscore', 'jquery', 'utils/fastaParser'], function(Backbone, _, $, FastaParser) {


    "use strict";

    var PrimersContent = Backbone.Model.extend({
        name : '',
        content : '',

        validate : function(attributes) {
            if (attributes.content && $.trim(attributes.content) !== '') {
                return new FastaParser().parse(attributes.content).errors;
            } 
        },
        
        setNameAndContent : function(name, content) {
            var parserState = new FastaParser().parse(content);
            this.set({
                name: name,
                content: content
            });
            this.trigger('updatePrimers', parserState.sequences);
            if (parserState.errors) {
                var errorsObj = {
                    errors: {
                        allErrors: _.map(parserState.errors, function(error) {
                            return {defaultMessage : error};
                        })
                    }
                };
                this.trigger('displayError', errorsObj);
                $('#nextStep').addClass('disabled');
            }else{
				$('#nextStep').removeClass('disabled');
            }
        },
        
        // build a content string from the sequence array
        setContentFromSequences: function(sequences) {
            if (sequences && sequences.length) {
                var content = _.reduce(sequences, function(memo, sequence) {
                    return memo + sequence.name + '\n' + sequence.sequence + '\n';
                }, '');
                this.setNameAndContent(null, content);
            }
            else {
                this.setNameAndContent(null, '');
            }
        }

    });

    return PrimersContent;
});