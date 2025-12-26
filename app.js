/* =========================
   Service Worker
========================= */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js")
    .then(() => console.log("Service Worker registered"))
    .catch(err => console.error("Service Worker registration failed:", err));
}

/* =========================
   State
========================= */
let pranayamas = [];
let cooldownTime = 30;
let timerInterval = null;
let isStopped = false;

/* =========================
   Load / Save Data
========================= */
function saveData() {
  localStorage.setItem("pranayamas", JSON.stringify(pranayamas));
}

function loadData() {
  const saved = localStorage.getItem("pranayamas");
  if (saved) {
    pranayamas = JSON.parse(saved);
    renderList();
  }
}

window.onload = loadData;

/* =========================
   Add / Delete
========================= */
function addPranayama() {
  const name = document.getElementById("name").value.trim();
  const min = parseInt(document.getElementById("min").value || 0);
  const sec = parseInt(document.getElementById("sec").value || 0);
  const totalSeconds = min * 60 + sec;

  if (!name || totalSeconds <= 0) return;

  pranayamas.push({ name, duration: totalSeconds });
  saveData();
  renderList();

  document.getElementById("name").value = "";
  document.getElementById("min").value = "";
  document.getElementById("sec").value = "";
}

function deletePranayama(index) {
  pranayamas.splice(index, 1);
  saveData();
  renderList();
}

function renderList() {
  const list = document.getElementById("list");
  list.innerHTML = "";

  pranayamas.forEach((p, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${p.name} – ${formatTime(p.duration)}
      <button onclick="deletePranayama(${index})">❌</button>
    `;
    list.appendChild(li);
  });
}

/* =========================
   Session Control
========================= */
function startSession() {
  if (pranayamas.length === 0) return;

  isStopped = false;
  cooldownTime = parseInt(document.getElementById("cooldown").value || 0);
  saveData();
  runPranayama(0);
}

function stopSession() {
  isStopped = true;
  clearInterval(timerInterval);
  document.getElementById("current").textContent = "Stopped";
  document.getElementById("timer").textContent = "";
  document.getElementById("nextCountdown").textContent = "";
}

/* =========================
   Core Flow
========================= */
function runPranayama(index) {
  if (isStopped) return;

  if (index >= pranayamas.length) {
    document.getElementById("current").textContent = "Session Complete 🙏";
    document.getElementById("timer").textContent = "";
    document.getElementById("nextCountdown").textContent = "";
    playBell();
    return;
  }

  document.getElementById("current").textContent = pranayamas[index].name;

  startTimer(pranayamas[index].duration, () => {
    if (index < pranayamas.length - 1) {
      document.getElementById("current").textContent = "Cooldown";
      startTimer(cooldownTime, () => runPranayama(index + 1), true); // show live countdown
    } else {
      runPranayama(index + 1);
    }
  });
}

/* =========================
   Timer
========================= */
function startTimer(seconds, callback, showNext = false) {
  let time = seconds;
  clearInterval(timerInterval);

  if (seconds <= 0) {
    callback();
    return;
  }

  timerInterval = setInterval(() => {
    if (isStopped) {
      clearInterval(timerInterval);
      return;
    }

    const timeStr = formatTime(time);
    document.getElementById("timer").textContent = timeStr;

    // Show live countdown if required
    if (showNext) {
      document.getElementById("nextCountdown").textContent = `Next in: ${timeStr}`;
    } else {
      document.getElementById("nextCountdown").textContent = "";
    }

    time--;

    if (time < 0) {
      clearInterval(timerInterval);
      notifyEnd();
      callback();
    }
  }, 1000);
}

/* =========================
   Helpers
========================= */
function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function notifyEnd() {
  playBell();
}

function playBell() {
  const bell = document.getElementById("bell");
  if (bell) bell.play().catch(() => {});
}

/* =========================
   Meditation Mode
========================= */
function toggleMeditationMode() {
  document.body.classList.toggle("meditation");
}