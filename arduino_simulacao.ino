// Simulação de dados para Arduino - Sistema de Monitoramento

void setup() {
  // Inicializa a comunicação serial
  Serial.begin(9600);
  // Pequeno delay para estabilizar
  delay(1000);
}

void loop() {
  // Gera valores simulados
  int leituraSensor = random(100, 1000);  // Leitura do sensor entre 100 e 999
  int umidade = random(10, 90);          // Umidade entre 10% e 90%
  float consumoAgua = random(0, 100) / 10.0;  // Consumo de água entre 0.0 e 10.0 L
  float consumoEnergia = random(0, 50) / 10.0; // Consumo de energia entre 0.0 e 5.0 Wh

  // Status do solo aleatório
  String statusSolo;
  int statusRand = random(0, 4);
  switch (statusRand) {
    case 0:
      statusSolo = "Seco";
      break;
    case 1:
      statusSolo = "Úmido";
      break;
    case 2:
      statusSolo = "Encharcado";
      break;
    case 3:
      statusSolo = "Ideal";
      break;
  }

  // Envia os dados via serial
  Serial.print("Leitura do Sensor: ");
  Serial.print(leituraSensor);
  Serial.print(" | Umidade: ");
  Serial.print(umidade);
  Serial.println("%");

  Serial.print("Consumo de água: ");
  Serial.print(consumoAgua, 1);
  Serial.println(" L");

  Serial.print("Consumo de energia: ");
  Serial.print(consumoEnergia, 1);
  Serial.println(" Wh");

  Serial.print("Status do solo: ");
  Serial.println(statusSolo);

  // Aguarda 5 segundos antes de enviar novamente
  delay(5000);
}
