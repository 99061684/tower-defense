var select = document.getElementById('select');
var songSelector = document.getElementById("songSelector");
var play = document.getElementById("select");
var player = document.getElementById("player");
var mainSong = document.getElementById("music");

var audioURLs = {
  "song1": "music/(Official) Tower Defense Simulator OST - First Contact.mp3",
  "song2": "music/(Official) Tower Defense Simulator OST - Frost Spirit.mp3",
  "song3": "music/(Official) Tower Defense Simulator OST - Raze The Void.mp3",
  "song4": "music/Bad_Guy.mp3",
  "song5": "music/bills.mp3",
  "song6": "music/mr_bleu_sky.mp3"
}

select.addEventListener("click", function(){
  var selectedOption = songSelector.value;
  
  var audioURL = audioURLs[selectedOption];

  player.src = audioURL;
  player.play();
});
