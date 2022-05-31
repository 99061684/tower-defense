const select = document.getElementById('select');
const songSelector = document.getElementById("songSelector");
const player = document.getElementById("player");
const volumeSlider = document.querySelector('.volume-slider-con');
const eInner = document.querySelector('.volume-slider');
var drag = false;

var audioURLs = {
  "null": "",
  "song1": "music/(Official) Tower Defense Simulator OST - First Contact.mp3",
  "song2": "music/(Official) Tower Defense Simulator OST - Frost Spirit.mp3",
  "song3": "music/(Official) Tower Defense Simulator OST - Raze The Void.mp3",
  "song4": "music/Bad_Guy.mp3",
  "song5": "music/bills.mp3",
  "song6": "music/mr_bleu_sky.mp3"
}

select.addEventListener("click", function(){
  player.src = audioURLs[songSelector.value];
  player.play();
});

volumeSlider.addEventListener('mousedown',function(ev){
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

function updateBar(x, vol = null){
    if(vol !== null){
        percentage = vol * 100;
    } else{
        var position = x - volumeSlider.offsetLeft;
        percentage = 100 * position / volumeSlider.clientWidth;
    }if (percentage > 100){
        percentage = 100;
    }if (percentage < 0) {
        percentage = 0;
    }
    eInner.style.width = percentage +'%';
    player.volume = percentage / 100;
};