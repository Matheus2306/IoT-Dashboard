import { useState, useEffect, useRef } from "react";
import "./App.css";
import LeitorDHT from "./components/LeitorDHT";
import Paho from "paho-mqtt";
import Container from "./components/Container";
import ContainerQuarto from "./components/ContainerQuarto";
import ContainerSala from "./components/ContainerSala";

function App() {
  const [temp, setTemp] = useState("");
  const [umid, setUmid] = useState("");
  const [movimento, setMovimento] = useState("Nenhum movimento detectado");
  const [statusPortao, setStatusPortao] = useState("fechado");
  const [statusPortaoSocial, setStatusPortaoSocial] = useState("fechado"); // Novo estado
  const [statusCortina, setStatusCortina] = useState("fechada");
  const [statusLuz, setStatusLuz] = useState("desligada");
  const [statusTomada, setStatusTomada] = useState("desligada");
  const [statusLuzSala, setStatusLuzSala] = useState("desligada"); // Novo estado para a luz da sala
  const [statusArCondicionado, setStatusArCondicionado] = useState("desligado");
  const [statusUmidificador, setStatusUmidificador] = useState("desligado");
  const [theme, setTheme] = useState("dark");
  const movimentoTimeoutRef = useRef(null);
  const clientRef = useRef(null);

  const broker = "broker.hivemq.com";
  const port = 8884;
  const tempTopic = "sala/temperatura";
  const umidTopic = "sala/umidade";
  const garagemTopic = "garagem/basculante";
  const socialTopic = "garagem/social";
  const movimentoTopic = "garagem/movimento";
  const cortinaTopic = "quarto/cortina";
  const luzTopic = "quarto/luz";
  const tomadaTopic = "quarto/tomada";
  // tópicos para a sala
  const luzSalaTopic = "sala/luz";
  const arSalaTopic = "sala/ar";
  const umidificadorSalaTopic = "sala/umidificador";

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
      setStatusPortao("aberto");
    }
  };

  const fecharPortao = () => {
    if (clientRef.current && clientRef.current.isConnected()) {
      const message = new Paho.Message("fechar");
      message.destinationName = garagemTopic;
      clientRef.current.send(message);
      setStatusPortao("fechado");
    }
  };

  const abrirPortaoSocial = () => {
    if (clientRef.current && clientRef.current.isConnected()) {
      const message = new Paho.Message("abrir");
      message.destinationName = socialTopic;
      clientRef.current.send(message);
      setStatusPortaoSocial("aberto");
      setTimeout(() => {
        const fecharMsg = new Paho.Message("fechar");
        fecharMsg.destinationName = socialTopic;
        clientRef.current.send(fecharMsg);
        setStatusPortaoSocial("fechado");
      }, 5000);
    }
  };

  const abrirCortina = () => {
    if (clientRef.current && clientRef.current.isConnected()) {
      const message = new Paho.Message("on");
      message.destinationName = cortinaTopic;
      clientRef.current.send(message);
      setStatusCortina("aberta");
    }
  };

  const fecharCortina = () => {
    if (clientRef.current && clientRef.current.isConnected()) {
      const message = new Paho.Message("off");
      message.destinationName = cortinaTopic;
      clientRef.current.send(message);
      setStatusCortina("fechada");
    }
  };

  const ligarLuz = () => {
    if (clientRef.current && clientRef.current.isConnected()) {
      const message = new Paho.Message("on");
      message.destinationName = luzTopic;
      clientRef.current.send(message);
      setStatusLuz("ligada");
    }
  };

  const desligarLuz = () => {
    if (clientRef.current && clientRef.current.isConnected()) {
      const message = new Paho.Message("off");
      message.destinationName = luzTopic;
      clientRef.current.send(message);
      setStatusLuz("desligada");
    }
  };

  const ligarTomada = () => {
    if (clientRef.current && clientRef.current.isConnected()) {
      const message = new Paho.Message("on");
      message.destinationName = tomadaTopic;
      clientRef.current.send(message);
      setStatusTomada("ligada");
    }
  };

  const desligarTomada = () => {
    if (clientRef.current && clientRef.current.isConnected()) {
      const message = new Paho.Message("off");
      message.destinationName = tomadaTopic;
      clientRef.current.send(message);
      setStatusTomada("desligada");
    }
  };

  const ligarLuzSala = () => {
    if (clientRef.current && clientRef.current.isConnected()) {
      const message = new Paho.Message("on");
      message.destinationName = luzSalaTopic;
      clientRef.current.send(message);
      setStatusLuzSala("ligada");
    }
  };

  const desligarLuzSala = () => {
    if (clientRef.current && clientRef.current.isConnected()) {
      const message = new Paho.Message("off");
      message.destinationName = luzSalaTopic;
      clientRef.current.send(message);
      setStatusLuzSala("desligada");
    }
  };

  const ligarArCondicionado = () => {
    if (clientRef.current && clientRef.current.isConnected()) {
      const message = new Paho.Message("on");
      message.destinationName = arSalaTopic;
      clientRef.current.send(message);
      setStatusArCondicionado("ligado");
    }
  };

  const desligarArCondicionado = () => {
    if (clientRef.current && clientRef.current.isConnected()) {
      const message = new Paho.Message("off");
      message.destinationName = arSalaTopic;
      clientRef.current.send(message);
      setStatusArCondicionado("desligado");
    }
  };

  const ligarUmidificador = () => {
    if (clientRef.current && clientRef.current.isConnected()) {
      const message = new Paho.Message("on");
      message.destinationName = umidificadorSalaTopic;
      clientRef.current.send(message);
      setStatusUmidificador("ligado");
    }
  };

  const desligarUmidificador = () => {
    if (clientRef.current && clientRef.current.isConnected()) {
      const message = new Paho.Message("off");
      message.destinationName = umidificadorSalaTopic;
      clientRef.current.send(message);
      setStatusUmidificador("desligado");
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <>
      <div className="container mt-5">
        <button
          className="mb-3"
          onClick={toggleTheme}
          style={{ float: "right" }}
        >
          Alternar para {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
        </button>
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
          movimento={movimento}
          status={statusPortao}
          statusSocial={statusPortaoSocial} // Passa status social
        />

        <ContainerQuarto
          titulo="Quarto"
          statusTomada={statusTomada}
          statusCortina={statusCortina}
          statusLuz={statusLuz}
          onAbrirCortina={abrirCortina}
          onFecharCortina={fecharCortina}
          onLigarLuz={ligarLuz}
          onDesligarLuz={desligarLuz}
          onLigarTomada={ligarTomada}
          onDesligarTomada={desligarTomada}
        />
        <ContainerSala 
        titulo="Sala"
        intrucao="Ligar luz"
        intrucao2="Ligar ar condicionado"
        intrucao3="Ligar umidificador"
        botaoFe="Desligar"
        botaoAb="Ligar"
        onAbrir={ligarLuzSala}
        onFechar={desligarLuzSala}
        status={statusLuzSala} // Passa o status da luz da sala
        onAbrir2={ligarArCondicionado}
        onFechar2={desligarArCondicionado}
        status2={statusArCondicionado}
        onAbrir3={ligarUmidificador}
        onFechar3={desligarUmidificador}
        status3={statusUmidificador}
        />
      </div>
    </>
  );
}

export default App;
