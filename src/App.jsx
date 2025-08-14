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

  // Estado do cliente MQTT
  const [clientStatus, setClientStatus] = useState(false); // true = conectado
  const [connecting, setConnecting] = useState(true); // true = tentando conectar
  const [transitionClass, setTransitionClass] = useState(""); // classe temporária para animações
  const prevConnStateRef = useRef(null);
  const transitionTimeoutRef = useRef(null);

  useEffect(() => {
    const clientId = "webClient_" + Math.random().toString(16).substr(2, 8);
    const client = new Paho.Client(broker, port, clientId);
    clientRef.current = client;

    setConnecting(true);
    setClientStatus(false);

    client.onConnectionLost = (responseObject) => {
      setClientStatus(false);
      setConnecting(false);
      if (responseObject.errorCode !== 0) {
        console.log("Conexão perdida: " + responseObject.errorMessage);
      }
      reconnectClient();
      console.log("Reconectando ao broker MQTT...");
    };

    client.onConnectionEstablished = () => {
      setClientStatus(true);
      setConnecting(false);
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
        } catch {
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
        setClientStatus(true);
        setConnecting(false);
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
      onFailure: () => {
        setClientStatus(false);
        setConnecting(false);
      },
    });

    return () => {
      client.disconnect();
      if (movimentoTimeoutRef.current) {
        clearTimeout(movimentoTimeoutRef.current);
      }
    };
  }, []);

  // função para reconectar o cliente
  const reconnectClient = () => {
    if (clientRef.current && !clientRef.current.isConnected()) {
      setConnecting(true);
      clientRef.current.connect({
        onSuccess: () => {
          setClientStatus(true);
          setConnecting(false);
        },
        useSSL: true,
        onFailure: () => {
          setClientStatus(false);
          setConnecting(false);
        },
      });
    }
  };

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

  // Inicializa tema com base em localStorage ou preferência do sistema
  useEffect(() => {
    const STORAGE_KEY = "theme-preference";
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const systemLight = window.matchMedia(
        "(prefers-color-scheme: light)"
      ).matches;
      const initial = stored || (systemLight ? "light" : "dark");
      setTheme(initial);
      document.documentElement.setAttribute("data-theme", initial);
    } catch {
      // Falha ao acessar localStorage (modo privado / restrições)
    }
  }, []);

  // Escuta mudanças de preferência do sistema (se o usuário não fixou manualmente depois)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const listener = (ev) => {
      // Só altera automaticamente se o usuário não forçou manualmente (sem storage setado)
      if (!localStorage.getItem("theme-preference")) {
        const next = ev.matches ? "light" : "dark";
        setTheme(next);
        document.documentElement.setAttribute("data-theme", next);
      }
    };
    try {
      mq.addEventListener("change", listener);
    } catch {
      mq.addListener(listener);
    }
    return () => {
      try {
        mq.removeEventListener("change", listener);
      } catch {
        mq.removeListener(listener);
      }
    };
  }, []);

  const applyTheme = (value) => {
    setTheme(value);
    document.documentElement.setAttribute("data-theme", value);
    try {
      localStorage.setItem("theme-preference", value);
    } catch {
      /* ignore */
    }
  };

  const toggleTheme = () => {
    applyTheme(theme === "dark" ? "light" : "dark");
  };

  // Efeito para detectar transições e aplicar classes temporárias
  useEffect(() => {
    const current = connecting
      ? "connecting"
      : clientStatus
      ? "connected"
      : "disconnected";
    const prev = prevConnStateRef.current;

    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }

    // Transição: conectando -> conectado
    if (prev === "connecting" && current === "connected") {
      setTransitionClass("connected-transition");
      transitionTimeoutRef.current = setTimeout(
        () => setTransitionClass(""),
        1100
      );
    }
    // Transição: desconectado -> conectando
    if (prev === "disconnected" && current === "connecting") {
      setTransitionClass("reconnect-transition");
      transitionTimeoutRef.current = setTimeout(
        () => setTransitionClass(""),
        1300
      );
    }

    prevConnStateRef.current = current;
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [connecting, clientStatus]);

  return (
    <>
      <header className="container-fluid py-3 border-bottom border-dark mb-4">
        <div className="row g-3 align-items-center justify-content-between">
          <div className="col-12 col-md-6 d-flex align-items-center justify-content-center justify-content-md-start gap-3 text-center text-md-start">
            <div className="animationSmart">
              <i className="bi bi-house fs-3 text-light p-3 opacidade rounded-5"></i>
            </div>
            <div>
              <h2 id="title" className="mb-0">
                SmartHouse
              </h2>
              <small className="text-secondary d-block">Controle via IoT</small>
            </div>
          </div>
          <div className="col-12 col-md-6 d-flex align-items-center justify-content-center justify-content-md-end gap-3 flex-wrap">
            {/* Status de conexão com animações suaves */}
            {(() => {
              const connectionState = connecting
                ? "connecting"
                : clientStatus
                ? "connected"
                : "disconnected";
              return (
                <div
                  className={`connection-status ${connectionState} ${transitionClass}`}
                  data-conn={connectionState}
                >
                  <div className="icon">
                    <i className="bi bi-wifi wifi-icon fs-3" />
                    <i className="bi bi-wifi-off wifi-off-icon fs-3" />
                    {connectionState === "connecting" && (
                      <span className="spinner" />
                    )}
                  </div>
                  <span className="state-pill">
                    {connectionState === "connecting"
                      ? "Conectando..."
                      : connectionState === "connected"
                      ? "Conectado"
                      : "Desconectado"}
                  </span>
                </div>
              );
            })()}

            <button
              className={`theme-toggle ${theme}`}
              onClick={toggleTheme}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleTheme();
                }
              }}
              aria-label="Alternar tema claro/escuro"
              aria-pressed={theme === "light"}
              title={`Tema atual: ${theme === "dark" ? "Escuro" : "Claro"}`}
            >
              <span className="toggle-track">
                <span className="toggle-glow" />
                <span className="toggle-thumb" />
                <i className="bi bi-brightness-high sun-icon" />
                <i className="bi bi-moon moon-icon" />
              </span>
            </button>
          </div>
        </div>
      </header>
      <main className="container-fluid mt-3">
        <div className="row g-3 justify-content-center">
          <Container
            titulo="Garagem"
            intrucao="Portão basculante"
            intrucao2="Portão social"
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
            temp={temp}
            umid={umid}
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
      </main>
    </>
  );
}

export default App;
