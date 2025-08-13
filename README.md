# 🏠 Automação Residencial ESP32 + MQTT + Dashboard Web

![Dashboard Screenshot](public/dashboard-preview.png) <!-- Adicione uma imagem do dashboard se desejar -->

## ✨ Visão Geral

Este projeto simula uma automação residencial completa usando **ESP32** (via Wokwi), sensores, atuadores e um **Dashboard Web** moderno em React. A comunicação entre dispositivos e interface ocorre via **MQTT** usando o broker público **broker.hivemq.com**.

- **Controle manual e automático** de luzes, portões, cortina, ar-condicionado e umidificador.
- **Leitura em tempo real** de temperatura, umidade e movimento.
- **Interface responsiva** e intuitiva para desktop e mobile.

---

## 🧩 Arquitetura

```mermaid
graph TD
    subgraph ESP32 (Wokwi)
      DHT22 --> ESP32
      PIR --> ESP32
      Servo[Servos Portão]
      Motor[Motor Cortina]
      LEDS[LEDs/Rele]
      ESP32 --> Servo
      ESP32 --> Motor
      ESP32 --> LEDS
    end
    ESP32 <--> MQTT[Broker MQTT (HiveMQ)]
    MQTT <--> Dashboard[Dashboard React]
```

---

## 🚦 Funcionalidades

### Garagem
- **Portão Basculante**: Abrir/Fechar via servo motor.
- **Portão Social**: Abrir/Fechar via servo motor.
- **Luz Garagem**: Acende automaticamente ao detectar movimento (PIR) ou manualmente pelo dashboard.
- **Sensor PIR**: Detecta movimento e publica no MQTT.

### Sala de Estar
- **Luz Sala**: Controle manual.
- **Ar-Condicionado**: Liga automaticamente se temperatura ≥ 28°C, desliga < 20°C.
- **Umidificador**: Liga se umidade ≤ 20%, desliga ≥ 80%.
- **Sensor DHT22**: Publica temperatura e umidade periodicamente.

### Quarto
- **Cortina**: Abre/fecha via motor de passo.
- **Luz Quarto**: Controle manual.
- **Tomada Inteligente**: Controle manual.

---

## 📡 Tópicos MQTT

| Ambiente   | Função           | Tópico                   | Payloads         |
|------------|------------------|--------------------------|------------------|
| Garagem    | Luz              | `garagem/luz`            | `on` / `off`     |
| Garagem    | Portão Social    | `garagem/social`         | `abrir` / `fechar`|
| Garagem    | Portão Basculante| `garagem/basculante`     | `abrir` / `fechar`|
| Garagem    | Movimento (PIR)  | `garagem/movimento`      | `{"movimento":true}`|
| Sala       | Luz              | `sala/luz`               | `on` / `off`     |
| Sala       | Ar-Condicionado  | `sala/ar`                | `on` / `off`     |
| Sala       | Umidificador     | `sala/umidificador`      | `on` / `off`     |
| Sala       | Temperatura      | `sala/temperatura`       | valor float      |
| Sala       | Umidade          | `sala/umidade`           | valor float      |
| Quarto     | Luz              | `quarto/luz`             | `on` / `off`     |
| Quarto     | Tomada           | `quarto/tomada`          | `on` / `off`     |
| Quarto     | Cortina          | `quarto/cortina`         | `on` / `off`     |

---

## 🖥️ Dashboard Web

- Desenvolvido em [React](https://react.dev/) + [Bootstrap](https://getbootstrap.com/).
- Comunicação MQTT via [paho-mqtt](https://www.npmjs.com/package/paho-mqtt).
- Visualização dos estados em tempo real.
- Botões para controle manual dos dispositivos.

### Principais Componentes

- [`App`](src/App.jsx): Gerencia estados, conexão MQTT e integra todos os ambientes.
- [`LeitorDHT`](src/components/LeitorDHT.jsx): Mostra temperatura e umidade da sala.
- [`Container`](src/components/Container.jsx): Garagem (portões, luz, sensor PIR).
- [`ContainerSala`](src/components/ContainerSala.jsx): Sala (luz, ar, umidificador).
- [`ContainerQuarto`](src/components/ContainerQuarto.jsx): Quarto (cortina, luz, tomada).

---

## ⚡ Código ESP32 (Wokwi)

- Conecta ao WiFi e broker MQTT.
- Inscreve-se nos tópicos de comando.
- Publica status e leituras periodicamente.
- Executa comandos recebidos (abrir/fechar portão, ligar/desligar luz, etc).
- Controle automático de ar-condicionado e umidificador baseado em sensores.

> Veja o código completo do ESP32 acima para detalhes de implementação.

---

## 🚀 Como Rodar

### 1. Dashboard Web

```sh
npm install
npm run dev
```
Acesse [http://localhost:5000](http://localhost:5000)

### 2. Simulação ESP32 (Wokwi)

- Importe o código no [Wokwi](https://wokwi.com/).
- Configure os pinos conforme o código.
- Execute a simulação.

---

## 🧪 Teste com MQTT Web Client

1. Acesse: [MQTT Web Client](https://testclient-cloud.mqtt.cool/)
2. Host: `broker.hivemq.com`
3. Conecte e publique/inscreva-se nos tópicos acima.

---

## 📸 Exemplos Visuais

![Garagem](public/garagem.png)
![Sala de Estar](public/sala.png)
![Quarto](public/quarto.png)

---

## 📚 Referências

- [Documentação MQTT](https://mqtt.org/)
- [Wokwi ESP32 Simulator](https://wokwi.com/)
- [HiveMQ Broker](https://www.hivemq.com/public-mqtt-broker/)

---

> Projeto educacional para simulação de automação residencial.  
> Desenvolvido por Matheus,Bryan e João.