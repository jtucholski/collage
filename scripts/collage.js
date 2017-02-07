Collage = function(height, width) {     

    this.initializeGrid(height, width);    

}

Collage.prototype = {

    initializeGrid: function(height, width) {
        
        const ROW_HEIGHT = 10;
        const COLUMN_WIDTH = 10;

        var numRows = height / ROW_HEIGHT;
        var numColumns = width / COLUMN_WIDTH;
        
        this.arr = [];

        for(var row = 0; row < numRows; row++){
            this.arr[row] = [];
            for(var col = 0; col < numColumns; col++){
                this.arr[row][col] = new Cell(row, col, ROW_HEIGHT, COLUMN_WIDTH);
            }
        }

    },

    fit: function(blocks) { 

        var lastColumn = this.arr[0].length - 1;
        var lastRow = this.arr.length - 1;

        blocks[0].startX = this.arr[0][0].getLeftEdge();
        blocks[0].startY = this.arr[0][0].getTopEdge();

        blocks[1].startX = this.arr[0][lastColumn].getRightEdge() - blocks[1].renderWidth;
        blocks[1].startY = this.arr[0][lastColumn].getTopEdge();

        blocks[2].startX = this.arr[lastRow][0].getLeftEdge();
        blocks[2].startY = this.arr[lastRow][0].getBottomEdge() - blocks[2].renderHeight;

        blocks[3].startX = this.arr[lastRow][lastColumn].getRightEdge() - blocks[3].renderWidth;
        blocks[3].startY = this.arr[lastRow][lastColumn].getBottomEdge() - blocks[3].renderHeight;
    }


}