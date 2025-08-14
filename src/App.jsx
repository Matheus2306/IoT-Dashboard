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
  const [statusPortao, setStatusPortao] = useState("Fechado");
  const [statusPortaoSocial, setStatusPortaoSocial] = useState("Fechado"); // Novo estado
  const [statusCortina, setStatusCortina] = useState("Fechada");
  const [statusLuz, setStatusLuz] = useState("Desligada");
  const [statusTomada, setStatusTomada] = useState("desligada");
  const [statusLuzSala, setStatusLuzSala] = useState("desligada"); // Novo estado para a luz da sala
  const [statusArCondicionado, setStatusArCondicionado] = useState("desligado");
  const [statusUmidificador, setStatusUmidificador] = useState("desligado");
  const [theme, setTheme] = useState("dark");
  const movimentoTimeoutRef = useRef(null);
  const clientRef = useRef(null);
  const [statusLuzGaragem, setStatusLuzGaragem] = useState("Desligada");

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

  // Tópicos auxiliares
  const luzGaragemTopic = "garagem/luz";

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

      //respostas para a garagem
      if (message.destinationName === luzGaragemTopic) {
        if (message.payloadString === "on") {
          setStatusLuzGaragem("Ligada");
        } else if (message.payloadString === "off") {
          setStatusLuzGaragem("Desligada");
        }
      }
      if (message.destinationName === socialTopic) {
        if (message.payloadString == "abrir") {
          console.log("deucerto");
          setStatusPortaoSocial("Aberto");
        } else if (message.payloadString == "fechar") {
          setStatusPortaoSocial("Fechado");
        }
      }

      if (message.destinationName === garagemTopic) {
        if (message.payloadString === "abrir") {
          setStatusPortao("Aberto");
        } else if (message.payloadString === "fechar") {
          setStatusPortao("Fechado");
        }
      }

      if (message.destinationName === cortinaTopic) {
        if (message.payloadString === "aberta") {
          setStatusCortina("Aberta");
        } else if (message.payloadString === "fechada") {
          setStatusCortina("Fechada");
        }
      }
      if (message.destinationName === luzTopic) {
        if (message.payloadString === "on") {
          setStatusLuz("Ligada");
        } else if (message.payloadString === "off") {
          setStatusLuz("Desligada");
        }
      }
    };

    client.connect({
      onSuccess: () => {
        client.subscribe(tempTopic);
        client.subscribe(umidTopic);
        client.subscribe(movimentoTopic);
        client.subscribe(luzGaragemTopic); // Inscreve no tópico da luz da garagem
        client.subscribe(socialTopic);
        client.subscribe(garagemTopic); // Inscreve no tópico do portão basculante
        client.subscribe(cortinaTopic);
        client.subscribe(luzTopic);
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
      setTimeout(() => {
        const fecharMsg = new Paho.Message("fechar");
        fecharMsg.destinationName = socialTopic;
        clientRef.current.send(fecharMsg);
      }, 5000);
    }
  };

  const abrirCortina = () => {
    if (clientRef.current && clientRef.current.isConnected()) {
      const message = new Paho.Message("on");
      message.destinationName = cortinaTopic;
      clientRef.current.send(message);
    }
  };

  const fecharCortina = () => {
    if (clientRef.current && clientRef.current.isConnected()) {
      const message = new Paho.Message("off");
      message.destinationName = cortinaTopic;
      clientRef.current.send(message);
    }
  };

  const ligarLuz = () => {
    if (clientRef.current && clientRef.current.isConnected()) {
      const message = new Paho.Message("on");
      message.destinationName = luzTopic;
      clientRef.current.send(message);
    }
  };

  const desligarLuz = () => {
    if (clientRef.current && clientRef.current.isConnected()) {
      const message = new Paho.Message("off");
      message.destinationName = luzTopic;
      clientRef.current.send(message);
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
      <div className="w-100 py-4 d-flex justify-content-around align-items-center border-bottom border-dark">
        <div className="col-6 col-md-5 d-flex justify-content-center align-items-center">
          <div className=" animationSmart mx-5">
            <i className="bi bi-house fs-3 text-light p-3 opacidade rounded-5"></i>
          </div>
          <div>
            <h2 id="title">SmartHouse</h2>
            <span className="text-dark-emphasis">Controle via IoT</span>
          </div>
        </div>
        <button className="mb-3 px-3 py-2 d-flex align-items-center justify-content-center rounded-5" onClick={toggleTheme}>
          {theme === "dark" ? <i className="bi bi-brightness-high fs-4"></i> : <i className="bi bi-moon fs-4"></i>}
        </button>
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
          luz={statusLuzGaragem} // Passa status da luz da garagem
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
