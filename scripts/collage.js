const Overlap_Value = 30;

/// <reference path="block.js" />
Collage = function (height, width, rowHeight, columnWidth, debugCallback) {

    if (rowHeight == undefined) {
        rowHeight = 10;
    }
    if (columnWidth == undefined) {
        columnWidth = 10;
    }

    this.height = height;
    this.width = width;
    this.rowHeight = rowHeight;
    this.columnWidth = columnWidth;
    this.blockNumber = 0;
    this.debugCallback = debugCallback;
    this.blocks = null;
    

    this.initializeGrid(height, width);
}

Collage.prototype = {

    initializeGrid: function (height, width) {

        var numRows = height / this.rowHeight;
        var numColumns = width / this.columnWidth;

        this.arr = [];

        for (var row = 0; row < numRows; row++) {
            this.arr[row] = [];
            for (var col = 0; col < numColumns; col++) {
                this.arr[row][col] = new Cell(row, col, this.rowHeight, this.columnWidth);
            }
        }

    },


    fit: function (blocks) {

        this.blocks = blocks;
        this.fitCorners(blocks);

        return;
    },

    circle: function (root) {

        var nextBlock = this.blocks.find(function (block) {
            return !block.fit;
        })

        //top
        var startY = root.startY - nextBlock.renderHeight + 40;
        var startX = 0;

        if (startY < 0) {
            var remainingHeight = root.startY + 40;
            nextBlock.scaleToHeight(remainingHeight);
            startY = 0;
        }

        nextBlock.startY = startY;
        nextBlock.startX = (root.startX + root.renderWidth / 2) - nextBlock.renderWidth/2;
        nextBlock.fit = true;
        this.debugCallback(nextBlock);

        //right
        nextBlock = this.blocks.find(function (block) {
            return !block.fit;
        });

        var startX = root.startX + root.renderWidth - 40;

        nextBlock.startX = startX;
        nextBlock.startY = (root.startY + root.renderHeight / 2) - nextBlock.renderHeight / 2;
        nextBlock.fit = true;
        this.debugCallback(nextBlock);

        //bottom
        nextBlock = this.blocks.find(function (block) {
            return !block.fit;
        });        

        nextBlock.startX = (root.startX + root.renderWidth / 2) - nextBlock.renderWidth / 2;
        nextBlock.startY = root.startY + root.renderHeight - 40;
        nextBlock.fit = true;
        this.debugCallback(nextBlock);

        //left
        nextBlock = this.blocks.find(function (block) {
            return !block.fit;
        });
        
        startX = root.startX - nextBlock.renderWidth + 40;
        if (startX < 0) {
            var remainingWidth = root.startX + 40;
            nextBlock.scaleToWidth(remainingWidth);
            startX = 0;
        }

        nextBlock.startY = (root.startY + root.renderHeight / 2) - nextBlock.renderHeight / 2;
        nextBlock.startX = startX;
        nextBlock.fit = true;
        this.debugCallback(nextBlock);

    },

    gofit: function (blocks) {

        this.blocks = blocks;

        this.fitCorners(blocks);



        this.fitEdges(blocks);
        return;

        var numRows = this.arr.length;
        var numColumns = this.arr[0].length;

        for (var row = 0; row < numRows; row++) {
            for (var col = 0; col < numColumns; col++) {

                if (blocks[this.blockNumber] == undefined) {
                    return;
                }

                if (!this.arr[row][col].isAvailable) {
                    continue;
                }
                else {
                    if (this.makeBlockFit(blocks[this.blockNumber], this.arr[row][col])) {
                        blocks[this.blockNumber].startX = this.arr[row][col].getLeftEdge();
                        blocks[this.blockNumber].startY = this.arr[row][col].getTopEdge();
                        this.blockAdjacentCells(blocks[this.blockNumber], this.arr[row][col]);

                        if (this.debugCallback != undefined) {
                            this.debugCallback(this.blockNumber);
                        }

                        this.blockNumber++;
                    }
                }
            }
        }
    },

    goRight: function (startingBlock) {

        var block = this.getNextFreeBlock();

        if (block.renderWidth > block.renderHeight) {
            block.scaleToWidth(block.startingScale * this.columnWidth);
        }
        else {
            block.scaleToHeight(block.startingScale * this.rowHeight);
        }

        // Check to see if the left-half of the block will overlap with the starting point of another block



        goRight(block);
    },


    /*
    * Gets 2-edge squares (corners) in grid and makes
    * sure that an image is square with them.
    * @returns number of blocks fitted
    */
    fitCorners: function (blocks) {

        var corners = this.getCornerCells();

        for (var i = 0; i < corners.length; i++) {

            var block = this.getNextFreeBlock();            

            if (block.renderWidth > block.renderHeight) {
                block.scaleToWidth(block.startingScale * this.columnWidth);
            }
            else {
                block.scaleToHeight(block.startingScale * this.rowHeight);
            }

            var cell = corners[i];
            var edgeType = this.getEdgeType(cell);

            block.startY = (edgeType[0] == "bottom") ? cell.getBottomEdge() - block.renderHeight : cell.getTopEdge();
            block.startX = (edgeType[1] == "right") ? cell.getRightEdge() - block.renderWidth : cell.getLeftEdge();

            if (edgeType[0] == "bottom") {
                var heightOffset = Math.floor((block.renderHeight / this.rowHeight));
                cell = this.arr[cell.row - heightOffset][cell.column];
            }

            if (edgeType[1] == "right") {
                var columnOffset = Math.floor((block.renderWidth / this.columnWidth) - 1);
                cell = this.arr[cell.row][cell.column - columnOffset];
            }

            this.blockAdjacentCells(block, cell);

            if (this.debugCallback != undefined) {
                this.debugCallback(block);
            }            

            this.blockNumber++;
        }

        this.addRightAdjacentBlocks(corners[0].block);
        this.addBottomAdjacentBlocks(corners[0].block);        
    },

    addBottomAdjacentBlocks: function(rootBlock){

        if (rootBlock.bottom != undefined) {
            return;
        }

        var block = this.getNextFreeBlock();
       
        if (block.renderWidth > block.renderHeight) {
            block.scaleToWidth(block.startingScale * this.columnWidth);
        }
        else {
            block.scaleToHeight(block.startingScale * this.rowHeight);
        }

        var startX = 0;
        var startY = rootBlock.startY + rootBlock.renderHeight - Overlap_Value;
        var startingCell = this.getCellAt(startY, startX);


        block.startX = startX;
        block.startY = startY;
        rootBlock.bottom = block;

        var adjacentCell = this.getCellAt(startY + block.renderHeight + Overlap_Value, startX);

        if (adjacentCell != undefined && !adjacentCell.isAvailable && adjacentCell.block != block) {
            block.bottom = adjacentCell.block;
            return;
        }

        this.blockAdjacentCells(block, startingCell);
        this.debugCallback(block);

        this.addBottomAdjacentBlocks(block);
    },

    addRightAdjacentBlocks: function(rootBlock){

        if (rootBlock.right != undefined) {
            return;
        }
          
        var startX = rootBlock.startX + rootBlock.renderWidth - Overlap_Value;
        var startY = rootBlock.startY;
        var startingCell = this.arr[this.getRowIndex(startY)][this.getColumnIndex(startX)];
        
        var block = this.getNextFreeBlock();

        if (block.renderWidth > block.renderHeight) {
            block.scaleToWidth(block.startingScale * this.columnWidth);
        }
        else {
            block.scaleToHeight(block.startingScale * this.rowHeight);
        }

        block.startX = startX;
        block.startY = startY;
        rootBlock.right = block;
        
        var adjacentCell = this.getCellAt(startY, startX + block.renderWidth + Overlap_Value);

        if (adjacentCell != undefined && !adjacentCell.isAvailable && adjacentCell.block != block) {
            block.right = adjacentCell.block;
            return;
        }

        this.blockAdjacentCells(block, startingCell);
        this.debugCallback(block);

        this.addRightAdjacentBlocks(block);
    },

    /*
    * Runs through each of the single edge squares available in the grid making
    * sure that an image it square with the edge.
    */
    fitEdges: function (blocks) {

        var topCells = this.getEdgeCells("top");

        for (var i = 0; i < topCells.length; i++) {
            var block = blocks[this.blockNumber];



        }

        //var edgeCells = this.getEdgeCells();

        //for (var i = 0; i < edgeCells.length; i++) {
        //    var block = blocks[this.blockNumber];

        //    if (block == undefined) {
        //        return;
        //    }

        //    var cell = edgeCells[i];
        //    var edgeType = this.getEdgeType(cell)[0];

        //    if (!cell.isAvailable) {
        //        continue;
        //    }

        //    // Offset the Top-Left corner if on right side
        //    if (edgeType == "right") {
        //        var offset = Math.floor((block.renderWidth / this.columnWidth) - 1);
        //        cell = this.arr[cell.row][cell.column - offset];
        //    }
        //    else if (edgeType == "bottom") {
        //        var offset = Math.floor((block.renderHeight / this.rowHeight) - 1);
        //        cell = this.arr[cell.row - offset][cell.column];
        //    }

        //    if (this.makeBlockFit(block, cell)) {

        //        block.startY = (edgeType == "bottom") ? edgeCells[i].getBottomEdge() - block.renderHeight : cell.getTopEdge();
        //        block.startX = (edgeType == "right") ? edgeCells[i].getRightEdge() - block.renderWidth : cell.getLeftEdge();
        //        this.blockAdjacentCells(block, cell);

        //        if (this.debugCallback != undefined) {
        //            this.debugCallback(this.blockNumber);
        //        }

        //        this.blockNumber++;

        //    }
        //}
    },

    /*
    * Determines if a block will still fit within the available space.
    */
    makeBlockFit: function (block, startingCell) {

        // Get Max Dimensions
        var maxRows = block.renderHeight / this.rowHeight;
        var maxCols = block.renderWidth / this.columnWidth;
        if (maxRows < 1 || maxCols < 1) {
            return false;
        }

        var scaleRatio = null;
        var canFit = true;
        var scale = block.startingScale;

        while (canFit) {

            // Scale it by N 
            var testRatio = {};
            if (block.renderWidth > block.remainingHeight) {
                testRatio = {
                    height: Math.round(this.rowHeight * scale),
                    width: Math.round(block.calculateScaledWidth(this.rowHeight * scale))
                };
            }
            else {
                testRatio = {
                    width: Math.round(this.columnWidth * scale),
                    height: Math.round(block.calculateScaledHeight(this.columnWidth * scale)),
                };
            }

            // Calculate the ratio size
            var ratioRows = testRatio.height / this.rowHeight;
            var ratioCols = testRatio.width / this.columnWidth;

            if (ratioRows > maxRows || ratioCols > maxCols) {

                if (scaleRatio == null && this.checkForFreeCells(startingCell.row, startingCell.column, ratioRows, ratioCols)) {
                    scaleRatio = { width: block.renderWidth, height: block.renderHeight };
                }

                break;
            }

            // Check to see if the test ratio fits it fits
            canFit = this.checkForFreeCells(startingCell.row, startingCell.column, ratioRows, ratioCols);

            // If it can, try increasing by factor of n
            if (canFit) {
                scale += block.increaseFactor;
                scale = parseFloat(scale.toFixed(1));
                scaleRatio = testRatio;
            }
        }

        if (scaleRatio != null) {
            if (scaleRatio.width > scaleRatio.height) {
                block.scaleToWidth(scaleRatio.width);
            }
            else {
                block.scaleToHeight(scaleRatio.height);
            }
            block.fit = true;
            return true;
        }

        return false;

    },


    /* 
    * @block the block object to be started in the top-left of adjacent cells
    * @cell the top-left corner of the block
    */
    blockAdjacentCells: function (block, cell) {

        var remainingHeight = block.renderHeight;
        var row = cell.row;

        while (remainingHeight >= (cell.height / 2) && row < this.arr.length) {
            var remainingWidth = block.renderWidth;
            var col = cell.column;

            while (remainingWidth >= (cell.width / 2) && col < this.arr[row].length) {

                this.arr[row][col].isAvailable = false;
                this.arr[row][col].block = block;

                remainingWidth -= cell.width;
                col++;
            }

            remainingHeight -= cell.height;
            row++;
        }

        block.fit = true;
    },





    /*
    * Returns true/false if the dimensions have any blocking cells given the starting row and column.
    *
    *
    */
    checkForFreeCells: function (startingRow, startingColumn, heightInRows, widthInColumns) {

        var canFit = true;
        var maxRowIndex = (startingRow + heightInRows) >= this.arr.length ? this.arr.length : (startingRow + heightInRows);
        var maxColIndex = (startingColumn + widthInColumns) >= this.arr[0].length ? this.arr[0].length : (startingColumn + widthInColumns);

        for (var row = startingRow; row < maxRowIndex && canFit; row++) {
            for (var col = startingColumn; col < maxColIndex; col++) {
                if (!this.arr[row][col].isAvailable) {
                    canFit = false;
                    break;
                }
            }
        }

        return canFit;
    },

    /*
    * Looks through the array of blocks and retrieves the next free block.
    *
    */
    getNextFreeBlock: function () {

        for (var index = 0; index < this.blocks.length; index++) {
            if (!this.blocks[index].fit) {
                return this.blocks[index];
            }
        }

        return null;
    },


    addVoid: function (cellStartY, cellStartX, cellEndY, cellEndX) {

        for (var row = cellStartY; row <= cellEndY; row++) {
            for (var col = cellStartX; col <= cellEndX; col++) {
                this.arr[row][col].isVoid = true;
                this.arr[row][col].isAvailable = false;
            }
        }

    },

    addPlaceholder: function (cellStartY, cellStartX, block) {

        block.startX = this.arr[cellStartY][cellStartX].getLeftEdge();
        block.startY = this.arr[cellStartY][cellStartX].getTopEdge();
        block.fit = true;
    },

    /*
    * Returns all corner cells in the collage. A corner cell has two-edges.
    */
    getCornerCells: function () {
        var cornerCells = [];

        for (var row = 0; row < this.arr.length; row++) {
            for (var col = 0; col < this.arr[0].length; col++) {

                if (this.arr[row][col].isVoid) {
                    continue;
                }

                var edges = this.getEdgeType(this.arr[row][col]);

                if (edges.length == 2 &&
                    ((edges[0] == "top") || edges[0] == "bottom")) {
                    cornerCells.push(this.arr[row][col]);
                }
            }
        }

        return cornerCells;
    },


    /*
    * Goes through the grid and collects all single edge (top edge, bottom edge, or top-bottom edge) edge cells
    * @param edgeToLookFor (top, left, bottom right) optional
    * @returns Array of single edge cells (top/bottom border counts as a single edge)
    */
    getEdgeCells: function (edgeToLookFor) {
        var edgeCells = [];

        for (var row = 0; row < this.arr.length; row++) {
            for (var col = 0; col < this.arr[0].length; col++) {
                var edges = this.getEdgeType(this.arr[row][col]);

                if (edges.length == 1) {

                    if (edgeToLookFor == undefined || edges[0] == edgeToLookFor) {
                        edgeCells.push(this.arr[row][col]);
                    }

                }
                else if (edges.length == 2 &&
                    ((edges[0] == "top" && edges[1] == "bottom") || (edges[0] == "left" && edges[1] == "right"))) {

                    if (edgeToLookFor == undefined || (edges[0] == edgeToLookFor || edges[1] == edgeToLookFor)) {
                        edgeCells.push(this.arr[row][col]);
                    }
                }
            }
        }

        return edgeCells;
    },

    /*
    *
    * @returns Array indicating which edge types the cell has.
    */
    getEdgeType: function (cell) {
        var edgeTypes = [];

        if (cell.row == 0 || this.arr[cell.row - 1][cell.column].isVoid) {
            edgeTypes.push("top");
        }

        if (cell.row == this.arr.length - 1 || this.arr[cell.row + 1][cell.column].isVoid) {
            edgeTypes.push("bottom");
        }

        if (cell.column == 0 || this.arr[cell.row][cell.column - 1].isVoid) {
            edgeTypes.push("left");
        }

        if (cell.column == this.arr[0].length - 1 || this.arr[cell.row][cell.column + 1].isVoid) {
            edgeTypes.push("right");
        }

        return edgeTypes;
    },

    getCellAt : function(yPosition, xPosition){
        return this.arr[this.getRowIndex(yPosition)][this.getColumnIndex(xPosition)];
    },

    /*
    * Given an xCoordinate get the column that corresponds.    
    */
    getColumnIndex: function (xPosition) {
        return Math.floor(xPosition / this.columnWidth);
    },

    /*
    * Given a yCoordinate gets the row that corresponds.
    */
    getRowIndex: function (yPosition) {
        return Math.floor(yPosition / this.rowHeight);
    },
}