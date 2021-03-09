class Timestamp {
  constructor(time, action) {
    this.time = time;
    this.action = action;
  }
}

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const lapBtn = document.getElementById("lapBtn");
const timeEl = document.getElementById("time-string");
const lapsEl = document.getElementById("lap-history");

let tenths = 1;
let timer;
let isRunning = false;
let tsArr = [];
let elapsedTime = 0;
let blurTS;

let s = 0;
let m = 0;
let h = 0;

function onStartClick() {
  timer = setInterval(increment, 100);
  tsArr.push(new Timestamp(Date.now(), "START"));
  isRunning = true;
  startBtn.setAttribute("disabled", "true");
  stopBtn.removeAttribute("disabled");
  lapBtn.removeAttribute("disabled");
  lapBtn.innerHTML = "Lap";
}

function onStopClick() {
  tsArr.push(new Timestamp(Date.now(), "STOP"));
  clearInterval(timer);
  isRunning = false;
  startBtn.removeAttribute("disabled");
  stopBtn.setAttribute("disabled", "true");
  lapBtn.innerHTML = "Clr";
  updateLapsDisplay();
}

function onLapClick() {
  if (!isRunning) {
    tenths = 0;
    s = 0;
    m = 0;
    h = 0;
    tsArr = [];
    elapsedTime = 0;
    startBtn.removeAttribute("disabled");
    lapBtn.setAttribute("disabled", "true");
    stopBtn.setAttribute("disabled", "true");
    updateTimerDisplay();
    tenths = 1;
  } else {
    tsArr.push(new Timestamp(Date.now(), "LAP"));
  }
  updateLapsDisplay();
}

function increment() {
  updateTimerDisplay();
  tenths++;
}

function numToString(num) {
  if (num < 10) {
    return "0" + num;
  } else {
    return num.toString();
  }
}

function msToString(milis) {
  let msString = milis.toString();
  if (msString.length < 3) {
    msString = "0" + msString;
    return msToString(msString);
  } else {
    return msString;
  }
}

function updateTimerDisplay() {
  timeEl.textContent = convertToTimeString();
}

function convertToTimeString() {
  if (tenths === 10) {
    tenths = 0;
    s++;
  }
  if (s === 60) {
    s = 0;
    m++;
  }
  if (m === 60) {
    m = 0;
    h++;
  }
  return (
    h.toString().padStart(2, "0") +
    ":" +
    m.toString().padStart(2, "0") +
    ":" +
    s.toString().padStart(2, "0") +
    "." +
    tenths
  );
}

function convertMsToObject(msToConvert) {
  let s = Math.floor(msToConvert / 1000);
  let milis = msToConvert % 1000;
  let m = Math.floor(s / 60);
  s = s % 60;
  h = Math.floor(m / 60);
  m = m % 60;

  return { hours: h, minutes: m, seconds: s, miliseconds: milis };
}

function updateLapsDisplay() {
  lapsEl.innerHTML = "";
  let elapsed = 0;
  let lapCount = 0;
  for (let i = 0; i < tsArr.length; i++) {
    let current = tsArr[i];
    let currentAct = current.action;
    let currTime = current.time;
    let j = i - 1 < 0 ? 0 : i - 1;
    let prev = tsArr[j];
    let prevTime = prev.time;
    let prevAct = prev.action;
    diff = currTime - prevTime;
    if (prevAct !== "STOP") {
      elapsed += diff;
    }

    if (currentAct !== "START") {
      lapCount++;
    }

    let diffObj = convertMsToObject(diff);
    let elapObj = convertMsToObject(elapsed);
    if (i > 0 && currentAct !== "START") {
      lapsEl.innerHTML += `<p><font color=" #979797">${lapCount
        .toString()
        .padStart(2, "0")} - </font> ${numToString(
        diffObj.hours
      )}:${numToString(diffObj.minutes)}:${numToString(
        diffObj.seconds
      )}.${msToString(diffObj.miliseconds)} > ${numToString(
        elapObj.hours
      )}:${numToString(elapObj.minutes)}:${numToString(
        elapObj.seconds
      )}.${msToString(elapObj.miliseconds)}</p>`;
    }
  }
}
window.onblur = (event) => {
  blurTS = Date.now();

  if (timer && isRunning) {
    clearInterval(timer);
  } else {
    blurTS = null;
  }
};

window.onfocus = (event) => {
  let nowms = Date.now();
  if (blurTS) {
    let difftime = nowms - blurTS;
    let currentMS = tenths * 100 + s * 1000 + m * 60000 + h * 3600000;
    let newMS = difftime + currentMS;
    let currentDisplayTimeObj = convertMsToObject(newMS);
    h = currentDisplayTimeObj.hours;
    m = currentDisplayTimeObj.minutes;
    s = currentDisplayTimeObj.seconds;
    tenths = Math.floor(currentDisplayTimeObj.miliseconds / 100) + 1;
    timer = setInterval(increment, 100);
  }
  blurTS = null;
};
