/*jslint browser: true */
/*global Snap,$ */

var totalBoxes = 10; // will be a 10x10 board
var isDrawing = false;
var drawingLine;
var snapSVG = Snap('#svg');
var rectWidth, rectHeight, svgPos;
var animateRunning = true;

$(function(){		
	svgPos = $('#svg').position();
	rectWidth = $('#svg').width() / totalBoxes;
	rectHeight = $('#svg').height() / totalBoxes;
	for (var i = 0; i < totalBoxes; i++) {
		for (var j = 0; j < totalBoxes; j++) {
			var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
			rect.setAttribute('id', 'rect-' + i + '-' + j);
			$('#svg').append(rect);
			$('#rect-' + i + '-' + j).attr({
				'x': j * rectWidth,
				'y': i * rectHeight,
				'width': rectWidth,
				'height': rectHeight,
				'fill': 'whiteSmoke',
				'stroke-width': '1',
				'stroke': '#ddd'
			});			
		};		
	};
	markCells();
	animateLoop();	
});

function markCells() {
	var cell;
	for (var i = 0; i < level.length; i++) {
		cell = Snap('#' + level[i].cell1);
		cell.attr({
			'fill': level[i].color
		});
		cell = Snap('#' + level[i].cell2);
		cell.attr({
			'fill': level[i].color
		});
	};
}

function animateLines() {
	var paths = Snap('path');
	if(paths) {
		paths.remove();
	}
	paths = Snap('path');
	if(paths) {
		paths.remove();
	}	
	var lineRed = snapSVG.path();
	lineRed.attr({
		'd': 'M 60 20',
		'stroke': 'green',
		'stroke-width': 8,
		'fill': 'transparent',
		'pointer-events': 'none'
	});

	lineRed.animate({
		'd': lineRed.attr('d') + 'v320'
	}, 2000, null, function() {		
		lineRed.animate({
			'd': lineRed.attr('d') + 'h280'
		}, 2000, null, function() {
			animateBlueLine();
		});		
	});	
}

function animateBlueLine() {
	var lineBlue = snapSVG.path();
	lineBlue.attr({
		'd': 'M 220 60',
		'stroke': 'orange',
		'stroke-width': 8,
		'fill': 'transparent',
		'pointer-events': 'none'
	});

	lineBlue.animate({
		'd': lineBlue.attr('d') + 'h80'
	}, 1000, null, function() {		
		lineBlue.animate({
			'd': lineBlue.attr('d') + 'v160'
		}, 2000);
	});
}

function animateLoop() {
	animateLines();
	setInterval(animateLines, 10000);
}