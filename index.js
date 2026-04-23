import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getDatabase, ref, onValue, set, update, remove } 
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

onValue(sensoresRef, (snapshot) => {
  const data = snapshot.val();

  if (!data) {
    document.querySelector(".temperature-number p").innerText = "-- °C";
    document.querySelector(".humidity-number p").innerText = "--%";
    document.querySelector(".quality-status p").innerText = "--";
    return;
  }

  document.querySelector(".temperature-number p").innerText = data.temperatura + " °C";
  document.querySelector(".humidity-number p").innerText = data.umidade + "%";
  document.querySelector(".quality-status p").innerText = data.qualidade;
});

function atualizarDados() {
  const temp = document.getElementById("tempInput").value;
  const hum = document.getElementById("humInput").value;
  const qual = document.getElementById("qualInput").value;

  update(ref(db, "sensores"), {
    temperatura: Number(temp),
    umidade: Number(hum),
    qualidade: qual
  });
}

import { push } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-database.js";

function criarDados() {
    const temp = document.getElementById("tempInput").value;
    const hum = document.getElementById("humInput").value;
    const qual = document.getElementById("qualInput").value;


    set(ref(db, "sensores"), {
    temperatura: Number(temp),
    umidade: Number(hum),
    qualidade: qual
  });

push(ref(db, "historico"), {
    temperatura: Number(temp),
    umidade: Number(hum),
    qualidade: qual,
    timestamp: Date.now()
  });
}

function deletarDados() {
  remove(ref(db, "sensores"));
}

window.criarDados = criarDados;
window.atualizarDados = atualizarDados;
window.deletarDados = deletarDados;