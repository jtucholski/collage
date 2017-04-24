Block = function (renderHeight, renderWidth) {
    this.renderHeight = renderHeight;
    this.renderWidth = renderWidth;
}

Block.prototype = {

    getCoordsForTopLeft: function (block) {
        var x = this.startX + 25;
        var y;

        if (this.bottomleft == undefined) {
            y = this.startY - block.renderHeight / 2;
        } else {
            y = this.bottomleft.startY - block.renderHeight + 25;
        }

        var oppositeBlock = this.getOppositeEdgeUp();
        if (oppositeBlock != undefined && oppositeBlock.startX > this.startX) {
            x = oppositeBlock.startX + 25;
        } else if (oppositeBlock != undefined && oppositeBlock.startX < this.startX) {
            block.scaleToHeight(this.bottomleft.startY - oppositeBlock.endY() + 100);       //<-- TODO: Not happy with where this is located
            y = oppositeBlock.endY() - 25;
        }

        return { x: x - block.renderWidth, y: y };
    },

    /*
    * Links block as the top left corner to 'this' current block.
    */
    linkTopLeft: function (block) {

        this.topleft = block;
        block.bottomright = this;

        var cattyCorner;
        var oppositeEdgeLeft = this.getOppositeEdgeLeft();
        var oppositeEdgeUp = this.getOppositeEdgeUp();

        if (oppositeEdgeLeft != undefined) {
            oppositeEdgeLeft.topright = block;
            block.bottomleft = oppositeEdgeLeft;

            cattyCorner = oppositeEdgeLeft.getOppositeEdgeUp();
        }

        if (oppositeEdgeUp != undefined) {
            oppositeEdgeUp.bottomleft = block;
            block.topright = oppositeEdgeUp;

            cattyCorner = oppositeEdgeUp.getOppositeEdgeLeft();
        }

        if (cattyCorner != undefined) {
            cattyCorner.bottomright = block;
            block.topleft = cattyCorner;
        }

        
        // C X
        //  O
        // X *               
    },

    getCoordsForTopRight: function (block) {
        // Get Bottom-Left Corner
        var x = this.startX + this.renderWidth - 50;
        var y = this.startY + this.renderHeight / 2 + 25;

        // Return Top-Left Corner
        return { x: x, y: y - block.renderHeight };
    },

    linkTopRight: function (block) {
        this.topright = block;
        block.bottomleft = this;

        // TODO: One more block is missing
        // X ?
        //  O
        // * X       

        var oppositeEdgeRight = this.getOppositeEdgeRight();
        var oppositeEdgeUp = this.getOppositeEdgeUp();
        var cattyCorner;

        if (oppositeEdgeRight != undefined) {
            oppositeEdgeRight.topleft = block;
            block.bottomright = oppositeEdgeRight;

            cattyCorner = oppositeEdgeRight.getOppositeEdgeUp();
        }

        
        if (oppositeEdgeUp != undefined) {
            oppositeEdgeUp.bottomright = block;
            block.topleft = oppositeEdgeUp;

            cattyCorner = oppositeEdgeUp.getOppositeEdgeRight();
        }

        if (cattyCorner != undefined) {
            cattyCorner.bottomleft = block;
            block.topright = cattyCorner;
        }

    },

    getCoordsForBottomRight: function (block) {
        var x = this.startX + this.renderWidth - 25;
        var y = this.startY + this.renderHeight / 2 - 25;


        var oppositeBlock = this.getOppositeEdgeRight();
        if (oppositeBlock != undefined && oppositeBlock.endY() >= this.endY()) {
            block.scaleToWidth(oppositeBlock.startX - this.endX() + 100);            
        }

        return { x: x, y: y };
    },

    linkBottomRight: function (block) {
        this.bottomright = block;
        block.topleft = this;

        // TODO: One more block is missing
        // * X
        //  O
        // X ?

        var oppositeEdgeRight = this.getOppositeEdgeRight();
        var oppositeEdgeDown = this.getOppositeEdgeDown();
        var cattyCorner;

        if (oppositeEdgeRight != undefined) {
            oppositeEdgeRight.bottomleft = block;
            block.topright = oppositeEdgeRight;

            cattyCorner = oppositeEdgeRight.getOppositeEdgeDown();
        }

        if (oppositeEdgeDown != undefined) {
            oppositeEdgeDown.topright = block;
            block.bottomleft = oppositeEdgeDown;

            cattyCorner = oppositeEdgeDown.getOppositeEdgeRight();
        }

        if (cattyCorner != undefined) {
            cattyCorner.topleft = block;
            block.bottomright = cattyCorner;
        }
    },

    getCoordsForBottomLeft: function (block) {
        var x = this.startX + 25;
        var y = this.startY + this.renderHeight / 2 - 25;

        return { x: x - block.renderWidth, y: y };
    },

    linkBottomLeft: function (block) {
        this.bottomleft = block;
        block.bottomright = this;

        // TODO: One more block is missing
        // X *
        //  O
        // ? X

        var oppositeEdgeLeft = this.getOppositeEdgeLeft();
        var oppositeEdgeDown = this.getOppositeEdgeDown();
        var cattyCorner;

        if (oppositeEdgeLeft != undefined) {
            oppositeEdgeLeft.bottomright = block;
            block.topleft = oppositeEdgeLeft;

            cattyCorner = oppositeEdgeLeft.getOppositeEdgeDown();
        }

        if (oppositeEdgeDown != undefined) {
            oppositeEdgeDown.topleft = block;
            block.bottomright = oppositeEdgeDown;

            cattyCorner = oppositeEdgeDown.getOppositeEdgeLeft();
        }

        if (cattyCorner != undefined) {
            cattyCorner.topright = block;
            block.bottomleft = cattyCorner;
        }
    },

    /*
    * Sets the center of the block to the provided x,y coordinate
    * @param coord object {x,y} values.
    */
    setCenter: function (coord) {
        var halfWidth = this.renderWidth / 2;
        var halfHeight = this.renderHeight / 2;

        this.startX = coord.x - halfWidth;
        this.startY = coord.y - halfHeight;
    },    

    /*
    * Sets the top-left of the block to the provided x,y coordinate
    * @param coord object {x,y} values.
    */
    setTopLeft: function (coord) {
        this.startX = coord.x;
        this.startY = coord.y;
    },

    /*
    * Scales the largest edge to the maxEdge value.
    */
    scale: function (maxEdge) {
        if (this.renderWidth > this.renderHeight) {
            this.scaleToWidth(maxEdge);
        }
        else {
            this.scaleToHeight(maxEdge);
        }
    },

    scaleToWidth: function (desiredWidth) {
        var resizedHeight = Math.round(this.calculateScaledHeight(desiredWidth));

        this.renderHeight = resizedHeight;
        this.renderWidth = desiredWidth;
    },

    scaleToHeight: function (desiredHeight) {
        var resizedWidth = Math.round(this.calculateScaledWidth(desiredHeight));

        this.renderHeight = desiredHeight;
        this.renderWidth = resizedWidth;
    },

    calculateScaledHeight: function (desiredWidth) {
        var scaledHeight = (this.renderHeight * desiredWidth) / this.renderWidth;
        return scaledHeight;
    },

    calculateScaledWidth: function (desiredHeight) {
        var scaledWidth = (this.renderWidth * desiredHeight) / this.renderHeight;
        return scaledWidth;
    },

    /*
    * Returns the final x coordinate for the block.
    */
    endX: function () {
        return this.startX + this.renderWidth;
    },

    /*
    * Returns the final y coordinate for the block.
    */
    endY: function () {
        return this.startY + this.renderHeight;
    },

    /*
    * Returns the block on the right side of the diamond by going through the bottom right or top right.
    */
    getOppositeEdgeRight: function () {
        var block = (this.bottomright != undefined) ? this.bottomright.topright : undefined;

        if (block == undefined) {
            block = (this.topright != undefined) ? this.topright.bottomright : undefined;
        }

        return block;
    },

    /*
    * Returns the block on the left side of the diamond by going through the bottom left or top left.
    */
    getOppositeEdgeLeft: function () {
        var block = (this.bottomleft != undefined) ? this.bottomleft.topleft : undefined;

        if (block == undefined) {
            block = (this.topleft != undefined) ? this.topleft.bottomleft : undefined;
        }

        return block;
    },

    /*
    * Returns the block on the top of the diamond by going through the top right or top left.
    */
    getOppositeEdgeUp: function () {
        var block = (this.topright != undefined) ? this.topright.topleft : undefined;

        if (block == undefined) {
            block = (this.topleft != undefined) ? this.topleft.topright : undefined;
        }

        return block;
    },

    /*
    * Returns the block on the bottom of the diamond by going through bottom right or bottom left.
    */
    getOppositeEdgeDown: function () {
        var block = (this.bottomright != undefined) ? this.bottomright.bottomleft : undefined;

        if (block == undefined) {
            block = (this.bottomleft != undefined) ? this.bottomleft.bottomright : undefined;
        }

        return block;
    }
};

