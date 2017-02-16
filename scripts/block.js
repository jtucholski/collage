Block = function (renderHeight, renderWidth) {
    this.renderHeight = renderHeight;
    this.renderWidth = renderWidth;
}

Block.prototype = {

    scaleToWidth: function (desiredWidth) {
        var resizedHeight = (this.renderHeight * desiredWidth) / this.renderWidth;

        this.renderHeight = resizedHeight;
        this.renderWidth = desiredWidth;
    },

    scaleToHeight: function (desiredHeight) {
        var resizedWidth = (this.renderWidth * desiredHeight) / this.renderHeight;

        this.renderHeight = desiredHeight;
        this.renderWidth = resizedWidth;
    }

};