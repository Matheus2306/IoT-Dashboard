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
    <>
    {/* exibição de dados via MQTT de um dispositivo IoT esp32 */}
    <div className="container mt-5 bg-dark rounded-2">
      <LeitorDHT temp={temp} umid={umid} />
    </div>
      <div className="row mx-2 mt-5 gap-3 justify-content-center">

        <div className="bg-dark mt-3 col-12 col-md-3 rounded-2">
          <h4 className="border-bottom border-2 my-1 border-white p-2">Controle da Garagem</h4>
        </div>

        <div className="bg-dark mt-3 col-12 col-md-4 rounded-2">
        <h4 className="border-bottom border-2 my-1 border-white p-2">Controle da Sala</h4>
        </div>

        <div className="bg-dark mt-3 col-12 col-md-3 rounded-2">
        <h4 className="border-bottom border-2 my-1 border-white p-2">Controle da Sala</h4>
        </div>
        
      </div>
    </>
  );
}

export default App;
