function getImageMask(image) {

    var mask = document.createElement('canvas');
    var mctx = mask.getContext('2d');

    mask.width = image.width;
    mask.height = image.height;
    mask.src = image.src;

    mctx.save();

    mctx.translate(-mask.width, 0);
    mctx.shadowColor = 'black';
    mctx.shadowOffsetX = mask.width;
    mctx.shadowOffsetY = 0;
    mctx.shadowBlur = 40;

    drawRoundedRectangle(mctx, 20, 20, image.width - 40, image.height - 40, 20);

    mctx.restore();

    mctx.globalCompositeOperation = "source-in";

    mctx.drawImage(image, 0, 0, image.width, image.height);

    return mask;
}

function drawRoundedRectangle(ctx, rectX, rectY, rectWidth, rectHeight, cornerRadius) {
    // Set faux rounded corners
    ctx.lineJoin = "round";
    ctx.lineWidth = cornerRadius;
    ctx.fillStyle = 'black';
    ctx.strokeSyle = "#000";
    // Change origin and dimensions to match true size (a stroke makes the shape a bit larger)
    ctx.strokeRect(rectX + (cornerRadius / 2), rectY + (cornerRadius / 2), rectWidth - cornerRadius, rectHeight - cornerRadius);
    ctx.fillRect(rectX + (cornerRadius / 2), rectY + (cornerRadius / 2), rectWidth - cornerRadius, rectHeight - cornerRadius);
}

function getAspectRatio(width, height) {

    var actualRatio = width / height;
    var maxResolution = 100;

    var ratios = [
		{ size: 1.778, width: maxResolution * 1.778, height: maxResolution }, //16:9
		{ size: 1.5, width: maxResolution * 1.5, height: maxResolution }, //3:2
		{ size: 1.333, width: maxResolution * 1.333, height: maxResolution }, //4:3
		{ size: 1, width: maxResolution, height: maxResolution }, // 1:1
		{ size: 0.75, width: maxResolution * 0.75, height: maxResolution }, //3:4
		{ size: 0.67, width: maxResolution * 0.67, height: maxResolution }, //2:3
		{ size: 0.5625, width: maxResolution * .5625, height: maxResolution }, //9:16
    ]

    //for (var i = 0; i < ratios.length; i++) {
    //    if (actualRatio >= ratios[i].size) {

    //        return ratios[i];
    //    }
    //}
    
        return { width: maxResolution * actualRatio, height: maxResolution };       

    //return ratios[ratios.length - 1];
}



function grayScale(context, canvas) {
    var imgData = context.getImageData(0, 0, canvas.width, canvas.height);
    var pixels = imgData.data;
    for (var i = 0, n = pixels.length; i < n; i += 4) {
        var grayscale = pixels[i] * .3 + pixels[i + 1] * .59 + pixels[i + 2] * .11;
        pixels[i] = grayscale;        // red
        pixels[i + 1] = grayscale;        // green
        pixels[i + 2] = grayscale;        // blue
        //pixels[i+3]              is alpha
    }
    //redraw the image in black & white
    context.putImageData(imgData, 0, 0);
}