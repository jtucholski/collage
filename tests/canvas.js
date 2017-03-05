/// <reference path="imaging.js" />
/// <reference path="../scripts/block.js" />
/// <reference path="../scripts/collage.js" />



function loadCanvas(images) {

    
    var canvas = document.getElementById('collage');
    var context = canvas.getContext('2d');
    

    var masks = [];
    var blocks = [];

    for (var i = 0; i < images.length; i++) {
        var mask = getImageMask(images[i]);
        var ratio = getAspectRatio(mask.width, mask.height);        

        var block = new Block(ratio.height, ratio.width);

        masks.push(mask);
        blocks.push(block);        
    }        

    var collage = new Collage(canvas.height, canvas.width, 10, 10, function (index) {
        context.drawImage(masks[index], blocks[index].startX, blocks[index].startY, blocks[index].renderWidth, blocks[index].renderHeight);
    });
    //drawBoard(canvas, context, collage.rowHeight, collage.columnWidth);
    collage.fit(blocks);

    //for (var i = 0; i < masks.length; i++) {
    //    if (blocks[i].fit) {            
    //        context.drawImage(masks[i], blocks[i].startX, blocks[i].startY, blocks[i].renderWidth, blocks[i].renderHeight);
    //    }
    //}

    
    grayScale(context, canvas);
}

function drawBoard(canvas, context, rowHeight, columnWidth) {
    var bh = canvas.height;
    var bw = canvas.width;
    var p = 0;
    for (var x = 0; x <= bh; x += rowHeight) {
        context.moveTo(0 + x + p, p);
        context.lineTo(0 + x + p, bh + p);
    }


    for (var x = 0; x <= bw; x += columnWidth) {
        context.moveTo(p, 0 + x + p);
        context.lineTo(bw + p, 0 + x + p);
    }

    context.strokeStyle = "black";
    context.stroke();
}