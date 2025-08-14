<div align="center">

# 🏠 SmartHouse – Automação Residencial (ESP32 + MQTT + React Dashboard)

<p>
  <img src="public/dashboard-preview.png" alt="Preview do Dashboard" width="640" />
</p>

<p>
  <a href="https://react.dev" target="_blank"><img src="https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white" /></a>
  <a href="https://vitejs.dev" target="_blank"><img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" /></a>
  <a href="https://www.hivemq.com/public-mqtt-broker/" target="_blank"><img src="https://img.shields.io/badge/MQTT-HiveMQ-660066?logo=mqtt" /></a>
  <a href="https://www.espressif.com/en/products/socs/esp32" target="_blank"><img src="https://img.shields.io/badge/ESP32-Simulation-blue?logo=espressif" /></a>
  <img src="https://img.shields.io/badge/Status-Educacional-success" />
  <img src="https://img.shields.io/badge/Licença-A_Definir-lightgrey" />
</p>

Automação residencial simulada unindo **ESP32 (Wokwi)**, **sensores/atuadores** e um **dashboard web em tempo real** via **MQTT** (broker público HiveMQ). Foco em aprendizado, extensibilidade e clareza de arquitetura.

</div>

---

## ✨ Destaques

- Controle manual e automático de luzes, portões, cortina, ar‑condicionado e umidificador
- Leitura em tempo real de temperatura, umidade e movimento (PIR)
- UI responsiva com tema claro/escuro e feedback visual de conexão MQTT
- Componentização organizada (Garagem / Sala / Quarto)
- Fácil de estender (novos tópicos e atuadores)

---

## 📑 Sumário

1. [Arquitetura](#-arquitetura)
2. [Fluxo de Dados](#-fluxo-de-dados)
3. [Funcionalidades por Ambiente](#-funcionalidades)
4. [Tópicos MQTT](#-tópicos-mqtt)
5. [Dashboard Web](#️-dashboard-web)
6. [Lógica Automática (Firmware)](#-lógica-automática-firmware)
7. [Estrutura do Projeto](#-estrutura-do-projeto)
8. [Como Executar](#-como-executar)
9. [Teste Rápido via Cliente MQTT](#-teste-rápido-via-cliente-mqtt)
10. [Screenshots](#-screenshots)
11. [Extensão / Roadmap](#-extensão--roadmap)
12. [Referências](#-referências)
13. [Créditos](#-créditos)

---

## 🧩 Arquitetura

```mermaid
graph TD
  subgraph Dispositivo[ESP32 (Simulado Wokwi)]
    DHT22 --> ESP32
    PIR --> ESP32
    ServoPortao[Servos Portões]
    MotorCortina[Motor Cortina]
    Rele[LEDs / Relés]
    ESP32 --> ServoPortao
    ESP32 --> MotorCortina
    ESP32 --> Rele
  end
  ESP32 <--> MQTT[Broker MQTT (HiveMQ)]
  MQTT <--> UI[Dashboard React]
```

### Tecnologias

- Firmware: ESP32 (simulado no Wokwi) + biblioteca MQTT (lado microcontrolador)
- Transporte: Broker público HiveMQ (`broker.hivemq.com`)
- Front-end: React + Vite + Bootstrap + Paho MQTT client
- Estilo dinâmico: Tema dark/light + micro animações CSS

---

## 🔄 Fluxo de Dados

1. Sensores (DHT22 / PIR) publicam leituras em tópicos dedicados
2. Broker repassa mensagens ao dashboard (subscrição ativa)
3. Usuário interage (botões) → dashboard publica comandos (ex: `garagem/basculante: abrir`)
4. Firmware executa ação física e (idealmente) responde estado atualizado
5. UI reflete estado e mostra feedback de conexão

---

## 🚦 Funcionalidades

### Garagem

- Portão Basculante: abrir / fechar
- Portão Social: abre e fecha automaticamente após timeout (ex.: 5s)
- Luz da Garagem: controle e/ou acionamento automático por movimento
- Sensor PIR: detecção (temporização para "Nenhum movimento")

### Sala de Estar

- Luz: controle direto
- Ar-Condicionado: automatiza por faixa térmica (≥ 28 °C liga / < 20 °C desliga)
- Umidificador: liga ≤ 20% / desliga ≥ 80%
- DHT22: publica temperatura e umidade em intervalo periódico

### Quarto

- Cortina: abrir / fechar
- Luz: controle manual
- Tomada Inteligente: ligar / desligar

---

## 📡 Tópicos MQTT

| Ambiente | Função            | Tópico               | Payloads / Formato             |
| -------- | ----------------- | -------------------- | ------------------------------ | -------- |
| Garagem  | Luz               | `garagem/luz`        | `on` / `off`                   |
| Garagem  | Portão Social     | `garagem/social`     | `abrir` / `fechar`             |
| Garagem  | Portão Basculante | `garagem/basculante` | `abrir` / `fechar`             |
| Garagem  | Movimento (PIR)   | `garagem/movimento`  | `{ "movimento": true           | false }` |
| Sala     | Luz               | `sala/luz`           | `on` / `off`                   |
| Sala     | Ar-Condicionado   | `sala/ar`            | `on` / `off`                   |
| Sala     | Umidificador      | `sala/umidificador`  | `on` / `off`                   |
| Sala     | Temperatura       | `sala/temperatura`   | número (ex.: `24.3`)           |
| Sala     | Umidade           | `sala/umidade`       | número (ex.: `55.2`)           |
| Quarto   | Luz               | `quarto/luz`         | `on` / `off`                   |
| Quarto   | Tomada            | `quarto/tomada`      | `on` / `off`                   |
| Quarto   | Cortina           | `quarto/cortina`     | `on` / `off` (ou estado final) |

> Recomenda-se padronizar estados de retorno (ex.: publicar `aberta` / `fechada` após ação da cortina) para sincronização confiável.

---

## 🖥️ Dashboard Web

| Componente                | Papel                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `App.jsx`                 | Core da aplicação: inicia cliente MQTT, gerencia estados globais, tema e roteia propriedades para os módulos |
| `Container.jsx`           | Painel Garagem (portões, luz, movimento)                                                                     |
| `ContainerSala.jsx`       | Painel Sala (luz, ar, umidificador + leitura DHT)                                                            |
| `ContainerQuarto.jsx`     | Painel Quarto (cortina, luz, tomada)                                                                         |
| `BotoesDeControleGar.jsx` | Botão inteligente reutilizável (toggle, ripple, estado ativo)                                                |
| `LeitorDHT.jsx`           | Exibição dedicada de temperatura/umidade (uso opcional)                                                      |

### UI / UX

- Indicador de conexão animado (conectando / conectado / desconectado)
- Tema persistido via `localStorage`
- Botões com animações (ripple + brilho dinâmico)
- Adaptação responsiva (grid Bootstrap)

---

## 🤖 Lógica Automática (Firmware)

O código do ESP32 (não incluído neste repositório de dashboard) deve implementar regras como:

```pseudo
// Temperatura
if (temperatura >= 28) publicar "on" em sala/ar
else if (temperatura < 20) publicar "off" em sala/ar

// Umidade
if (umidade <= 20) publicar "on" em sala/umidificador
else if (umidade >= 80) publicar "off" em sala/umidificador

// Movimento -> Luz da Garagem
if (movimento) publicar {"movimento": true} e (opcional) acender luz
```

Sugestão: sempre que um comando for recebido, publicar novamente o estado final confirmando a ação (idempotência / sincronização).

---

## 🗂️ Estrutura do Projeto

```
.
├── public/
│   ├── dashboard-preview.png
│   ├── garagem.png
│   ├── sala.png
│   └── quarto.png
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── components/
│       ├── BotoesDeControleGar.jsx
│       ├── Container.jsx
│       ├── ContainerSala.jsx
│       ├── ContainerQuarto.jsx
│       └── LeitorDHT.jsx
├── package.json
├── vite.config.js
└── README.md
```

---

## 🚀 Como Executar

### Pré‑requisitos

- Node.js 18+ (recomendado)
- Acesso à Internet (broker público)

### Passos

```bash
npm install
npm run dev
```

Por padrão o Vite exibirá a URL no terminal (ex.: `http://localhost:5173`). Caso deseje expor em outra porta:

```bash
npm run dev -- --port 5000
```

Acesse: http://localhost:5000 (ou a porta mostrada).

### Simulação ESP32 (Wokwi)

1. Abra https://wokwi.com/
2. Crie um projeto ESP32
3. Adicione DHT22, PIR, servos, motor de passo / relés conforme necessidade
4. Cole/adapte o firmware com os tópicos acima
5. Execute e monitore o console MQTT

---

## 🧪 Teste Rápido via Cliente MQTT

1. Acesse: https://testclient-cloud.mqtt.cool/
2. Host: `broker.hivemq.com` | Porta WebSocket segura: `8884` (ou ws padrão 8000 se configurado no firmware)
3. Subscriba nos tópicos: `sala/#`, `garagem/#`, `quarto/#`
4. Publique comandos (ex.: tópico `garagem/basculante`, payload `abrir`)

---

## 🖼️ Screenshots

| Garagem                        | Sala                     | Quarto                       |
| ------------------------------ | ------------------------ | ---------------------------- |
| ![Garagem](public/garagem.png) | ![Sala](public/sala.png) | ![Quarto](public/quarto.png) |

> Se as imagens não aparecerem, confirme se estão presentes em `public/` ou substitua pelos seus próprios prints.

---

## 🧭 Extensão / Roadmap

- [ ] Feedback de estado vindo 100% do firmware (evitar estados assumidos no front)
- [ ] Persistência opcional (historizar leituras)
- [ ] Modo simulação local (mock MQTT)
- [ ] Autenticação MQTT privada / TLS customizado
- [ ] Controle por voz / Web Speech API
- [ ] Gráficos históricos (ex.: Recharts / Chart.js)
- [ ] Notificações push (ex.: movimento detectado)

Contribuições são bem-vindas! Abra uma issue descrevendo melhorias / bugs.

---

## 📚 Referências

- https://mqtt.org/
- https://www.hivemq.com/public-mqtt-broker/
- https://wokwi.com/
- https://react.dev/
- https://getbootstrap.com/

---

## 👥 Créditos

Projeto educacional desenvolvido por **Matheus, Bryan e João**.  
Objetivo: estudo de IoT, MQTT e interfaces reativas.

> Licença: defina (ex.: MIT) antes de uso em produção.

---

Se este projeto te ajudou, deixe uma ⭐ e compartilhe! 😉
