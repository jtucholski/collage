/// <reference path="imaging.js" />
/// <reference path="../scripts/block.js" />
/// <reference path="../scripts/collage.js" />



function loadCanvas(images) {

    
    var canvas = document.getElementById('collage');
    var context = canvas.getContext('2d');
    
    
    var blocks = [];
    
    for (var i = 0; i < images.length; i++) {
        var mask = getImageMask(images[i]);        
        var block = new Block(mask.height, mask.width, 5, 0.1);
        block.mask = mask;

        if (i % 5 == 0) {
            block.isHero = true;
        }

        
        blocks.push(block);        
    }
    
    //context.scale(0.5, 0.5);
    //var callback = function (block) {
    //    //console.log(`Image getting drawn from ${block.startY},${block.startX} to ${block.startY + block.renderHeight},${block.startX + block.renderWidth}`);
    //    context.drawImage(block.mask, block.startX, block.startY, block.renderWidth, block.renderHeight);
    //};

    var collage = new Collage(canvas.height, canvas.width, 72, 72);
     
    collage.fit(blocks);

    drawBoard(canvas, context, 72, 72);

    var blockIndex = -1;

    document.addEventListener("keypress", function (e) {
        if (e.keyCode == 13) {
            var block;
            while (blockIndex < blocks.length) {
                blockIndex++;
                if (blocks[blockIndex].fit) {
                    block = blocks[blockIndex];
                    break;
                }
            }

            if (blockIndex >= blocks.length) {
                grayScale(context, canvas);
            }

            if (block != undefined) {
                context.drawImage(block.mask, block.startX, block.startY, block.renderWidth, block.renderHeight);
            }
        }
    });       
}

function drawBoard(canvas, context, rowHeight, columnWidth) {
    var bh = canvas.height;
    var bw = canvas.width;
    var p = 0;

    for (var x = 0; x <= bw + columnWidth; x += columnWidth) {
        context.moveTo(0 + x + p, p);
        context.lineTo(0 + x + p, bh + p);
    }


    for (var x = 0; x <= bh + rowHeight; x += rowHeight) {
        context.moveTo(p, 0 + x + p);
        context.lineTo(bw + p, 0 + x + p);
    }

    context.strokeStyle = "grey";
    context.stroke();
}