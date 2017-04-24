const Overlap_Value = 25;

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
    this.debugCallback = debugCallback;

    this.blockNumber = 0;
    this.blocks = null;

    this.initializeGrid(height, width);
}

Collage.prototype = {

    /*
    * Creates the internal grid used to track cells for determining where a block has been placed.
    */
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


    addBlockCorners: function (centerBlock) {

        //Add Top-Right
        //As long as there isn't a top right and adding a topright doesn't take us past the 
        //edge of the grid
        if (centerBlock.topright == undefined) {
            var topRight = this.getNextFreeBlock();
            topRight.scale(6 * 72);           

            var coords = centerBlock.getCoordsForTopRight(topRight);

            if (coords.x + topRight.renderWidth < this.width &&
                coords.y > 0) {

                topRight.setTopLeft(coords);
                topRight.fit = true;
                centerBlock.linkTopRight(topRight);

                this.debugCallback(topRight);

                this.addBlockCorners(topRight);
            }                         
        }

        //Add Bottom-Right
        if (centerBlock.bottomright == undefined) {
            var bottomRight = this.getNextFreeBlock();
            bottomRight.scale(6 * 72);                            

            var coords = centerBlock.getCoordsForBottomRight(bottomRight);

            if (coords.x + bottomRight.renderWidth < this.width && coords.y + bottomRight.renderHeight < this.height) {

                bottomRight.setTopLeft(coords);
                bottomRight.fit = true;
                centerBlock.linkBottomRight(bottomRight);

                // TODO: Get Add If Debug
                this.debugCallback(bottomRight);

                //this.addBlockCorners(bottomRight);
            }
        }

        //Add Bottom-Left
        if (centerBlock.bottomleft == undefined) {
            var bottomLeft = this.getNextFreeBlock();
            bottomLeft.scale(6 * 72);            

            var coords = centerBlock.getCoordsForBottomLeft(bottomLeft);

            if (coords.x > 0 && coords.y + bottomLeft.renderHeight < this.height) {

                bottomLeft.setTopLeft(coords);
                bottomLeft.fit = true;
                centerBlock.linkBottomRight(bottomLeft);

                // TODO: Get Add If Debug
                this.debugCallback(bottomLeft);

                //this.addBlockCorners(bottomLeft);
            }
        }

        //Add Top-Left
        if (centerBlock.topleft == undefined) {
            var topLeft = this.getNextFreeBlock();
            topLeft.scale(6 * 72);

            var coords = centerBlock.getCoordsForTopLeft(topLeft);

            if (coords.x > 0 && coords.y > 0) {

                topLeft.setTopLeft(coords);
                topLeft.fit = true;
                centerBlock.linkTopLeft(topLeft);

                // TODO: Get Add If Debug
                this.debugCallback(topLeft);

                //this.addBlockCorners(topLeft);
            }            
        }
    },

    fit: function (blocks) {

        this.blocks = blocks;

        // Grab a block
        // Set it to the center of the map
        
        var firstBlock = this.getNextFreeBlock();
        firstBlock.scale(6 * 72);
        firstBlock.setCenter({ x: this.width / 2, y: this.height / 2 });
        firstBlock.fit = true;
        this.debugCallback(firstBlock);

        // Add Corners
        this.addBlockCorners(firstBlock);
               

        return;
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

            if (i == 2) {
                corners[i].block = block;
            }

            this.blockNumber++;
        }

        this.addTopEdges(corners[0].block);
        this.addLeftEdges(corners[0].block);
        this.addRightEdges(corners[1].block);
        this.addBottomEdges(corners[2].block);
    },

    addLeftEdges: function (rootBlock) {

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

        if (!this.checkFreeDuringCriticalCoords(block)) {
            return;
        }

        this.blockAdjacentCells(block, startingCell);
        this.debugCallback(block);

        this.addLeftEdges(block);
    },

    addBottomEdges: function (rootBlock) {

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

        var startX = rootBlock.startX + rootBlock.renderWidth - Overlap_Value;
        var startY = rootBlock.startY + rootBlock.renderHeight - block.renderHeight;
        var startingCell = this.getCellAt(startY, startX);


        block.startX = startX;
        block.startY = startY;
        rootBlock.right = block;

        if (!this.checkFreeDuringCriticalCoords(block)) {
            return;
        }

        this.blockAdjacentCells(block, startingCell);
        this.debugCallback(block);

        this.addBottomEdges(block);
    },

    addRightEdges: function (rootBlock) {

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

        var startX = (rootBlock.startX + rootBlock.renderWidth) - block.renderWidth;
        var startY = rootBlock.startY + rootBlock.renderHeight - Overlap_Value;
        var startingCell = this.getCellAt(startY, startX);


        block.startX = startX;
        block.startY = startY;
        rootBlock.bottom = block;

        if (!this.checkFreeDuringCriticalCoords(block)) {
            return;
        }

        this.blockAdjacentCells(block, startingCell);
        this.debugCallback(block);

        this.addRightEdges(block);
    },

    addTopEdges: function (rootBlock) {

        if (rootBlock.right != undefined) {
            return;
        }

        var startX = rootBlock.startX + rootBlock.renderWidth - Overlap_Value;
        var startY = rootBlock.startY;
        var startingCell = this.getCellAt(startY, startX);

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

        if (!this.checkFreeDuringCriticalCoords(block)) {
            return;
        }

        this.blockAdjacentCells(block, startingCell);
        this.debugCallback(block);

        this.addTopEdges(block);
    },

    checkFreeDuringCriticalCoords: function (block) {
        var criticalCoordinates = block.getCriticalCoordinates();

        for (var y = block.startY + criticalCoordinates.y1 + Overlap_Value; y < block.startY + criticalCoordinates.y2; y += this.rowHeight) {
            for (var x = block.startX + criticalCoordinates.x1 + Overlap_Value; x < block.startX + criticalCoordinates.x2; x += this.columnWidth) {
                var cell = this.getCellAt(y, x);

                if (cell == undefined || !cell.isAvailable) {
                    return false;
                }
            }
        }

        return true;
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



    landscapeFilter: function (block) {
        return block.renderWidth > block.renderHeight;
    },

    portraitFilter: function (block) {
        return block.renderHeight > block.renderWidth;
    },

    /*
    * Looks through the array of blocks and retrieves the next free block.
    * @param filter optional callback function to add additional filter to nextfreeblock
    */
    getNextFreeBlock: function (filter) {

        for (var index = 0; index < this.blocks.length; index++) {

            if (!this.blocks[index].fit) {

                if (filter == undefined) {
                    return this.blocks[index];
                }

                if (filter != undefined && filter(this.blocks[index])) {
                    return this.blocks[index];
                }

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
    * Gets all single edge (top edge, bottom edge, or top-bottom edge) edge cells
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



    /*
    * @returns a Cell corresponding to the x,y coordinate on the grid.
    */
    getCellAt: function (coordinate) {
        return this.arr[this.getRowIndex(coordinate.y)][this.getColumnIndex(coordinate.x)];
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