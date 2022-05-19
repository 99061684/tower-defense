const e = document.querySelector('.volume-slider-con');
const eInner = document.querySelector('.volume-slider');
const audio = document.querySelector('audio');
var drag = false;

e.addEventListener('mousedown',function(ev){
   drag = true;
   updateBar(ev.clientX);
});

document.addEventListener('mousemove',function(ev){
   if(drag){
      updateBar(ev.clientX);
   }
});

document.addEventListener('mouseup',function(ev){
 drag = false;
});

var updateBar = function(x, vol){
    var volume = e;
    if(vol){
        percentage = vol * 100;
    } else{
        var position = x - volume.offsetLeft;
        percentage = 100 * position / volume.clientWidth;
    }if (percentage > 100){
        percentage = 100;
    }if (percentage < 0) {
        percentage = 0;
    }
    eInner.style.width = percentage +'%';
    audio.volume = percentage / 100;
};

