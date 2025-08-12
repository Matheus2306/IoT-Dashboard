import { useState, useEffect } from "react";
import "./App.css";
import LeitorDHT from "./components/LeitorDHT";
import Paho from "paho-mqtt";

function App() {
  const [temp, setTemp] = useState("");
  const [umid, setUmid] = useState("");

  const broker = "broker.hivemq.com"; // Corrigido: apenas hostname
  const port = 8884; // Porta WebSocket segura (SSL)
  const tempTopic = "sala/temperatura";
  const umidTopic = "sala/umidade";

  useEffect(() => {
    const clientId = "webClient_" + Math.random().toString(16).substr(2, 8);
    const client = new Paho.Client(broker, port, clientId);

    client.onConnectionLost = (responseObject) => {
      if (responseObject.errorCode !== 0) {
        console.log("Conexão perdida: " + responseObject.errorMessage);
      }
    };

    client.onMessageArrived = (message) => {
      if (message.destinationName === tempTopic) {
        setTemp(message.payloadString.slice(0, -1));
      }
      if (message.destinationName === umidTopic) {
        setUmid(message.payloadString.slice(0, -1));
      }
    };

    client.connect({
      onSuccess: () => {
        client.subscribe(tempTopic);
        client.subscribe(umidTopic);
      },
      useSSL: true, // SSL ativado para porta 8884
    });

    return () => {
      client.disconnect();
    };
  }, []);

  return (
    <div className="container mt-5 bg-dark rounded-2">
      <LeitorDHT temp={temp} umid={umid} />
    </div>
  );
}

export default App;
