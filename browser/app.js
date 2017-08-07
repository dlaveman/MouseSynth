// create web audio api context
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx = new AudioContext();

// create Oscillator and gain node
var oscillator = audioCtx.createOscillator();
var gainNode = audioCtx.createGain();
var distortion = audioCtx.createWaveShaper();
var panNode = audioCtx.createStereoPanner();
var convolver = audioCtx.createConvolver();

// connect oscillator to gain node to speakers
var playBack;
var oLater = true;
function init(audioType) {
  playBack = audioType;
  playBack.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  playBack.connect(panNode);
  panNode.connect(audioCtx.destination)
  playBack.connect(convolver);
}
// convolver.connect(audioCtx.destination);

var request = new XMLHttpRequest();
function audioPlayback(audioName) {
  var source = audioCtx.createBufferSource();
  request.open('GET', audioName, true);

  request.responseType = 'arraybuffer';


  request.onload = function () {
    audioCtx.decodeAudioData(request.response, function (buffer) {
      console.log(buffer);
      source.buffer = buffer;
    },
      function (e) { console.log("Error with decoding audio data" + e.err); });
  }
  request.send();
  source.loop = true;
  init(source)
}
init(oscillator)
// create initial theremin frequency and volumn values

var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

var maxFreq = 20000;
var maxVol = 0.05;

var initialFreq = 20;
var initialVol = 0.001;

// set options for the oscillator


playBack.detune.value = 100; // value in cents
playBack.start(0);

playBack.onended = function () {
  console.log('Your tone has now stopped playing!');
}

gainNode.gain.value = initialVol;

// Mouse pointer coordinates

var CurX = 1;
var CurY = .01;

// Get new mouse pointer coordinates when mouse is moved
// then set new gain and pitch values

document.onmousemove = updatePage;

function updatePage(e) {
  console.log(gainNode.gain.value)
  KeyFlag = false;

  CurX = (window.Event) ? e.pageX : event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
  CurY = (window.Event) ? e.pageY : event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);

  if (CurY > HEIGHT) CurY = HEIGHT;
  if (oLater) {
    playBack.frequency.value = ((1 - CurY / HEIGHT) * (maxFreq - initialFreq)) + initialFreq
  }
  else if (!oLater) {
    playBack.detune.value = (.5 - CurY / HEIGHT) * maxFreq
    // playBack.playbackRate.value=((playBack.detune.value+.5)/maxFreq);
  }
  panNode.pan.value = ((CurX * 2) / WIDTH) - 1;
  gainNode.gain.value = maxVol;
  // playBack.frequency.value = (CurX/WIDTH) * maxFreq;
  // gainNode.gain.value = (CurY/HEIGHT) * maxVol;

  // canvasDraw();
}

// mute button

// var mute = document.querySelector('.mute');

// mute.onclick = function() {
//   if(mute.getAttribute('data-muted') === 'false') {
//     gainNode.disconnect(audioCtx.destination);
//     panNode.disconnect(audioCtx.destination)
//     mute.setAttribute('data-muted', 'true');
//     mute.innerHTML = "Unmute";
//   } else {
//     gainNode.connect(audioCtx.destination);
//     panNode.connect(audioCtx.destination)
//     mute.setAttribute('data-muted', 'false');
//     mute.innerHTML = "Mute";
//   };
// }
var mute = false;


// // canvas visualization

// function random(number1,number2) {
//   var randomNo = number1 + (Math.floor(Math.random() * (number2 - number1)) + 1);
//   return randomNo;
// }

// var canvas = document.querySelector('.canvas');
// canvas.width = WIDTH;
// canvas.height = HEIGHT;

// var canvasCtx = canvas.getContext('2d');

// function canvasDraw() {
//   if(KeyFlag == true) {
//     rX = KeyX;
//     rY = KeyY;
//   } else {
//     rX = CurX;
//     rY = CurY;
//   }
//   rC = Math.floor((gainNode.gain.value/maxVol)*30);

//   canvasCtx.globalAlpha = 0.2;

//   for(i=1;i<=15;i=i+2) {
//     canvasCtx.beginPath();
//     canvasCtx.fillStyle = 'rgb(' + 100+(i*10) + ',' + Math.floor((gainNode.gain.value/maxVol)*255) + ',' + Math.floor((oscillator.frequency.value/maxFreq)*255) + ')';
//     canvasCtx.arc(rX+random(0,50),rY+random(0,50),rC/2+i,(Math.PI/180)*0,(Math.PI/180)*360,false);
//     canvasCtx.fill();
//     canvasCtx.closePath();
//   }
// }

// // clear screen

// var clear = document.querySelector('.clear');

// clear.onclick = function() {
//   canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
// }

// keyboard controls

var body = document.querySelector('body');

var KeyX = CurX;
var KeyY = CurY;
var KeyFlag = false;
function impulseResponse(duration, decay) {
  var sampleRate = audioCtx.sampleRate;
  var length = sampleRate * duration;
  var impulse = audioCtx.createBuffer(2, length, sampleRate);
  var impulseL = impulse.getChannelData(0);
  var impulseR = impulse.getChannelData(1);
  decay = decay || 2.0;
  for (var i = 0; i < length; i++) {
    var n = i;
    impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
    impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
  }
  convolver.buffer = impulse;
}
impulseResponse(1, 2);
// ajaxRequest = new XMLHttpRequest();

// ajaxRequest.open('GET', '../sacristy_edit_2', true);

// ajaxRequest.responseType = 'arraybuffer';


// ajaxRequest.onload = function() {
//   var audioData = ajaxRequest.response;

//   audioCtx.decodeAudioData(audioData, function(buffer) {
//       convolver.buffer=buffer;
//     }, function(e){"Error with decoding audio data" + e.err});
// }
// ajaxRequest.send();
// // var change = false;
var startPoints=[];
var audioChoice=0;
var effect = false;
var wet = false;
body.onkeydown = function (e) {
  console.log(panNode.pan.value)
  KeyFlag = true;

  // 37 is arrow left, 39 is arrow right,
  // 38 is arrow up, 40 is arrow down

  if (e.keyCode == 37) {
    KeyX -= 20;
  }

  if (e.keyCode == 39) {
    KeyX += 20;
  }

  if (e.keyCode == 38) {
    KeyY -= 20;
  }

  if (e.keyCode == 40) {
    KeyY += 20;
  }
  else {
    KeyY = CurY;
    KeyX = CurX;
  };
  // set max and min constraints for KeyX and KeyY

  if (KeyX < 1) {
    KeyX = 1;
  };

  if (KeyX > WIDTH) {
    KeyX = WIDTH;
  };

  if (KeyY < 0.01) {
    KeyY = 0.01;
  };

  if (KeyY > HEIGHT) {
    KeyY = HEIGHT;
  };
  if (oLater) {
    playBack.frequency.value = ((1 - KeyY / HEIGHT) * (maxFreq - initialFreq)) + initialFreq
  }
  else if (!oLater) {
    playBack.detune.value = (.5 - KeyY / HEIGHT) * maxFreq
    // playBack.playbackRate.value=(1-((playBack.detune.value+(initialFreq*.5))/maxFreq));
  }
  panNode.pan.value = ((KeyX * 2) / WIDTH) - 1;
  // gainNode.gain.value = maxVol;
  // oscillator.frequency.value = (KeyX/WIDTH) * maxFreq;
  // gainNode.gain.value = (KeyY/HEIGHT) * maxVol;

  // canvasDraw();
  if (e.keyCode == 32) {
    if (!mute) {
      gainNode.disconnect(audioCtx.destination);
      panNode.disconnect(audioCtx.destination);
      if (effect) convolver.disconnect(audioCtx.destination);
      mute = true;
    }
    else {
      gainNode.connect(audioCtx.destination);
      panNode.connect(audioCtx.destination);
      if (effect) convolver.connect(audioCtx.destination);
      wet = false;
      mute = false;
    }
    // distortion.curve = makeDistortionCurve(400);
    // distortion.oversample = '4x';
  }
  if (e.keyCode == 65) {
    impulseResponse(1, 2)
    if (!effect) {
      convolver.connect(audioCtx.destination);
      effect = true;
    }
    else if (mute && !wet) {
      convolver.connect(audioCtx.destination);
      wet = true;
    }
    else {
      convolver.disconnect(audioCtx.destination);
      effect = false;
      wet = false;
    }
  }
  if (e.keyCode == 83) {
    impulseResponse(2, 2);
    if (!effect) {
      convolver.connect(audioCtx.destination);
      effect = true;
    }
    else if (mute && !wet) {
      convolver.connect(audioCtx.destination);
      wet = true;
    }
    else {
      convolver.disconnect(audioCtx.destination);
      effect = false;
      wet = false;
    }
  }
  if (e.keyCode == 68) {
    impulseResponse(3, 2);
    if (!effect) {
      convolver.connect(audioCtx.destination);
      effect = true;
    }
    else if (mute && !wet) {
      convolver.connect(audioCtx.destination);
      wet = true;
    }
    else {
      convolver.disconnect(audioCtx.destination);
      effect = false;
      wet = false;
    }
  }
  if (e.keyCode == 70) {
    impulseResponse(4, 2);
    if (!effect) {
      convolver.connect(audioCtx.destination);
      effect = true;
    }
    else if (mute && !wet) {
      convolver.connect(audioCtx.destination);
      wet = true;
    }
    else {
      convolver.disconnect(audioCtx.destination);
      effect = false;
      wet = false;
    }
  }
  if(e.keyCode == 13){
    playBack.stop()
    oLater=true;
    init(oscillator);
    playBack.start()
  }
  if (e.keyCode == 81) {
    startPoints[audioChoice]=playBack.context.currentTime;
    audioChoice=1;
    playBack.stop()
    audioPlayback('Love Life.mp3')
    oLater = false;
    console.log(startPoints)
    playBack.start()
  }
  if (e.keyCode == 87) {
    startPoints[audioChoice]=playBack.context.currentTime;
    audioChoice=2;
    playBack.stop()
    audioPlayback('flock-of-seagulls_daniel-simion.mp3')
    oLater = false;
    console.log(playBack.context.currentTime)
    playBack.start(startPoints[2])
  }
  if(e.keyCode == 69){
    startPoints[audioChoice]=playBack.context.currentTime;
    audioChoice=3;
    playBack.stop()
    audioPlayback('phonering.mp3')
    oLater = false;
    playBack.start()
  }
  if(e.keyCode == 82){
    playBack.stop()
    audioPlayback('Train Whistle.mp3')
    oLater = false;
    playBack.start()
  }
  if(e.keyCode == 84){
    playBack.stop()
    audioPlayback('clock-ticking-4.mp3')
    oLater = false;
    playBack.start()
  }
  if(e.keyCode == 89){
    playBack.stop()
    audioPlayback('crowd-talking-1.mp3')
    oLater = false;
    playBack.start()
  }
  switch (e.keyCode) {
    case 49:
      maxFreq = 130.813;
      initialFreq = 20;
      break;
    case 50:
      maxFreq = 261.626;
      initialFreq = 65.406;
      break;
    case 51:
      maxFreq = 523.251;
      initialFreq = 130.813;
      break;
    case 52:
      maxFreq = 659.255;
      initialFreq = 164.814;
      break;
    case 53:
      maxFreq = 783.991;
      initialFreq = 195.998;
      break;
    case 54:
      maxFreq = 1046.502;
      initialFreq = 261.626;
      break;
    case 55:
      maxFreq = 2093.005;
      initialFreq = 523.251;
      break;
    case 56:
      maxFreq = 4186.009;
      initialFreq = 1046.502;
      break;
    case 57:
      maxFreq = 8372.018;
      initialFreq = 2093.005;
      break;
    case 48:
      maxFreq = 20000;
      initialFreq = 4186.009;
      break;
    default: maxFreq = maxFreq; initialFreq = initialFreq;
  }
}
function makeDistortionCurve(amount) {
  var k = typeof amount === 'number' ? amount : 50,
    n_samples = 44100,
    curve = new Float32Array(n_samples),
    deg = Math.PI / 180,
    i = 0,
    x;
  for (; i < n_samples; ++i) {
    x = i * 2 / n_samples - 1;
    curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
  }
  return curve;
};
