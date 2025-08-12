# 🏠 Automação Residencial com ESP32 e MQTT (Simulação Wokwi)

## 📌 Objetivo
Este projeto implementa uma automação residencial **simulada** com **ESP32** no Wokwi, utilizando **MQTT** e o broker público **broker.hivemq.com**.  
O sistema é dividido em **três ambientes**: **Garagem**, **Sala de Estar** e **Quarto**, permitindo controle automático e manual via **Dashboard** ou qualquer cliente MQTT.

---

## :tools: Como Funciona

O **ESP32** conecta-se ao WiFi e ao broker **broker.hivemq.com**, inscrevendo-se nos tópicos MQTT correspondentes a cada ambiente.  
O **Dashboard** ou qualquer cliente MQTT pode publicar mensagens nesses tópicos para acionar dispositivos.

Além disso, sensores (PIR e DHT22) enviam leituras automáticas para tópicos específicos, permitindo controle automático:

- **Garagem:** PIR acende luz por 5s ao detectar movimento. Portões acendem a luz ao abrir.  
- **Sala:** Temperatura e umidade controlam ar-condicionado e umidificador automaticamente.  
- **Quarto:** Motor de passo controla cortina por 5s para abrir/fechar.

---

## 📡 Tópicos MQTT e Comandos

### Garagem

| Função                  | Tópico                  | Payloads aceitos   |
|-------------------------|-------------------------|-------------------|
| Luz Garagem (manual)    | `garagem/luz`           | `on` / `off`      |
| Portão Social           | `garagem/social`        | `abrir` / `fechar`|
| Portão Basculante       | `garagem/basculante`    | `abrir` / `fechar`|
| Status Luz (automático) | `garagem/luz` (publish) | `on` / `off`      |

---

### Sala de Estar

| Função                   | Tópico               | Payloads aceitos   |
|--------------------------|----------------------|-------------------|
| Luz Sala                 | `sala/luz`           | `on` / `off`      |
| Ar-Condicionado          | `sala/ar`            | `on` / `off`      |
| Umidificador             | `sala/umidificador`  | `on` / `off`      |
| Temperatura (automático) | `sala/temperatura`   | valor float °C    |
| Umidade (automático)     | `sala/umidade`       | valor float %     |

---

### Quarto

| Função                | Tópico              | Payloads aceitos  |
|-----------------------|---------------------|------------------|
| Luz Quarto            | `quarto/luz`        | `on` / `off`     |
| Tomada Inteligente    | `quarto/tomada`     | `on` / `off`     |
| Cortina               | `quarto/cortina`    | `on` / `off`     |

---

## 🧪 Testando o Projeto com MQTT

Você pode testar usando o **MQTT Web Client da HiveMQ**:

1. Acesse: [https://testclient-cloud.mqtt.cool/]
2. **Configuração:**  
   - Host: `broker.hivemq.com`   
   - Client ID: qualquer identificador único  
3. Clique em **Connect**.  