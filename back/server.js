const { SerialPort } = require("serialport");
const { WebSocketServer } = require("ws");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

// servidor WebSocket
const wss = new WebSocketServer({ port: 3001 });

// Buffer para acumular os dados
let buffer = "";

// Função para enviar dados para todos os clientes WebSocket conectados
function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(data);
    }
  });
}

// Função para simular dados do Arduino
function startSimulation() {
  console.log("Modo simulado ativado: enviando dados falsos via WebSocket.");

  setInterval(() => {
    const leituraSensor = Math.floor(Math.random() * 900) + 100; // 100-999
    const umidade = Math.floor(Math.random() * 80) + 10; // 10-90
    const consumoAgua = (Math.random() * 10).toFixed(1); // 0.0-10.0
    const consumoEnergia = (Math.random() * 5).toFixed(1); // 0.0-5.0
    const statusSoloOptions = ["Seco", "Úmido", "Encharcado", "Ideal"];
    const statusSolo = statusSoloOptions[Math.floor(Math.random() * statusSoloOptions.length)];

    broadcast(`Leitura do Sensor: ${leituraSensor} | Umidade: ${umidade}%`);
    broadcast(`Consumo de água: ${consumoAgua} L`);
    broadcast(`Consumo de energia: ${consumoEnergia} Wh`);
    broadcast(`Status do solo: ${statusSolo}`);
  }, 5000);
}

// Tenta abrir a porta serial COM3
let port;
try {
  port = new SerialPort({
    path: "COM3",
    baudRate: 9600,
  });

  port.on("open", () => {
    console.log("Porta serial COM3 aberta com sucesso.");
  });

  port.on("data", (data) => {
    buffer += data.toString();
    let lines = buffer.split("\n");

    if (lines.length > 1) {
      for (let i = 0; i < lines.length - 1; i++) {
        const valor = lines[i].trim();
        if (valor) {
          console.log("Arduino:", valor);
          broadcast(valor);
        }
      }
      buffer = lines[lines.length - 1];
    }
  });

  port.on("error", (err) => {
    console.error("Erro na porta serial:", err.message);
    console.log("Iniciando modo simulado devido ao erro na porta serial.");
    startSimulation();
  });
} catch (err) {
  console.error("Erro ao tentar abrir a porta serial:", err.message);
  console.log("Iniciando modo simulado devido ao erro ao abrir a porta serial.");
  startSimulation();
}

// servidor HTTP simples
app.get("/ping", (req, res) => {
  res.send("Servidor Node rodando!");
});

app.listen(3000, () => console.log("HTTP em http://localhost:3000"));
console.log("WebSocket em ws://localhost:3001");
