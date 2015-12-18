/*global define:false */
define([ 'jquery', 'underscore', 'kendo', 'handlebars', 'i18n' ], function($, _, kendo, Handlebars, i18n) {

    'use strict';

    var initialize = function(appcontext, resourcepath) {

    	var _isEmpty = function(obj){
    		if (obj == null) return true;
    	    if (obj.length > 0)    return false;
    	    if (obj.length === 0)  return true;
    	    for (var key in obj) {
    	        if (hasOwnProperty.call(obj, key)) return false;
    	    }
    	}

        Handlebars.registerHelper('img', function(src) {
            return resourcepath + '/img/' + src;
        });

        Handlebars.registerHelper('surl', function() {
            return appcontext + 'secure/' + getParamsFromArgs(arguments).join('');
        });

        function getParamsFromArgs(args) {
            var argsArray = Array.prototype.slice.call(args);

            // HB puts an extra object at the end of the args
            return argsArray.slice(0, argsArray.length - 1);
        }
        
        Handlebars.registerHelper('t', function() {
        	var params = getParamsFromArgs(arguments).join('');
        	var result = params && i18n.t(params) || '';
            return new Handlebars.SafeString(result);
        });

        Handlebars.registerHelper('strcat', function() {
            var params = getParamsFromArgs(arguments).join('');
            var result = params && i18n.t(params) || '';

            return new Handlebars.SafeString(result);
        });

        Handlebars.registerHelper('isObject', function(item, options) {
            if(typeof item === "object") {
            	return options.fn(this);
            } else {
            	return options.inverse(this);
            }
        });

        Handlebars.registerHelper('isNotObject', function(item, options) {
            if(typeof item !== "object") {
            	return options.fn(this);
            } else {
            	return options.inverse(this);
            }
        });

        Handlebars.registerHelper('hasProperty', function(item, key, options) {
          if(item.hasOwnProperty(key)){
            return options.fn(this);
          } else {
            return options.inverse(this);
          }
        });

        Handlebars.registerHelper('parseNumber', function(item, options) {

        	var isValid = parseInt(item);

            if(!isNaN(isValid)) {
            	return options.fn(this);
            } else {
            	return options.inverse(this);
            }
        });

        Handlebars.registerHelper('isNumeric', function(item, options) {
            if(typeof item === "number") {
            	return options.fn(this);
            } else {
            	return options.inverse(this);
            }
        });

        var ifCond = function(v1, operator, v2) {

            switch (operator) {
            case '==':
                return (v1 === v2);
            case '===':
                return (v1 === v2);
            case '!==':
                return (v1 !== v2);
            case '<':
                return (v1 < v2);
            case '<=':
                return (v1 <= v2);
            case '>':
                return (v1 > v2);
            case '>=':
                return (v1 >= v2);
            case 'contains':
                v1 = (_.isString(v1)) ? v1.split(',') : v1;
                return _.contains(v1, v2);
            case '||':
                return v1 || v2;
            case '&&':
                return v1 && v2;
            default:
                return false;
            }
        };

        Handlebars.registerHelper('ifCond', function(v1, operator, v2, options) {
            var result = ifCond(v1, operator, v2);
            return result ? options.fn(this) : options.inverse(this);

        });

        Handlebars.registerHelper('unlessCond', function(v1, operator, v2, options) {
            var result = ifCond(v1, operator, v2);
            return !result ? options.fn(this) : options.inverse(this);
        });



        Handlebars.registerHelper('ifUndefined', function(v1, options) {
            return (_.isUndefined(v1)) ? options.fn(this) : options.inverse(this);
        });

        Handlebars.registerHelper('ifNotUndefined', function(v1, options) {
            return (!_.isUndefined(v1) && !_.isNull(v1)) ? options.fn(this) : options.inverse(this);
        });

        Handlebars.registerHelper('toLower', function(str) {
            return str.toLowerCase();
        });

        Handlebars.registerHelper('toUpper', function(str) {
            return str.toUpperCase();
        });

        Handlebars.registerHelper('toTitleCase', function(str) {
            return str.replace(/\w\S*/g, function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        });

        /**
         * Helper for rendering a subtemplate. Optionally the context used by the template for rendering may be extended
         * from an additional context specified in the third argument with the specific keys provided in arguments
         * starting with the 4th one. The user MUST provide the keys to be imported in the rendering context. If no keys
         * are provided the context will remain as is and will not be extended with any other properties.
         * Note: if the a certain key is available both in the rendering context and in the additional context the one
         * from the rendering context will be overwritten so the caller must be careful in that case.
         */
        Handlebars.registerHelper('sub', function(template) {

            // do not continue if template is undefined
            if (!template) {
                return '';
            }

            var args = Array.prototype.slice.call(arguments, 0, arguments.length-1),
                ctx = args[1],
                parentCtx = args[2],
                parentCtxAttrs = Array.prototype.slice.call(arguments, 3, arguments.length-1),
                templateCtx;
            if (parentCtx) {
                parentCtx = _.pick(parentCtx, parentCtxAttrs) || {};
            }
            templateCtx = _.extend(ctx || this, parentCtx);
            return new Handlebars.SafeString(template(templateCtx));
        });

        Handlebars.registerHelper('safe', function(str) {
            return new Handlebars.SafeString(str);
        });

        Handlebars.registerHelper('round', function(value) {
            return Math.round(value);
        });

        /*
         * Operator that provides an easy way to output a default or a parameter instead of using an if else
         */
        Handlebars.registerHelper('default', function(value1, value2) {
            return new Handlebars.SafeString(value1 || value2);
        });

        /**
         * Helper that iterates over an array and the returned context contains the information
         * regarding whether the current item is the last or the first in the array.
         */
        Handlebars.registerHelper('foreach', function(arr, options) {
            if(options.inverse && !(arr && arr.length)) {
                return options.inverse(this);
            }

            return _.map(arr, function(item, index) {
                item.$index = index;
                item.$isFirst = index === 0;
                item.$isLast = index === arr.length-1;
                return options.fn(item);
            }).join('');
        });

        /**
         * Helper that retrieves the first element from an array value or if the value is a simple object it
         * retrieves the object itself. Optionally if the value is a not a simple type or an array of simple types
         * the property to be retrieved can be specified by the key argument.
         */
        Handlebars.registerHelper('firstValue', function(value, key, options) {
            var validValue = false;
            if (value) {
                if (_.isArray(value)) {
                    validValue = value.length > 0;
                } else {
                    validValue = true;
                }
            }
            if(options.inverse && !validValue) {
                return options.inverse(this);
            }

            if (validValue) {
                if (_.isArray(value)) {
                    return key && value[0] ? value[0][key] : value[0];
                } else {
                    return key ? value[key] : value;
                }
            }
        });

        /**
         * Date formatting helper
         */
        /*Handlebars.registerHelper('date', function(value) {
            return new Handlebars.SafeString(kendo.toString(new Date(Date.parse(value)), 'MMM dd yyyy hh:mm tt'));
        });*/

        Handlebars.registerHelper('dateAndTime', function(value) {
        	var dOB = Handlebars.Utils.escapeExpression(value);
            var arr = dOB.split(' ');
            var date = arr[0];
            var time = arr[1];

            var retVal = '<div>'+date+'</div><div>'+time+'</div>';
            return new Handlebars.SafeString(retVal);

        });

        Handlebars.registerHelper('onlyDate', function(value) {
            var arr = value.split(' ');
            var date = arr[0];
            return date;
        });

        /**
         * Convert list into concatenated string
         *
         * An optional delimiter may be specified by 'delim', defaults to comma
         * An optional property key may be specified by 'key' if the array is not simple
         * An optional property maximum length may be specified by 'maxLength' if you only want at most 'maxLength'
         * items joined while ignoring the rest
         */
        Handlebars.registerHelper('join', function(list, options) {
            if (options.hash.maxLength && _.size(list) > options.hash.maxLength) {
                list = list.slice(0, options.hash.maxLength);
            }
            var str = (options.hash.key ? _.pluck(list, options.hash.key) : list).join(options.hash.delim || ', ');
            return new Handlebars.SafeString(str);
        });

        /**
         * Render list of values as a multi-column table
         *
         * Specify 'cols' as an option, defaults to 2
         * Specify 'class' as optional CSS class(es) for the table
         */
        Handlebars.registerHelper('table', function(context, options) {
            var fn = options.fn,
                i = 0,
                ret = '',
                cols = options.hash.cols || 2,
                klazz = options.hash.class,
                data;

            ret += '<table' + (klazz && ' class="'+klazz+'"') + '><tbody>';

            if (options.data) {
                data = Handlebars.createFrame(options.data);
            }

            for(var j = context.length; i<j; i++) {
                if (data) {
                    data.index = i;
                }
                if (i % cols === 0) {
                    ret += '<tr>';
                }
                ret += '<td>' + fn(context[i], { data: data }) + '</td>';
                if ((i+1) % cols === 0 || (i+1) === j) {
                    ret += '</tr>';
                }
            }

            ret += '</tbody></table>';

            return ret;
        });

        function getApplicationTypeImgName(applicationType) {
            switch (applicationType) {
            case 'DNA':
                return 'analysis-dna.png';
            case 'RNA':
                return 'analysis-rna.png';
            case 'DNA_RNA':
                return 'analysis-dna-rna.png';
            case 'ANNOTATE_VARIANTS':
                return 'analysis-annotation.png';
            case 'ANEUPLOIDY':
                return 'analysis-aneuploidy.png';
            case 'METAGENOMICS':
                return 'analysis-metagenomics.png';
            default:
                return '';
            }
        }

        /**
         * Render application type img tag
         *
         * Specify 'title' as an option
         */
        Handlebars.registerHelper('applicationTypeImg', function(applicationType, options) {
            var ret = '';
            var imgName = getApplicationTypeImgName(applicationType);

            if(imgName) {
                ret += '<img src="' + Handlebars.helpers.img(imgName) + '"';

                if(options.hash.title) {
                    ret += ' title="' + Handlebars.helpers.t(options.hash.title, options) + '"';
                }

                ret += ' style="width:20px;"/>&nbsp;';
            }

            return ret;
        });

        Handlebars.registerHelper('getValue', function(ctx, fieldName) {
            return new Handlebars.SafeString(ctx[fieldName]);
        });
        /**
         * Builds on top of 't' helper to generate a display value based on the arguments.
         * If no value exists, then check if defaultTemplate and defaultLabel were passed in to generate a
         * display value based on them.  Otherwise, check if defaultLabel was passed in and use that for the
         * display value.
         *
         * Specify 'defaultTemplate' as an option
         * Specify 'defaultLabel' as an option
         */
        Handlebars.registerHelper('tMultiOptions', function() {
            var result = Handlebars.helpers.t.apply(this, arguments);
            if (result.string !== getParamsFromArgs(arguments).join('')) {
                return result;
            }

            var options = _.last(arguments);
            if (options.hash.defaultTemplate && options.hash.defaultLabel) {
                return Handlebars.helpers.t(options.hash.defaultTemplate, options.hash.defaultLabel, options);
            }

            if (options.hash.defaultLabel) {
                return options.hash.defaultLabel;
            }

            return '';
        });

	Handlebars.registerHelper("formatDate", function(timestamp) {
		if(timestamp){
			return new Handlebars.SafeString(kendo.toString(new Date(timestamp), 'yyyy-MM-dd HH:mm'))
		} else {
			return false;
		}
	});

	Handlebars.registerHelper('truncate', function(passedString, index) {
	    if(passedString.length > index) {
    	        var str = passedString.substring(0, index);
		str += "...";
    	        return new Handlebars.SafeString(str)
	    } else {
		return new Handlebars.SafeString(passedString);
	    }
	});

	Handlebars.registerHelper('percentage', function(str) {
		if(str) {
			str = str.toString();
			return new Handlebars.SafeString(str.substring(0, str.indexOf('.') + 2) + "%");
		} else {
			return new Handlebars.SafeString("-");
		}
	});

	Handlebars.registerHelper('roundOf', function(str) {
		if(str) {
			var temp = str.toString();
			if(temp.indexOf('.')){
				str = Math.round(str * 10) / 10;
				return str;
			}else{
				return temp;
			}
		} else {
			return new Handlebars.SafeString("-");
		}
	});
	
	 Handlebars.registerHelper('trim', function(str) {
         if(str) {
                 str = str.toString();
                 return new Handlebars.SafeString(str.replace(/ /gi, ''));
         } else {
                 return new Handlebars.SafeString("-");
         }
	 });
	 
	 Handlebars.registerHelper('isOdd', function(number, options) {
         if((++number % 2) !== 0) {
             return options.fn(this);
         } else {
             return options.inverse(this);
         }
     });

     Handlebars.registerHelper('isEven', function(number, options) {
         if((++number % 2) === 0) {
             return options.fn(this);
         } else {
             return options.inverse(this);
         }
     });

    };

    return {
        initialize : initialize
    };

});
