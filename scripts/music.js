//Music selector
var select = document.getElementById('select');
var songSelector = document.getElementById("songSelector");
var play = document.getElementById("select");
var player = document.getElementById("player");
var mainSong = document.getElementById("music");

var audioURLs = {
  "song1": "music/(Official) Tower Defense Simulator OST - First Contact.mp3",
  "song2": "music/(Official) Tower Defense Simulator OST - Frost Spirit.mp3",
  "song3": "music/(Official) Tower Defense Simulator OST - Raze The Void.mp3"
}

select.addEventListener("click", function(){
  var selectedOption = songSelector.value;
  
  var audioURL = audioURLs[selectedOption];

  player.src = audioURL;
  player.play();
});

//Music volume
var e = document.querySelector('.volume-slider-con');
var eInner = document.querySelector('.volume-slider');
var audio = document.querySelector('audio');
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

