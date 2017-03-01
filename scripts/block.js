Block = function (renderHeight, renderWidth) {
    this.renderHeight = renderHeight;
    this.renderWidth = renderWidth;
}

Block.prototype = {

    scaleToWidth: function (desiredWidth) {
        var resizedHeight = this.calculateScaledHeight(desiredWidth);

        this.renderHeight = resizedHeight;
        this.renderWidth = desiredWidth;
    },

    scaleToHeight: function (desiredHeight) {
        var resizedWidth = this.calculateScaledWidth(desiredHeight);

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
    }
};

