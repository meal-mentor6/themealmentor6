let speech = new SpeechSynthesisUtterance();
speech.lang = "en";
function textToSpeech(data){
	data = JSON.parse(data);
	console.log(data);
	let text = data && data.length!==0 ? data.map(item=>`Number ${item.number}. ${item.step}`)+' Now Your Dish is ready to Serve!' : 'Sorry! cannot play instructions.';
	if ('speechSynthesis' in window) {
		speech.text = text;
		window.speechSynthesis.speak(speech);
	} else {
		alert("Sorry, your browser doesn't support text to speech!");
	}
}

document.querySelector("#pause").addEventListener("click", () => {
  window.speechSynthesis.pause();
});

document.querySelector("#resume").addEventListener("click", () => {
  window.speechSynthesis.resume();
});

document.querySelector("#cancel").addEventListener("click", () => {
  window.speechSynthesis.cancel();
});

document.querySelector(".range-field input").addEventListener("input", () => {
  const rate = document.querySelector(".range-field input").value;
  if(speech) speech.rate = rate;
  document.querySelector(".rate-label").innerHTML = rate;
});

// window.speechSynthesis.onvoiceschanged = () => {
//   // Get List of Voices
//   voices = window.speechSynthesis.getVoices();

//   speech.voice = voices[0];

//   // Set the Voice Select List. (Set the Index as the value, which we'll use later when the user updates the Voice using the Select Menu.)
//   let voiceSelect = document.querySelector("#voices");
//   voices.forEach((voice, i) => (voiceSelect.options[i] = new Option(voice.name, i)));
// };


// document.querySelector("#pitch").addEventListener("input", () => {
//   const pitch = document.querySelector("#pitch").value;
//   if(speech) speech.pitch = pitch;
//   document.querySelector("#pitch-label").innerHTML = pitch;
// });
