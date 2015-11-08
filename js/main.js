
// Configuration
var containerWidth = 800;
var containerHeight = 500;
var blockRadius = 5;
var margin = 6;
var timeDelay = 5;
var blankColor = '#FFFFFF'
var running = false;

// Global variables
var cells;
var svg;

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
	svg = createSVG();
	cells = initializeCells();
    initializeButtons();

    //createShape(acorn, 50, 50, '#AA0000');
    createShape(smallExploder, 10, 40, '#330033');
    //createShape(acorn, 50, 10, '#AA3300');
    //createShape(acorn, 50, 15, '#33AA00');
    //createShape(acorn, 50, 20, '#333300');
    createShape(exploder, 60, 10, '#00AA00');
    //createShape(glider, 25, 25, '#0000AA');
    createShape(gliderGun, 0, 0, '#AAAA00');
    //createShape(exploder, 80, 60, '#00AAAA');


    renderCells(svg, cells);
    //animate(svg, cells);
}

function initializeButtons() {
    d3.select('#play_pause').on('click', function(e) {
        running = !running;
        if (running) {
            this.innerHTML = "Pause";
            animate();
        }
        else {
            this.innerHTML = "Play";
        }
    });
}

function animate() {
	renderCells();
	recalculateCells();
    if (running) {
       setTimeout(function(){ animate() }, timeDelay);
   }
}

function recalculateCells() {
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
				var newColor = combineColors(surroundingColors);
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

	cells = newCells;
}

function combineColors(colorArray) {
	
	var r = 0;
	var g = 0;
	var	b = 0;
	colorArray.forEach(function(colorText) {
		var rgbColor = d3.rgb(colorText);
		r += rgbColor.r;
		g += rgbColor.g;
		b += rgbColor.b;
	});

	r = Math.min(r / colorArray.length, 255);
	g = Math.min(g / colorArray.length, 255);
	b = Math.min(b / colorArray.length, 255);

    return d3.rgb(r, g, b).toString();
}

function renderCells() {

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
		.attr('cx', function(value, y, x) { return (x * (blockRadius * 2)) + margin + 1; })
		.attr('cy', function(value, y, x) { return (y * (blockRadius * 2)) + margin + 1; })
		.attr('r', blockRadius - 1)

	selectedCells
		.attr('fill', function(value) { return value; })
        .on('click', function(value, y, x) {
            if (!running) {
                cells[x][y] = '#000000';
                renderCells();
            }
        })
        .on('mouseover', function(value, y, x) {
            if (!running) {
                currentCell = d3.select(this)[0][0];
                svg.select('g').selectAll('rect').remove();
                svg.select('g').append('rect')
                    .attr('fill', null)
                    .attr('stroke', 'black')
                    .attr('stroke-width', 1)
                    .attr('width', blockRadius * 2)
                    .attr('height', blockRadius * 2)
                    .attr('x', currentCell.cx.baseVal.value - blockRadius)
                    .attr('y', currentCell.cy.baseVal.value - blockRadius);
            }
        });
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

function createShape(shape, startingX, startingY, color) {
    shape.forEach(function(shapeRow, y) {
        flags = shapeRow.split('');
        flags.forEach(function(flag, x) {
            cells[startingX + x][startingY + y] = flag === '.' ? blankColor : color;
        })
    });
}

function createSVG() {

	var svg = d3.select('#svg_holder')
		.append('svg')
		.attr('width', containerWidth + (margin * 2))
		.attr('height', containerHeight + (margin * 2))
		.attr('border', 1)

	svg.on('mouseout', function() {
        d3.select(this).select('g').selectAll('rect').remove();
    });

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
