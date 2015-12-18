/*global define:false*/
define([], function() {
	"use strict";


	var Node = function(step) {
		var _next = null; //reference next node
		var _previous = null; //reference previous node

        var _name = step.name || step.identifier; // reference current name;
        var _detailsPage = step.detailsPage || null;
        var _sidebarPage = step.sidebarPage || null;
        var _validations = step.validations || [];

        var _options = step.options;

		return {
			setPrevious: function(node) {
				_previous = node;
				return this;
			}, //chainable!
			getPrevious: function() {
				return _previous;
			},
			setNext: function(node) {
				_next = node;
				return this;
			}, //chainable!
			getNext: function() {
				return _next;
			},
			getName: function() {
				return _name;
			},
			getDetailsPage: function() {
				return _detailsPage;
			},
			getSidebarPage: function() {
				return _sidebarPage;
			},
            getValidations: function() {
                return _validations;
            },
            getOptions: function() {
                return _options;
            }
		};
	};


	var LinkedList = function() {
		var _head = null;
		var _tail = null;
		var _current = null;

		return {
			first: function() {
				return _head;
			},

			last: function() {
				return _tail;
			},

			//set current to next and return current or return null
			next: function() {
				return (_current !== null) ? _current = _current.getNext() : null;
			},

			hasNext: function() {
				return (_current.getNext() !== null);
			},

			//set current to previous and return current or return null
			previous: function() {
				return (_current !== null) ? _current = _current.getPrevious() : null;
			},

			hasPrevious: function() {
				return (_current.getPrevious() !== null);
			},

			current: function() {
				return _current;
			},

			insert: function(element) {
				if (_tail === null) { // list is empty (implied head is null)                    
					_current = _tail = _head = new Node(element);
				} else {
					_tail = _tail.setNext(new Node(element).setPrevious(_tail)).getNext();
				}
			},

			setCurrentByName: function(name) {
				var node = _head;
				while (node !== null) {
					if (node.getName() !== name) {
						node = node.getNext();
					} else {
						_current = node;
						return _current;
					}
				}
			}
		};
	};

	return {
		linkedList: LinkedList
	};
});