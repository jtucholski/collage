Collage = function (height, width, rowHeight, columnWidth, debugCallback) {

    if (rowHeight == undefined) {
        rowHeight = 10;
    }
    if (columnWidth == undefined) {
        columnWidth = 10;
    }

    this.rowHeight = rowHeight;
    this.columnWidth = columnWidth;
    this.blockNumber = 0;
    this.debugCallback = debugCallback;

    this.initializeGrid(height, width);
}

Collage.prototype = {

    fit: function (blocks) {

        this.fitCorners(blocks);
        this.fitEdges(blocks);

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

    addVoid: function(cellStartY, cellStartX, cellEndY, cellEndX){

        for (var row = cellStartY; row <= cellEndY; row++ ){
            for (var col = cellStartX; col <= cellEndX; col++){
                this.arr[row][col].isVoid = true;
                this.arr[row][col].isAvailable = false;
            }
        }

    },

    /*
    * Runs through the "corners" OR 2-edge squares on grid and makes
    * sure that an image is square with them.
    * @returns number of blocks fitted
    */
    fitCorners: function (blocks) {

        var corners = this.getCornerCells();

        for (var i = 0; i < corners.length; i++) {

            var block = blocks[this.blockNumber];

            if (block == undefined) {
                return;
            }

            var cell = corners[i];
            var edgeType = this.getEdgeType(cell);

            if (edgeType[0] == "bottom") {
                block.startY = cell.getBottomEdge() - block.renderHeight;
                var offset = Math.ceil((block.renderHeight / this.rowHeight) - 1);
                cell = this.arr[cell.row - offset][cell.column];
            }
            else {
                block.startY = cell.getTopEdge();
            }
            
            if (edgeType[1] == "right") {
                block.startX = cell.getRightEdge() - block.renderWidth;
                var offset = Math.ceil((block.renderWidth / this.columnWidth) - 1);
                cell = this.arr[cell.row][cell.column - offset];
            }
            else {
                block.startX = cell.getLeftEdge();
            }
            
            
            this.blockAdjacentCells(block, cell);
            
            if (this.debugCallback != undefined) {
                this.debugCallback(this.blockNumber);
            }

            this.blockNumber++;            
        }
    },

    /*
    * Runs through each of the single edge squares available in the grid making
    * sure that an image it square with the edge.
    */
    fitEdges: function(blocks){
        var edgeCells = this.getEdgeCells();

        for (var i = 0; i < edgeCells.length; i++) {
            var block = blocks[this.blockNumber];

            if (block == undefined) {
                return;
            }

            var cell = edgeCells[i];
            var edgeType = this.getEdgeType(cell)[0];

            if (!cell.isAvailable) {
                continue;
            }

            // Offset the Top-Left corner if on right side
            if (edgeType == "right") {
                var offset = Math.floor((block.renderWidth / this.columnWidth) - 1);
                cell = this.arr[cell.row][cell.column - offset];
            }
            else if (edgeType == "bottom") {
                var offset = Math.floor((block.renderHeight / this.rowHeight) - 1);
                cell = this.arr[cell.row - offset][cell.column];
            }
           
            if (this.makeBlockFit(block, cell)) {

                block.startY = cell.getTopEdge();
                block.startX = cell.getLeftEdge();
                this.blockAdjacentCells(block, cell);

                if (this.debugCallback != undefined) {
                    this.debugCallback(this.blockNumber);
                }

                this.blockNumber++;

            }
        }        
    },

    getCornerCells: function() { 
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
    * @returns Array of single edge cells (top/bottom border counts as a single edge)
    */
    getEdgeCells: function() {
        var edgeCells = [];

        for (var row = 0; row < this.arr.length; row++) {
            for (var col = 0; col < this.arr[0].length; col++) {
                var edges = this.getEdgeType(this.arr[row][col]);

                if (edges.length == 1) {
                    edgeCells.push(this.arr[row][col]);
                }
                else if (edges.length == 2 &&
                    ((edges[0] == "top" && edges[1] == "bottom") || (edges[0] == "left" && edges[1] == "right"))) {
                    edgeCells.push(this.arr[row][col]);
                }                
            }
        }

        return edgeCells;
    },

    /*
    *
    * @returns Array indicating which edge types the cell has.
    */
    getEdgeType: function(cell) {
        var edgeTypes = [];

        if (cell.row == 0 || this.arr[cell.row-1][cell.column].isVoid) {
            edgeTypes.push("top");
        }

        if (cell.row == this.arr.length - 1 || this.arr[cell.row+1][cell.column].isVoid) {
            edgeTypes.push("bottom");
        }

        if (cell.column == 0 || this.arr[cell.row][cell.column-1].isVoid) {
            edgeTypes.push("left");
        }

        if (cell.column == this.arr[0].length - 1 || this.arr[cell.row][cell.column+1].isVoid) {
            edgeTypes.push("right");
        }
                
        return edgeTypes;
    },

    /*
    * Given an xCoordinate get the column that corresponds.    
    */
    getColumnIndex: function (xPosition) {
        return xPosition / this.columnWidth;
    },

    /*
    * Given a yCoordinate gets the row that corresponds.
    */
    getRowIndex: function (yPosition) {
        return yPosition / this.rowHeight;
    },

    /*
    * Determines if a block will still fit within the available space.
    */
    makeBlockFit: function (block, startingCell) {

        var maxRows = block.renderHeight / this.rowHeight;
        var maxCols = block.renderWidth / this.columnWidth;

        if (maxRows < 1 || maxCols < 1) {
            return false;
        }

        // Get Smallest Block Ratio
        var scaleFactor = 1;
        var scaleRatio = null;        
        var canFit = true;                

        while (canFit) {
            // Scale it by N            
            var testRatio = {
                height: block.calculateScaledHeight(this.columnWidth * scaleFactor),
                width: this.columnWidth * scaleFactor
            };
            var ratioRows = testRatio.height / this.rowHeight;
            var ratioCols = testRatio.width / this.columnWidth;

            // Don't go too big
            if (ratioRows > maxRows || ratioCols > maxCols) {
                break;
            }            
            
            // Check to see if it fits
            for (var row = startingCell.row; row < (startingCell.row + ratioRows) && canFit; row++) {
                for (var col = startingCell.column; col < (startingCell.column + ratioCols) && col < this.arr[row].length; col++) {
                    if (!this.arr[row][col].isAvailable) {
                        canFit = false;
                        break;
                    }
                }
            }

            // If it can, try increasing by factor of n
            if (canFit) { 
                scaleFactor++;
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
        else {
            return false;
        }                
    },

    /* 
    * @block the block object to be started in the top-left of adjacent cells
    * @cell the top-left corner of the block
    */
    blockAdjacentCells: function (block, cell) {

        var remainingHeight = block.renderHeight;
        var row = cell.row;

        while (remainingHeight >= (cell.height / 2)) {
            var remainingWidth = block.renderWidth;
            var col = cell.column;

            while (remainingWidth >= (cell.width / 2)) {

                this.arr[row][col].isAvailable = false;

                remainingWidth -= cell.width;
                col++;
            }

            remainingHeight -= cell.height;
            row++;
        }

        block.fit = true;
    },
}