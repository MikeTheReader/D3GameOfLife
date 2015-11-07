
// Configuration
var containerWidth = 800;
var containerHeight = 800;
var blockRadius = 5;
var margin = 15;
var timeDelay = 5;
var blankColor = '#FFFFFF'

// Shapes
var glider = [
        '.x.',
        '..x',
        'xxx'
    ];
    
var smallExploder = [
        '.x.',
        'xxx',
        'x.x',
        '.x.'
    ];
    
var exploder = [
        'x.x.x',
        'x...x',
        'x...x',
        'x...x',
        'x.x.x'
    ];
    
var acorn = [
    '.x.....',
    '...x...',
    'xx..xxx'
];

var gliderGun = [
    '......................................',
    '.........................x............',
    '.......................x.x............',
    '.............xx......xx............xx.',
    '............x...x....xx............xx.',
    '.xx........x.....x...xx...............',
    '.xx........x...x.xx....x.x............',
    '...........x.....x.......x............',
    '............x...x.....................',
    '.............xx.......................',
    '......................................',
];
 
function onload() {
    console.log('onload');
    console.log('creating SVG');
	var svg = createSVG();
    console.log('initializing cells');
	var cells = initializeCells();
    
    createShape(acorn, cells, 50, 50, '#AA0000');
    createShape(smallExploder, cells, 10, 10, '#330033');
    createShape(acorn, cells, 50, 10, '#AA3300');
    createShape(acorn, cells, 50, 15, '#33AA00');
    createShape(acorn, cells, 50, 20, '#333300');
    createShape(exploder, cells, 85, 30, '#00AA00');
    createShape(glider, cells, 25, 25, '#0000AA');
    createShape(gliderGun, cells, 0, 0, '#AAAA00');
    createShape(exploder, cells, 80, 60, '#00AAAA');
    
	animate(svg, cells);
}

function animate(svg, cells) {
	renderCells(svg, cells);
	cells = recalculateCells(cells);
	setTimeout(function(){ animate(svg, cells) }, timeDelay);
}

function recalculateCells(cells) {
	var newCells = initializeCells();
	var numXCells = cells.length;
	var numYCells = cells[0].length;
	
    var surroundingCells = [[-1, -1],[-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    
	for (var x = 0; x < numXCells; x++) {
		for (var y = 0; y < numYCells; y++) {
			var totalNeighbors = 0;
            var surroundingColors = []
            surroundingCells.forEach(function(cellOffsets) {
                var sur_x = x + cellOffsets[0];
                var sur_y = y + cellOffsets[1];
                if (sur_x < numXCells && sur_x > -1) {
                    if (sur_y < numYCells && sur_y > -1) {
                        var hasNeighbor = cells[sur_x][sur_y] !== blankColor;
                        totalNeighbors += hasNeighbor ? 1 : 0;
                        if (hasNeighbor) {
                            surroundingColors.push(cells[sur_x][sur_y]);
                        }
                    }
                }
            });
            
            
            if (surroundingColors.length > 0) {
                var newColor = surroundingColors[0];
                for (var c = 1; c < surroundingColors.length; c++) {
                    newColor = combineColors(newColor, surroundingColors[c]);
                }
                if (cells[x][y] !== blankColor) {
                    if (totalNeighbors === 2 || totalNeighbors == 3) {
                        newCells[x][y] = newColor;
                    }
                }
                else {
                    if (totalNeighbors === 3) {
                        newCells[x][y] = newColor;
                    }
                }
            }
		}
	}
	
	return newCells;
}

function combineColors(colorOne, colorTwo) {
    d3ColorOne = d3.rgb(colorOne);
    d3ColorTwo = d3.rgb(colorTwo);
    
    combineColor = d3.rgb(
        Math.min((d3ColorOne.r + d3ColorTwo.r) / 2, 255),
        Math.min((d3ColorOne.g + d3ColorTwo.g) / 2, 255),
        Math.min((d3ColorOne.b + d3ColorTwo.b) / 2, 255)
    );
    
    return combineColor.toString();
}

function renderCells(svg, cells) {

	var centerX = cells[0].length / 2;
	var centerY = cells[1].length / 2;
	var selectedRows = svg.selectAll('g')
		.data(cells)
		
	selectedRows
		.enter()
		.append('g')
	
	var selectedCells = selectedRows
		.selectAll('circle')
		.data(function (d) { return d; })
		
	selectedCells.enter()
		.append('circle')
		.attr('cx', function(value, y, x) { return (x * (blockRadius * 2)) + margin; })
		.attr('cy', function(value, y, x) { return (y * (blockRadius * 2)) + margin; })
		.attr('r', blockRadius)		
	
	selectedCells
		.attr('fill', function(value) { return value; })
}

function initializeCells() {
	var cells = [];
	var numXCells = containerWidth / (blockRadius * 2);
	var numYCells = containerHeight / (blockRadius * 2);
    
    for (var x = 0; x < numXCells; x++) {
		cells[x] = []
		for (var y = 0; y < numYCells; y++) {
			cells[x][y] = blankColor;
		}
	}
	
	return cells;
}

function createShape(shape, cells, startingX, startingY, color) {
    shape.forEach(function(shapeRow, y) {
        flags = shapeRow.split('');
        flags.forEach(function(flag, x) {
            cells[startingX + x][startingY + y] = flag === '.' ? blankColor : color;
        })
    });
}

function createSVG() {

	var svg = d3.select('body')
		.append('svg')
		.attr('width', containerWidth + (margin * 2))
		.attr('height', containerHeight + (margin * 2))
		.attr('border', 1)
		
	var borderPath = svg.append('rect')
		.attr('x', 0)
		.attr('y', 0)
		.attr('width', containerWidth + (margin * 2))
		.attr('height', containerHeight + (margin * 2))
		.attr('stroke', 'black')
		.attr('fill', 'none')
		.attr('stroke-width', 'border');

	return svg;
}