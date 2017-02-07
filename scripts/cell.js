Cell = function(row, column, height, width) { 
    this.row = row;
    this.column = column;
    this.height = height;
    this.width = width;
}


Cell.prototype = {

    getLeftEdge: function() { 
        return this.column * this.width;
    },

    getRightEdge: function() {
        return this.getLeftEdge() + this.width;
    },

    getTopEdge: function() { 
        return this.row * this.height;
    },

    getBottomEdge: function()  {
        return this.getTopEdge() + this.height;
    }

}