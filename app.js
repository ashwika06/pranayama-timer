/* =========================
   Service Worker
========================= */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js")
    .then(() => console.log("Service Worker registered"))
    .catch(err => console.error("SW failed:", err));
}

/* =========================
   State
========================= */
let pranayamas = [];
let cooldownTime = 30;
let timerInterval = null;
let isStopped = false;

/* =========================
   Load / Save
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

document.addEventListener("DOMContentLoaded", loadData);

/* =========================
   Add / Delete
========================= */
function addPranayama() {
  const name = document.getElementById("name").value.trim();
  const min = parseInt(document.getElementById("min").value || 0);
  const sec = parseInt(document.getElementById("sec").value || 0);
  const total = min * 60 + sec;

  if (!name || total <= 0) return;

  pranayamas.push({ name, duration: total });
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

  pranayamas.forEach((p, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${p.name} – ${formatTime(p.duration)}
      <button onclick="deletePranayama(${i})">❌</button>
    `;
    list.appendChild(li);
  });
}

/* =========================
   Session Control
========================= */
function startSession() {
  stopAllSounds();
  if (pranayamas.length === 0) return;

  isStopped = false;
  cooldownTime = parseInt(document.getElementById("cooldown").value || 0);
  runPranayama(0);
}

function stopSession() {
  isStopped = true;
  clearInterval(timerInterval);
  stopAllSounds();

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
    playFinishSound();
    return;
  }

  document.getElementById("current").textContent = pranayamas[index].name;

  startTimer(pranayamas[index].duration, () => {
    playShortBell();

    if (index < pranayamas.length - 1 && cooldownTime > 0) {
      document.getElementById("current").textContent = "Cooldown";
      startTimer(cooldownTime, () => runPranayama(index + 1), true);
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

  timerInterval = setInterval(() => {
    if (isStopped) {
      clearInterval(timerInterval);
      return;
    }

    const t = formatTime(time);
    document.getElementById("timer").textContent = t;
    document.getElementById("nextCountdown").textContent =
      showNext ? `Next in: ${t}` : "";

    time--;

    if (time < 0) {
      clearInterval(timerInterval);
      document.getElementById("nextCountdown").textContent = "";
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

/* 🔔 Short beep */
function playShortBell() {
  const bell = document.getElementById("shortBell");
  if (!bell) return;

  bell.currentTime = 0;
  bell.play().catch(() => {});

  setTimeout(() => {
    bell.pause();
    bell.currentTime = 0;
  }, 1500);
}

/* 🎉 Long finish sound */
function playFinishSound() {
  const sound = document.getElementById("finishSound");
  if (!sound) return;

  sound.currentTime = 0;
  sound.play().catch(() => {});
}

/* 🛑 Stop all sounds */
function stopAllSounds() {
  document.querySelectorAll("audio").forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });
}

/* =========================
   Meditation Mode
========================= */
function toggleMeditationMode() {
  document.body.classList.toggle("meditation");
}
