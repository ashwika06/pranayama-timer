/* =========================
   Service Worker
========================= */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}

/* =========================
   State
========================= */
let pranayamas = [];
let cooldownTime = 30;
let timerInterval = null;
let isStopped = false;

/* =========================
   Add / Delete
========================= */
function addPranayama() {
  const name = document.getElementById("name").value;
  const min = parseInt(document.getElementById("min").value || 0);
  const sec = parseInt(document.getElementById("sec").value || 0);

  const totalSeconds = min * 60 + sec;
  if (!name || totalSeconds <= 0) return;

  pranayamas.push({ name, duration: totalSeconds });
  saveData();
  renderList();
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
}

/* =========================
   Core Flow
========================= */
function runPranayama(index) {
  if (isStopped) return;

  if (index >= pranayamas.length) {
    document.getElementById("current").textContent = "Session Complete 🙏";
    document.getElementById("timer").textContent = "";
    return;
  }

  document.getElementById("current").textContent = pranayamas[index].name;

  startTimer(pranayamas[index].duration, () => {
    if (index < pranayamas.length - 1) {
      document.getElementById("current").textContent = "Cooldown";
      startTimer(cooldownTime, () => runPranayama(index + 1));
    } else {
      runPranayama(index + 1);
    }
  });
}

/* =========================
   Timer
========================= */
function startTimer(seconds, callback) {
  let time = seconds;
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    if (isStopped) {
      clearInterval(timerInterval);
      return;
    }

    document.getElementById("timer").textContent = formatTime(time);
    time--;

    if (time < 0) {
      clearInterval(timerInterval);
      notifyEnd();
      callback();
    }
  }, 1000);
}