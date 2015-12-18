/*jshint browser:true, indent:2, globalstrict: true, laxcomma: true, laxbreak: true */
/*global d3:true */

/*
 * colorlegend
 *
 * This script can be used to draw a color legend for a 
 * [d3.js scale](https://github.com/mbostock/d3/wiki/Scales) 
 * on a specified html div element. 
 * [d3.js](http://mbostock.github.com/d3/) is required.
 *
 */

'use strict';

var colorlegend = function (target, scale, type, options, h, marginleft) {

  var scaleTypes = ['linear', 'quantile', 'ordinal', 'log']
    , found = false
    , opts = options || {}
    , boxWidth = opts.boxWidth || 20        // width of each box (int)
    , boxHeight = opts.boxHeight || 20      // height of each box (int)
    , title = opts.title || null            // draw title (string)
    , fill = opts.fill || false             // fill the element (boolean)
    , linearBoxes = opts.linearBoxes || 9   // number of boxes for linear scales (int)
    , htmlElement = document.getElementById(target.substring(0, 1) === '#' ? target.substring(1, target.length) : target)  // target container element - strip the prefix #
    , w = htmlElement.offsetWidth           // width of container element    
    , colors = []
    , scores=[]
    , labels = opts.labels
    , padding = [2, 4, 10, marginleft]               // top, right, bottom, left
    , boxSpacing = type === 'ordinal' ? 3 : 0 // spacing between boxes
    , titlePadding = title ? 15 : 0
    , domain = scale.domain()
    , range = scale.range()    
    , i = 0;

 
  // check for valid input - 'quantize' not included
  for (i = 0 ; i < scaleTypes.length ; i++) {
    if (scaleTypes[i] === type) {
      found = true;
      break;
    }
  }
  if (! found)
    throw new Error('Scale type, ' + type + ', is not suported.');

  
  function log10(n) {
      if (n <=0) n = 0.1;
      return Math.log(n) / 2.302585092994046;
  }
  // setup the colors to use
  if (type === 'quantile') {
    colors = range;
  }
  else if (type === 'ordinal') {
    for (i = 0 ; i < domain.length ; i++) {
      colors[i] = range[i];
      scores[i] = i;
    }
  }
  else if (type === 'linear') {
    var min = domain[0];
    var max = domain[domain.length - 1];
    for (i = 0; i < linearBoxes ; i++) {
	 var value =min + i * ((max - min) / linearBoxes); 
         colors[i] = scale(value);
         scores[i] = value;
    }
  }
  else if (type === 'log') {
      var min = domain[0]+0.001;
      var max = domain[domain.length - 1];     
      
      var lmax= log10(max);
      var delta = lmax / linearBoxes;
      
      colors[0] = scale(min);
      scores[0] = min;
      console.log("Got min: "+min+", scores min="+scores[i]);
      for (i = 1; i <= linearBoxes ; i++) {
	 // var value =min + i * ((max - min) / linearBoxes);
	  var value =min +  (Math.pow(10, i*delta));
          colors[i] = scale(value);
          scores[i] = value;
      }
    }
  
  // check the width and height and adjust if necessary to fit in the element
  // use the range if quantile
  if (fill || w < (boxWidth + boxSpacing) * colors.length + padding[1] + padding[3]) {
    boxWidth = (w - padding[1] - padding[3] - (boxSpacing * colors.length)) / colors.length;
  }
  if (fill || h < boxHeight + padding[0] + padding[2] + titlePadding) {  
    boxHeight = h - padding[0] - padding[2] - titlePadding;    
  }
  
  // set up the legend graphics context
  var legend = d3.select(target)
    .append('svg')
      .attr('width', w)
      .attr('height', h)
    .append('g')
      .attr('class', 'colorlegend')
      .attr('transform', 'translate(' + padding[3] + ',' + padding[0] + ')')
      .style('font-size', '11px')
      .style('fill', '#666');
      
  var legendBoxes = legend.selectAll('g.legend')
      .data(colors)
    .enter().append('g');

  // value labels
  legendBoxes.append('text')
      .attr('class', 'colorlegend-labels')
      .attr('dy', '.71em')
      .attr('x', function (d, i) {
        return i * (boxWidth + boxSpacing) + (type !== 'ordinal' ? (boxWidth / 2) : 0);
      })
      .attr('y', function () {
        return boxHeight + 2;
      })     
      .style('text-anchor', function () {
        return type === 'ordinal' ? 'start' : 'middle';
      })
      .style('pointer-events', 'none')
      .text(function (d, i) {
        // show label for all ordinal values
        if (type === 'ordinal') {
          return domain[i];
        }
        // show only the first and last for others
        else {
          var nr = linearBoxes;  
          if (i === 0 || i === nr-1  || i ===(nr)/2 || i === (nr/4)) {
              	var value =  scores[i];
              //	console.log("Got i, scores[i] = "+scores[i]);
              	if (labels && labels.length > 0) {
              	    value = parseFloat(value).toFixed(0);
              	    if (labels.length > value) {
              		return labels[value];
              	    }
              	    else return  labels[labels.length-1];
              	}
              	if (type ==='log') 
              	    value = parseFloat(value).toFixed(0);
             	}
          	return value;        
        }
      });

  // the colors, each color is drawn as a rectangle
  legendBoxes.append('rect')
      .attr('class', 'colorlegend-rects')
  	.attr('x', function (d, i) { 
        return i * (boxWidth + boxSpacing);
      })
      .attr('nr', function (d, i) {
        return i;
      })
      .attr('s', function (d, i) {
        return scores[i];
      })
      .attr('width', boxWidth)
      .attr('height', boxHeight)
      .style('fill', function (d, i) { return colors[i]; });
  
  // show a title in center of legend (bottom)
  if (title) {
    legend.append('text')
        .attr('class', 'colorlegend-title')
        .attr('x', (colors.length * (boxWidth / 2)))
        .attr('y', boxHeight + titlePadding)
        .attr('dy', '.71em')
        .style('text-anchor', 'middle')
        .style('pointer-events', 'none')
        .text(title);
  }
    
  return this;
};