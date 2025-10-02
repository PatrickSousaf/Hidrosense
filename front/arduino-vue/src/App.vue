<script setup>
import { ref, onMounted } from "vue";

const statusData = ref({
  leituraSensor: null,
  umidade: null,
  consumoAgua: null,
  consumoEnergia: null,
  statusSolo: null,
  ultimaAtualizacao: "Aguardando dados...",
});

const logCompleto = ref([]);

const parseArduinoData = (data) => {
  console.log("Dados recebidos:", data);

  // Adiciona ao log completo
  logCompleto.value.unshift(data);
  if (logCompleto.value.length > 50) {
    logCompleto.value = logCompleto.value.slice(0, 50); // mantém apenas os últimos 50
  }

  // Parse dos dados estruturados
  if (data.includes("Leitura do Sensor:")) {
    const match = data.match(/Leitura do Sensor: (\d+) \| Umidade: (\d+)%/);
    if (match) {
      statusData.value.leituraSensor = match[1];
      statusData.value.umidade = match[2];
    }
  }

  if (data.includes("Consumo de água:")) {
    const match = data.match(/Consumo de .*gua: ([\d.]+) L/);
    if (match) {
      statusData.value.consumoAgua = match[1];
    }
  }

  if (data.includes("Consumo de energia:")) {
    const match = data.match(/Consumo de energia: ([\d.]+) Wh/);
    if (match) {
      statusData.value.consumoEnergia = match[1];
    }
  }

  if (data.includes("Status do solo:")) {
    const match = data.match(/Status do solo: (.+)/);
    if (match) {
      statusData.value.statusSolo = match[1];
    }
  }

  statusData.value.ultimaAtualizacao = new Date().toLocaleTimeString();
};

onMounted(() => {
  // conecta no servidor Node (WebSocket)
  const socket = new WebSocket("ws://localhost:3001");

  socket.onopen = () => {
    console.log("Conectado ao servidor WebSocket");
  };

  socket.onmessage = (event) => {
    parseArduinoData(event.data);
  };

  socket.onerror = (err) => {
    console.error("Erro WebSocket:", err);
  };
});
</script>

<template>
  <div
    style="
      padding: 2rem;
      font-family: sans-serif;
      max-width: 800px;
      margin: 0 auto;
    "
  >
    <h1>🌱 Sistema de Monitoramento Arduino</h1>

    <!-- Status Cards -->
    <div
      style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        margin: 2rem 0;
      "
    >
      <!-- Card Sensor -->
      <div
        style="
          background: #f0f8ff;
          padding: 1.5rem;
          border-radius: 8px;
          border-left: 4px solid #4a90e2;
        "
      >
        <h3 style="margin: 0 0 1rem 0; color: #4a90e2">📊 Sensor</h3>
        <p><strong>Leitura:</strong> {{ statusData.leituraSensor || "--" }}</p>
        <p>
          <strong>Umidade:</strong>
          {{ statusData.umidade ? statusData.umidade + "%" : "--" }}
        </p>
      </div>

      <!-- Card Consumo -->
      <div
        style="
          background: #f0fff0;
          padding: 1.5rem;
          border-radius: 8px;
          border-left: 4px solid #50c878;
        "
      >
        <h3 style="margin: 0 0 1rem 0; color: #50c878">⚡ Consumo</h3>
        <p>
          <strong>Água:</strong>
          {{ statusData.consumoAgua ? statusData.consumoAgua + " L" : "--" }}
        </p>
        <p>
          <strong>Energia:</strong>
          {{
            statusData.consumoEnergia ? statusData.consumoEnergia + " Wh" : "--"
          }}
        </p>
      </div>

      <!-- Card Status -->
      <div
        style="
          background: #fff8dc;
          padding: 1.5rem;
          border-radius: 8px;
          border-left: 4px solid #ffa500;
        "
      >
        <h3 style="margin: 0 0 1rem 0; color: #ffa500">🌿 Status do Solo</h3>
        <p style="font-weight: bold; font-size: 1.1rem">
          {{ statusData.statusSolo || "Aguardando..." }}
        </p>
      </div>
    </div>

    <!-- Última atualização -->
    <div
      style="
        text-align: center;
        margin: 2rem 0;
        padding: 1rem;
        background: #f5f5f5;
        border-radius: 4px;
      "
    >
      <small>Última atualização: {{ statusData.ultimaAtualizacao }}</small>
    </div>

    <!-- Log em tempo real -->
    <details style="margin-top: 2rem">
      <summary style="cursor: pointer; font-weight: bold; padding: 0.5rem">
        📋 Log Completo (clique para expandir)
      </summary>
      <div
        style="
          background: #1e1e1e;
          color: #00ff00;
          padding: 1rem;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
          max-height: 400px;
          overflow-y: auto;
          margin-top: 1rem;
        "
      >
        <div
          v-for="(linha, index) in logCompleto"
          :key="index"
          style="margin-bottom: 0.25rem"
        >
          {{ linha }}
        </div>
        <div v-if="logCompleto.length === 0" style="color: #888">
          Aguardando dados do Arduino...
        </div>
      </div>
    </details>
  </div>
</template>
