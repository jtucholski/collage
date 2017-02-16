Collage = function(height, width, rowHeight, columnWidth) {     

    if (rowHeight == undefined){
        rowHeight = 10;
    }
    if (columnWidth == undefined){
        columnWidth = 10;
    }

    this.rowHeight = rowHeight;
    this.columnWidth = columnWidth;


    this.initializeGrid(height, width);    
}

Collage.prototype = {


    fit: function(blocks) {
        this.fitCorners(blocks);

        var numRows = this.arr.length;
        var numColumns = this.arr[0].length;

        for (var row = 0; row < numRows; row++) {
            for (var col = 0; col < numColumns; col++) {



            }
        }

    },


    initializeGrid: function(height, width) {
                
        var numRows = height / this.rowHeight;
        var numColumns = width / this.columnWidth;
        
        this.arr = [];

        for(var row = 0; row < numRows; row++){
            this.arr[row] = [];
            for(var col = 0; col < numColumns; col++){
                this.arr[row][col] = new Cell(row, col, this.rowHeight, this.columnWidth);
            }
        }

    },

    


    // Private Methods
    fitCorners: function(blocks){

        var lastColumn = this.arr[0].length - 1;
        var lastRow = this.arr.length - 1;

        blocks[0].startX = this.arr[0][0].getLeftEdge();
        blocks[0].startY = this.arr[0][0].getTopEdge();
        this.blockAdjacentCells(blocks[0], this.arr[0][0]);
        
        blocks[1].startX = this.arr[0][lastColumn].getRightEdge() - blocks[1].renderWidth;
        blocks[1].startY = this.arr[0][lastColumn].getTopEdge();
        this.blockAdjacentCells(blocks[1], this.arr[0][this.getColumnIndex(blocks[1].startX)]);
        
        blocks[2].startX = this.arr[lastRow][0].getLeftEdge();
        blocks[2].startY = this.arr[lastRow][0].getBottomEdge() - blocks[2].renderHeight;
        this.blockAdjacentCells(blocks[2], this.arr[this.getRowIndex(blocks[2].startY)][0]);

        blocks[3].startX = this.arr[lastRow][lastColumn].getRightEdge() - blocks[3].renderWidth;
        blocks[3].startY = this.arr[lastRow][lastColumn].getBottomEdge() - blocks[3].renderHeight;
        this.blockAdjacentCells(blocks[3], this.arr[this.getRowIndex(blocks[3].startY)][this.getColumnIndex(blocks[3].startX)]);
    },

    /*
    * Given an xCoordinate get the column that corresponds.    
    */
    getColumnIndex: function(xPosition){
        return xPosition / this.columnWidth;
    },

    /*
    * Given a yCoordinate gets the row that corresponds.
    */
    getRowIndex: function(yPosition){
        return yPosition / this.rowHeight;
    },

    /*
    * Determines if a block will still fit within the available space.
    */
    makeBlockFit: function(block, startingCell) {
                
        var rows = block.renderHeight / this.rowHeight;
        var cols = block.renderWidth / this.columnWidth;

        for (var row = startingCell.row; row < rows; row++) {
            for (var col = startingCell.column; col < cols; col++) {

            }
        }

    },

    

    /* 
    * @block the block object being to be started in the top-left of adjacent cells
    * @cell the top-left corner of the block
    */
    blockAdjacentCells: function(block, cell){
        
        var remainingHeight = block.renderHeight;
        var row = cell.row;

        while(remainingHeight >= cell.height) {            
            var remainingWidth = block.renderWidth;
            var col = cell.column;

            while (remainingWidth >= cell.width) {

                this.arr[row][col].isAvailable = false;

                remainingWidth -= cell.width;
                col++;
            }

            remainingHeight -= cell.height;
            row++;
        }
    },



}