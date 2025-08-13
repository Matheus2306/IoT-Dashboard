import { useState, useEffect, useRef } from "react";
import "./App.css";
import LeitorDHT from "./components/LeitorDHT";
import Paho from "paho-mqtt";
import Container from "./components/Container";

function App() {
  const [temp, setTemp] = useState("");
  const [umid, setUmid] = useState("");
  const [movimento, setMovimento] = useState("Nenhum movimento detectado");
  const movimentoTimeoutRef = useRef(null);
  const clientRef = useRef(null);

  const broker = "broker.hivemq.com";
  const port = 8884;
  const tempTopic = "sala/temperatura";
  const umidTopic = "sala/umidade";
  const garagemTopic = "garagem/basculante";
  const socialTopic = "garagem/social";
  const movimentoTopic = "garagem/movimento";

  useEffect(() => {
    const clientId = "webClient_" + Math.random().toString(16).substr(2, 8);
    const client = new Paho.Client(broker, port, clientId);
    clientRef.current = client;

    client.onConnectionLost = (responseObject) => {
      if (responseObject.errorCode !== 0) {
        console.log("Conexão perdida: " + responseObject.errorMessage);
      }
    };

    client.onMessageArrived = (message) => {
      if (message.destinationName === tempTopic) {
        setTemp(message.payloadString.slice(0, -2));
      }
      if (message.destinationName === umidTopic) {
        setUmid(message.payloadString.slice(0, -2));
      }
      if (message.destinationName === movimentoTopic) {
        try {
          const data = JSON.parse(message.payloadString);
          if (data.movimento === true) {
            setMovimento("Movimento detectado");
            if (movimentoTimeoutRef.current) {
              clearTimeout(movimentoTimeoutRef.current);
            }
            movimentoTimeoutRef.current = setTimeout(() => {
              setMovimento("Nenhum movimento detectado");
            }, 5000);
          } else {
            setMovimento("Nenhum movimento detectado");
            if (movimentoTimeoutRef.current) {
              clearTimeout(movimentoTimeoutRef.current);
            }
          }
        } catch (e) {
          setMovimento("Nenhum movimento detectado");
        }
      }
    };

    client.connect({
      onSuccess: () => {
        client.subscribe(tempTopic);
        client.subscribe(umidTopic);
        client.subscribe(movimentoTopic);
      },
      useSSL: true,
    });

    return () => {
      client.disconnect();
      if (movimentoTimeoutRef.current) {
        clearTimeout(movimentoTimeoutRef.current);
      }
    };
  }, []);

  // Funções para enviar comandos
  const abrirPortao = () => {
    if (clientRef.current && clientRef.current.isConnected()) {
      const message = new Paho.Message("abrir");
      message.destinationName = garagemTopic;
      clientRef.current.send(message);
    }
  };

  const fecharPortao = () => {
    if (clientRef.current && clientRef.current.isConnected()) {
      const message = new Paho.Message("fechar");
      message.destinationName = garagemTopic;
      clientRef.current.send(message);
    }
  };

  const abrirPortaoSocial = () => {
    if (clientRef.current && clientRef.current.isConnected()) {
      const message = new Paho.Message("abrir");
      message.destinationName = socialTopic;
      clientRef.current.send(message);
    }
  };

  const fecharPortaoSocial = () => {
    if (clientRef.current && clientRef.current.isConnected()) {
      const message = new Paho.Message("fechar");
      message.destinationName = socialTopic;
      clientRef.current.send(message);
    }
  };

  return (
    <>
      <div className="container mt-5 bg-dark rounded-2">
        <LeitorDHT temp={temp} umid={umid} />
      </div>
      <div className="row mx-4">
        <Container
          titulo="Garagem"
          intrucao="Abrir portão basculante"
          intrucao2="Abrir portão social"
          intrucao3="Sensor de movimentação"
          botaoFe="Fechar"
          botaoAb="Abrir"
          onAbrir={abrirPortao}
          onFechar={fecharPortao}
          onAbrirSocial={abrirPortaoSocial}
          onFecharSocial={fecharPortaoSocial}
          movimento={movimento}
        />
      </div>
    </>
  );
}

export default App;
