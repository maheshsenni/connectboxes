/*jslint browser: true */
/*global Snap,$ */

var totalBoxes = 10; // will be a 10x10 board
var isDrawing = false;
var drawingLine;
var snapSVG = Snap('#svg');
var rectWidth, rectHeight, svgPos;
var passThroughRects = [];
var occupiedCells = [];
var currentPassThroughIndex = 0;
var currentColorLevel;

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
			$('#rect-' + i + '-' + j).hover(
				//hover in
				function() {					
					if(isDrawing && $.inArray(this.id, passThroughRects) < 0){
						var id = this.id.split('-');
						if(passThroughRects.length > 1) {							
							var previousId = passThroughRects[passThroughRects.length - 1].split('-');
							var yMovement = Math.abs(previousId[1] - id[1]);
							var xMovement = Math.abs(previousId[2] - id[2]);
							if(xMovement <=1 && yMovement <=1){
								if((xMovement == 1 && yMovement == 0) 
									|| (xMovement == 0 && yMovement == 1)) {
									addRect(this.id);									
								} else {
									// invalid move - diagonal ?!!
									resetCurrentLine();
								}
							}
						} else if(passThroughRects.length == 1){
							addRect(this.id);							
						}
					} else if(isDrawing && $.inArray(this.id, passThroughRects) >= 0){
						// console.log('Visited rect twice ' + this.id);
						// resetCurrentLine();
					}
				},
				//hover out
				function() {
					
				}
			);
		};		
	};
	markCells();
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

snapSVG.drag(
	//ondrag
	function(dx, dy, x, y, event) {
		//console.log('drag');		
	},
	//onstart
	function(x, y, event) {
		if(checkValidStartRect(event.srcElement.id)){			
			addRect(event.srcElement.id);
			isDrawing = true;
		}			
	},
	//onstop
	function(event) {		
		isDrawing = false;
		if(currentColorLevel && !currentColorLevel.connected) {
			resetCurrentLine();
		}
	}
);

$('#resetCurrent').on('click', resetCurrentLine);

function checkValidStartRect(id){
	for (var i = 0; i < level.length; i++) {
		if(id === level[i].cell1 || id === level[i].cell2){			
			currentColorLevel = level[i];
			return true;
		}
	};
	// invalid start rect. can start only from colored cells
	return false;
}

function resetCurrentLine(){
	console.log('resetting...');
	if(drawingLine){
		drawingLine.remove();
	}	
	drawingLine = null;
	isDrawing = false;
	currentColorLevel = null;
	passThroughRects.length = 0;
	currentPassThroughIndex = 0;
}

function addRect(id){
	if(occupiedCells.indexOf(id) > -1){
		// cell already used
		return;
	}
	for (var i = 0; i < level.length; i++) {
		if(id === level[i].cell1 || id === level[i].cell2) {
			if(id != currentColorLevel.cell1 && id != currentColorLevel.cell2) {
				// not a valid cell - passing through another color cell				
				return;
			}			
		}
	};
	console.log('adding id ' + id);
	passThroughRects.push(id);	
	drawLine();
	if(passThroughRects.length > 1) {
		if(passThroughRects[0] === currentColorLevel.cell1){
			if(id === currentColorLevel.cell2) {
				wrapConnection();
			}
		} else if(passThroughRects[0] === currentColorLevel.cell2) {
			if(id === currentColorLevel.cell1) {
				wrapConnection();
			}
		}
	}
}

function wrapConnection() {
	currentColorLevel.connected = true;
	isDrawing = false;
	console.log('connected');
	currentColorLevel = null;
	drawingLine = null;
	occupiedCells = occupiedCells.concat(passThroughRects);
	passThroughRects.length = 0;
	currentPassThroughIndex = 0;
	var allConnected = true;
	for (var i = 0; i < level.length; i++) {
		if(!level[i].connected){
			allConnected = false;
		}
	};
	if(allConnected){
		$('#status').text('Level Complete! You have used ' + (occupiedCells.length - (level.length * 2)) + ' cells.');
		$('.btn-primary').removeClass('hide');
		$('.btn-secondary').removeClass('hide');
	}
}

function drawLine(){
	console.log('drawing line');
	var rect = Snap('#' + passThroughRects[currentPassThroughIndex]);
	var x = rect.node.x.baseVal.value + (rectWidth/2);
	var y = rect.node.y.baseVal.value + (rectHeight/2);
	if(currentPassThroughIndex == 0) {		
		drawingLine = snapSVG.path();
		drawingLine.attr({
			'd': 'M' + x + ' ' + y,
			'stroke': currentColorLevel.color,
			'stroke-width': '8',
			'fill': 'transparent',
			'pointer-events': 'none'
		});
		currentPassThroughIndex++;
	} else if(currentPassThroughIndex > 0) {
		var prevRect = Snap('#' + passThroughRects[currentPassThroughIndex - 1]);
		var prevX = prevRect.node.x.baseVal.value + (rectWidth/2);
		var prevY = prevRect.node.y.baseVal.value + (rectHeight/2);
		if((Math.abs(prevX - x)) > (Math.abs(prevY - y))) {
			// moving horizontally			
			if(prevX < x){
				// moving right
				drawingLine.attr({
					'd': drawingLine.attr('d') + ' h' + rectWidth
				});	
			} else {
				// moving left
				drawingLine.attr({
					'd': drawingLine.attr('d') + ' h' + -rectWidth
				});
			}	
		} else if((Math.abs(prevX - x)) < (Math.abs(prevY - y))) {
			// moving vertically			
			if(prevY < y){
				// moving down
				drawingLine.attr({
					'd': drawingLine.attr('d') + ' v' + rectHeight
				});	
			} else {
				// moving up
				drawingLine.attr({
					'd': drawingLine.attr('d') + ' v' + -rectHeight
				});
			}
		}
		currentPassThroughIndex++;
	}
}