Block = function (renderHeight, renderWidth, startingScale, increaseFactor) {
    this.renderHeight = renderHeight;
    this.renderWidth = renderWidth;
    
    this.startingScale = (startingScale == undefined) ? 1 : startingScale;
    this.increaseFactor = (increaseFactor == undefined) ? 1 : increaseFactor;

}

Block.prototype = {

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
    }
};

