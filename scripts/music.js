const select = document.getElementById('select');
const songSelector = document.getElementById("songSelector");
const player = document.getElementById("player");

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
  var selectedOption = songSelector.value;
  var audioURL = audioURLs[selectedOption];

  player.src = audioURL;
  player.play();
});
