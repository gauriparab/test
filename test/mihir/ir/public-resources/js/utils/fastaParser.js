/*global define:false*/
define(['jquery'], function($) {

    "use strict";

    var FastaParser = function() {
    };

    FastaParser.prototype.parse = function(content) {
        var parserState = {
            state : 'EXPECT_DEFLINE',
            lineNo : 1,
            sequences : [],
            errors : undefined,
            _addError : function(error) {
                if (!this.errors) {
                    this.errors = [];
                }
                this.errors.push("Line " + this.lineNo + ": " + error); 
            },
            _addNewSequence : function(defline, sequence) {
                this.sequences.push({
                    name : defline,
                    sequence : sequence
                });
            },
            _appendToCurrentFastaEntry : function(seq) {
                var currentFastaEntry = this.sequences[this.sequences.length - 1];
                if (currentFastaEntry.sequence) {
                    currentFastaEntry.sequence += seq;
                } else {
                    currentFastaEntry.sequence = seq;
                }
            },
            _isLastDeflineValid : function() {
                return this.sequences.length > 0 && this.sequences[this.sequences.length - 1].name.charAt(0) === '>';
            }
        };
        var contentToParse = content || ''; 
        var lines = contentToParse.split("\n");
        $.each(lines, function(index, line) {
            parserState.lineNo = index + 1;
            var trimmedLine = $.trim(line);
            if (trimmedLine !== '') {
                nextLine(trimmedLine, parserState);
            }
        });
        if (parserState.state === 'EXPECT_SEQUENCE' && parserState._isLastDeflineValid()) {
            parserState._addError("Sequence expected");
        }
        return parserState;
    };

    var nextLine = function(line, parserState) {
        if (parserState.state === 'EXPECT_DEFLINE') {
            readDefline(line, parserState);
        } else if (parserState.state === 'EXPECT_SEQUENCE') {
            readSequence(line, parserState);
        } else if (line.charAt(0) === '>') {
            readDefline(line, parserState);
        } else {
            readSequence(line, parserState);
        }
    };

    var readDefline = function(line, parserState) {
        if (line.charAt(0) !== '>') {
            parserState._addError("Invalid defline");
        }
        parserState._addNewSequence(line);
        parserState.state = 'EXPECT_SEQUENCE';
    };

    var readSequence = function(line, parserState) {
        if (!/^[ACGTURYSWKMBDHVN]+$/.test(line.toUpperCase())) {
            if (parserState.state === 'EXPECT_SEQUENCE' && line.charAt(0) === '>') {
                parserState._addError("Sequence expected after defline");
                readDefline(line, parserState);
                return;
            } else {
                parserState._addError("A non-standard IUPAC base was identified. Please correct your sequence information and continue");
            }
        }
        parserState._appendToCurrentFastaEntry(line);
        parserState.state = '';
    };

    return FastaParser;
});