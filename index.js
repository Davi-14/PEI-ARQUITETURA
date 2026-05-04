import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getDatabase, ref, onValue, set, update, remove, push }
  from "https://www.gstatic.com/firebasejs/12.12.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDw6EoK299m06qkg4Duoi-oUfb54WCQQmM",
  authDomain: "pei-arquitetura-ca5b2.firebaseapp.com",
  databaseURL: "https://pei-arquitetura-ca5b2-default-rtdb.firebaseio.com",
  projectId: "pei-arquitetura-ca5b2",
  storageBucket: "pei-arquitetura-ca5b2.firebasestorage.app",
  messagingSenderId: "893043526716",
  appId: "1:893043526716:web:05c050c0ce9133d0920739"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const sensoresRef = ref(db, "sensores");
const historicoRef = ref(db, "historico");

function showToast(msg, type = "info") {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 2800);
}

onValue(sensoresRef, (snapshot) => {
  const data = snapshot.val();
  const tempEl = document.getElementById("tempValue");
  const humEl  = document.getElementById("humValue");
  const qualEl = document.getElementById("qualValue");

  if (!data) {
    tempEl.textContent = "-";
    humEl.textContent  = "-";
    qualEl.textContent = "-";
    qualEl.className   = "card-value qual";
    return;
  }

  tempEl.textContent = data.temperatura;
  humEl.textContent  = data.umidade;
  qualEl.textContent = data.qualidade;

  const classMap = { Boa: "boa", Moderada: "moderada", Ruim: "ruim" };
  qualEl.className = "card-value qual " + (classMap[data.qualidade] || "");
});

let chart = null;
let currentMetric = "temperatura";
let historicoData = [];

function buildChart(metric) {
  const emptyMsg = document.getElementById("avgEmpty");
  const label    = document.getElementById("chartLabel");

  label.textContent = "Últimas 24h — " + (metric === "temperatura" ? "Temperatura" : "Umidade");

  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const recent = historicoData.filter(d => d.timestamp >= cutoff);

  if (!recent.length) {
    emptyMsg.style.display = "block";
    if (chart) { chart.destroy(); chart = null; }
    return;
  }
  emptyMsg.style.display = "none";

  const sorted  = [...recent].sort((a, b) => a.timestamp - b.timestamp);
  const labels = sorted.map(d => {
    const date = new Date(d.timestamp);
    const time = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) + " · " + time;
  });
  const values  = sorted.map(d => d[metric]);
  const isTemp  = metric === "temperatura";
  const color   = isTemp ? "#c9623f" : "#3b82c4";
  const colorBg = isTemp ? "rgba(201,98,63,0.12)" : "rgba(59,130,196,0.12)";
  const gridCol = "rgba(255,255,255,0.04)";
  const tickCol = "rgba(255,255,255,0.25)";
  const yMin    = isTemp ? -20 : 0;
  const yMax    = isTemp ? 70 : 100;

  const dataset = {
    data: values,
    borderColor: color,
    backgroundColor: colorBg,
    pointBackgroundColor: color,
    pointRadius: 4,
    pointHoverRadius: 6,
    borderWidth: 1.5,
    fill: true,
    tension: 0
  };

  if (chart) {
    chart.data.labels = labels;
    chart.data.datasets[0] = dataset;
    chart.options.scales.y.min = yMin;
    chart.options.scales.y.max = yMax;
    chart.update();
    return;
  }

  const ctx = document.getElementById("avgChart").getContext("2d");
  chart = new Chart(ctx, {
    type: "line",
    data: { labels, datasets: [dataset] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      clip: false,
      layout: { padding: { top: 8, right: 12 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1a1a1a",
          borderColor: "rgba(255,255,255,0.1)",
          borderWidth: 0.5,
          titleColor: "rgba(255,255,255,0.4)",
          bodyColor: "#ededed",
          padding: 10,
          cornerRadius: 8
        }
      },
      scales: {
        x: {
          ticks: { color: tickCol, font: { family: "'Syne', sans-serif", size: 10 }, maxRotation: 45, autoSkip: true, maxTicksLimit: 6 },
          grid: { color: gridCol }
        },
        y: {
          min: yMin,
          max: yMax,
          ticks: { color: tickCol, font: { family: "'Syne', sans-serif", size: 10 } },
          grid: { color: gridCol }
        }
      }
    }
  });
}

window.switchTab = function(metric, btn) {
  currentMetric = metric;
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  btn.classList.add("active");
  buildChart(metric);
};

function renderHistorico(dados) {
  const list    = document.getElementById("historicoList");
  const emptyEl = document.getElementById("historicoEmpty");

  const itens = list.querySelectorAll(".historico-item");
  itens.forEach(el => el.remove());

  if (!dados.length) {
    emptyEl.style.display = "block";
    return;
  }
  emptyEl.style.display = "none";

  const qualColor = { Boa: "boa", Moderada: "moderada", Ruim: "ruim" };

  dados.sort((a, b) => b.timestamp - a.timestamp).forEach(d => {
    const date = new Date(d.timestamp);
    const hora = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) + " " +
               date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    const item = document.createElement("div");
    item.className = "historico-item";
    item.innerHTML = `
      <span class="hi-hora">${hora}</span>
      <span class="hi-temp">${d.temperatura}°C</span>
      <span class="hi-hum">${d.umidade}%</span>
      <span class="hi-qual ${qualColor[d.qualidade] || ""}">${d.qualidade}</span>
    `;
    list.appendChild(item);
  });
}

window.filtrarHistorico = function() {
  const val = document.getElementById("dateFilter").value;
  if (!val) { renderHistorico(historicoData); return; }

  const [ano, mes, dia] = val.split("-").map(Number);
  const filtrado = historicoData.filter(d => {
    const date = new Date(d.timestamp);
    return date.getFullYear() === ano && date.getMonth() + 1 === mes && date.getDate() === dia;
  });
  renderHistorico(filtrado);
};

onValue(historicoRef, (snapshot) => {
  const data = snapshot.val();
  historicoData = data ? Object.values(data) : [];
  buildChart(currentMetric);

  const dateFilter = document.getElementById("dateFilter");
  if (dateFilter.value) {
    window.filtrarHistorico();
  } else {
    renderHistorico(historicoData);
  }
});

function getInputs() {
  return {
    temp: document.getElementById("tempInput").value,
    hum:  document.getElementById("humInput").value,
    qual: document.getElementById("qualInput").value
  };
}

function validar(temp, hum, qual) {
  if (!temp || !hum || !qual) {
    showToast("Preencha todos os campos.", "error"); return false;
  }
  if (Number(temp) < -20 || Number(temp) > 70) {
    showToast("Temperatura deve estar entre -20°C e 70°C.", "error"); return false;
  }
  if (Number(hum) < 0 || Number(hum) > 100) {
    showToast("Umidade deve estar entre 0% e 100%.", "error"); return false;
  }
  return true;
}

function criarDados() {
  const { temp, hum, qual } = getInputs();
  if (!validar(temp, hum, qual)) return;

  set(ref(db, "sensores"), {
    temperatura: Number(temp),
    umidade: Number(hum),
    qualidade: qual
  }).catch(() => showToast("Erro ao criar dados.", "error"));

  push(historicoRef, {
    temperatura: Number(temp),
    umidade: Number(hum),
    qualidade: qual,
    timestamp: Date.now()
  }).then(() => showToast("Dados criados com sucesso!", "success"))
    .catch(() => showToast("Erro ao salvar histórico.", "error"));
}

function atualizarDados() {
  const { temp, hum, qual } = getInputs();
  if (!validar(temp, hum, qual)) return;

  update(ref(db, "sensores"), {
    temperatura: Number(temp),
    umidade: Number(hum),
    qualidade: qual
  }).then(() => showToast("Dados atualizados!", "info"))
    .catch(() => showToast("Erro ao atualizar.", "error"));
}

function deletarDados() {
  remove(ref(db, "sensores"))
    .then(() => showToast("Dados deletados.", "error"))
    .catch(() => showToast("Erro ao deletar.", "error"));
}

window.criarDados = criarDados;
window.atualizarDados = atualizarDados;
window.deletarDados = deletarDados;