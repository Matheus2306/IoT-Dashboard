import { useState, useEffect, useRef } from "react";
import "./App.css";
import LeitorDHT from "./components/LeitorDHT"; // (aparentemente não usado no JSX atual)
import Paho, { Message } from "paho-mqtt";
import Container from "./components/Container";
import ContainerQuarto from "./components/ContainerQuarto";
import ContainerSala from "./components/ContainerSala";

function App() {
  // Estados de sensores e atuadores
  const [temp, setTemp] = useState(""); // Temperatura (sem os últimos 2 chars, provavelmente "°C")
  const [umid, setUmid] = useState(""); // Umidade (idem)
  const [movimento, setMovimento] = useState("Nenhum movimento detectado");
  const [statusPortao, setStatusPortao] = useState("Fechado"); // Portão basculante (garagem)
  const [statusPortaoSocial, setStatusPortaoSocial] = useState("Fechado"); // Portão social
  const [statusCortina, setStatusCortina] = useState("Fechada");
  const [statusLuz, setStatusLuz] = useState("Desligada"); // Luz quarto
  const [statusTomada, setStatusTomada] = useState("Desligada");
  const [statusLuzSala, setStatusLuzSala] = useState("desligada"); // Luz sala
  const [statusArCondicionado, setStatusArCondicionado] = useState("desligado");
  const [statusUmidificador, setStatusUmidificador] = useState("desligado");
  const [theme, setTheme] = useState("dark"); // Tema (dark/light)

  // Refs para timers e cliente MQTT
  const movimentoTimeoutRef = useRef(null); // Timer para resetar mensagem de movimento
  const clientRef = useRef(null); // Referência ao cliente MQTT (Paho)
  const [statusLuzGaragem, setStatusLuzGaragem] = useState("Desligada"); // Luz garagem

  // Configuração do broker MQTT
  const broker = "broker.hivemq.com";
  const port = 8884; // Porta WebSocket segura (useSSL: true)
  // Tópicos de sensores e atuadores
  const tempTopic = "sala/temperatura";
  const umidTopic = "sala/umidade";
  const garagemTopic = "garagem/basculante";
  const socialTopic = "garagem/social";
  const movimentoTopic = "garagem/movimento";
  const cortinaTopic = "quarto/cortina";
  const luzTopic = "quarto/luz";
  const tomadaTopic = "quarto/tomada";
  // Sala
  const luzSalaTopic = "sala/luz";
  const arSalaTopic = "sala/ar";
  const umidificadorSalaTopic = "sala/umidificador";
  // Auxiliar
  const luzGaragemTopic = "garagem/luz";

  // Estado de conexão do cliente MQTT
  const [clientStatus, setClientStatus] = useState(false); // true = conectado
  const [connecting, setConnecting] = useState(true); // true = tentando conectar
  const [transitionClass, setTransitionClass] = useState(""); // Classe temporária para animações de transição
  const prevConnStateRef = useRef(null); // Guarda estado anterior para detectar transições
  const transitionTimeoutRef = useRef(null); // Timer para remover classe de transição

  // Efeito inicial: cria e conecta o cliente MQTT
  useEffect(() => {
    const clientId = "webClient_" + Math.random().toString(16).substr(2, 8); // Gera ID aleatório
    const client = new Paho.Client(broker, port, clientId);
    clientRef.current = client;

    setConnecting(true);
    setClientStatus(false);

    // Handler: conexão perdida
    client.onConnectionLost = (responseObject) => {
      setClientStatus(false);
      setConnecting(false);
      if (responseObject.errorCode !== 0) {
        console.log("Conexão perdida: " + responseObject.errorMessage);
      }
      reconnectClient(); // Tenta reconectar automaticamente
      console.log("Reconectando ao broker MQTT...");
    };

    // (Algumas versões do Paho não possuem onConnectionEstablished; manter se personalizado)
    client.onConnectionEstablished = () => {
      setClientStatus(true);
      setConnecting(false);
    };

    // Handler: mensagens recebidas
    client.onMessageArrived = (message) => {
      // Temperatura
      if (message.destinationName === tempTopic) {
        setTemp(message.payloadString.slice(0, -2)); // Remove sufixo (ex: "°C")
      }
      // Umidade
      if (message.destinationName === umidTopic) {
        setUmid(message.payloadString.slice(0, -2)); // Remove sufixo
      }
      // Movimento (payload esperado: JSON com { movimento: boolean })
      if (message.destinationName === movimentoTopic) {
        try {
          const data = JSON.parse(message.payloadString);
          if (data.movimento === true) {
            setMovimento("Movimento detectado");
            if (movimentoTimeoutRef.current)
              clearTimeout(movimentoTimeoutRef.current);
            // Reseta mensagem após 5s
            movimentoTimeoutRef.current = setTimeout(() => {
              setMovimento("Nenhum movimento detectado");
            }, 5000);
          } else {
            setMovimento("Nenhum movimento detectado");
            if (movimentoTimeoutRef.current)
              clearTimeout(movimentoTimeoutRef.current);
          }
        } catch {
          // Se payload inválido, assume sem movimento
          setMovimento("Nenhum movimento detectado");
        }
      }

      // ============= Garagem ==============

      // Luz garagem
      if (message.destinationName === luzGaragemTopic) {
        if (message.payloadString == "ligada" || message.payloadString == "ligado") setStatusLuzGaragem("Ligada");
        else if (message.payloadString == "desligado")
          setStatusLuzGaragem("Desligada");
      }

      // Portão social (retornos: "aberto"/"fechado")
      if (message.destinationName === socialTopic) {
        if (message.payloadString == "aberto") setStatusPortaoSocial("Aberto");
        else if (message.payloadString == "fechado")
          setStatusPortaoSocial("Fechado");
      }

      // Portão basculante
      if (message.destinationName === garagemTopic) {
        if (message.payloadString == "aberto") setStatusPortao("aberto");
        else if (message.payloadString == "fechado")
          setStatusPortao("Fechado");
      }

      // =========== Quarto ===============

      // Cortina (aberta/fechada)
      if (message.destinationName === cortinaTopic) {
        const v = message.payloadString.trim().toLowerCase();
        if (v === "aberta") setStatusCortina("Aberta");
        else if (v === "fechada") setStatusCortina("Fechada");
      }

      // Luz quarto (ligada/desligada)
      if (message.destinationName === luzTopic) {
        const v = message.payloadString.trim().toLowerCase();
        if (v === "ligada" || v === "ligado" || v === "on") setStatusLuz("Ligada");
        else if (v === "desligada" || v === "desligado" || v === "off")
          setStatusLuz("Desligada");
      }

      // Tomada quarto (ligado/desligado)
      if (message.destinationName === tomadaTopic) {
        const raw = message.payloadString;
        const v = raw.trim().toLowerCase();
        console.log("MQTT tomada payload recebido:", raw);
        if (v === "ligado" || v === "ligada" || v === "on") {
          setStatusTomada("Ligada");
        } else if (v === "desligado" || v === "desligada" || v === "off") {
          setStatusTomada("Desligada");
        }
      }

      // ============= Sala ============

      //luz da sala (ligada/desligada)
      if (message.destinationName === luzSalaTopic) {
        if(message.payloadString == "ligada") setStatusLuzSala("Ligada");
        else if (message.payloadString == "desligada")
          setStatusLuzSala("Desligada");
      }

      //Ar condicionado (Ligado/Desligado - normaliza)
      if (message.destinationName === arSalaTopic) {
        const v = message.payloadString.trim().toLowerCase();
        if (v === "ligado" || v === "on")
          setStatusArCondicionado("Ligado");
        else if (v === "desligado" || v === "off")
          setStatusArCondicionado("Desligado");
      }

      //umidificador (ligado/desligado)
      if(message.destinationName === umidificadorSalaTopic) {
        if(message.payloadString == "ligado") setStatusUmidificador("Ligado");
        else if (message.payloadString == "desligado")
          setStatusUmidificador("Desligado");
      }
    };

    // Conecta ao broker
    client.connect({
      onSuccess: () => {
        setClientStatus(true);
        setConnecting(false);
        // Inscreve em todos os tópicos necessários
        client.subscribe(tempTopic);
        client.subscribe(umidTopic);
        client.subscribe(movimentoTopic);
        client.subscribe(luzGaragemTopic);
        client.subscribe(socialTopic);
        client.subscribe(garagemTopic);
        client.subscribe(cortinaTopic);
        client.subscribe(luzTopic);
        client.subscribe(umidificadorSalaTopic)
        client.subscribe(tomadaTopic);
        client.subscribe(luzSalaTopic);
        client.subscribe(arSalaTopic);
      },
      useSSL: true, // Conexão segura
      onFailure: () => {
        setClientStatus(false);
        setConnecting(false);
      },
    });

    // Cleanup: desconecta e limpa timers
    return () => {
      client.disconnect();
      if (movimentoTimeoutRef.current)
        clearTimeout(movimentoTimeoutRef.current);
    };
  }, []);

  // Função de reconexão (usada em onConnectionLost)
  const reconnectClient = () => {
    if (clientRef.current && !clientRef.current.isConnected()) {
      setConnecting(true);
      clientRef.current.connect({
        onSuccess: () => {
          setClientStatus(true);
          setConnecting(false);
           clientRef.current.subscribe(tempTopic);
            clientRef.current.subscribe(umidTopic);
            clientRef.current.subscribe(movimentoTopic);
            clientRef.current.subscribe(luzGaragemTopic);
            clientRef.current.subscribe(socialTopic);
            clientRef.current.subscribe(garagemTopic);
            clientRef.current.subscribe(cortinaTopic);
            clientRef.current.subscribe(luzTopic);
            clientRef.current.subscribe(tomadaTopic);           
            clientRef.current.subscribe(luzSalaTopic);      
            clientRef.current.subscribe(umidificadorSalaTopic);
            clientRef.current.subscribe(tomadaTopic);
            clientRef.current.subscribe(luzSalaTopic);
            clientRef.current.subscribe(arSalaTopic);
        },
        useSSL: true,
        onFailure: () => {
          setClientStatus(false);
          setConnecting(false);
        },
      });
    }
  };

  // Funções utilitárias para envio de mensagens MQTT (atuadores)
  const abrirPortao = () => {
    if (clientRef.current?.isConnected()) {
      const message = new Paho.Message("abrir");
      message.destinationName = garagemTopic;
      clientRef.current.send(message);
    }
  };

  const fecharPortao = () => {
    if (clientRef.current?.isConnected()) {
      const message = new Paho.Message("fechar");
      message.destinationName = garagemTopic;
      clientRef.current.send(message);
    }
  };

  const abrirPortaoSocial = () => {
    if (clientRef.current?.isConnected()) {
      const message = new Paho.Message("abrir");
      message.destinationName = socialTopic;
      clientRef.current.send(message);
      // Fecha automaticamente após 5s
      setTimeout(() => {
        const fecharMsg = new Paho.Message("fechar");
        fecharMsg.destinationName = socialTopic;
        clientRef.current.send(fecharMsg);
      }, 5000);
    }
  };

  // Cortina quarto
  const abrirCortina = () => {
    if (clientRef.current?.isConnected()) {
      const message = new Paho.Message("on");
      message.destinationName = cortinaTopic;
      clientRef.current.send(message);
    }
  };

  const fecharCortina = () => {
    if (clientRef.current?.isConnected()) {
      const message = new Paho.Message("off");
      message.destinationName = cortinaTopic;
      clientRef.current.send(message);
    }
  };

  // Luz quarto
  const ligarLuz = () => {
    if (clientRef.current?.isConnected()) {
      const message = new Paho.Message("on");
      message.destinationName = luzTopic;
      clientRef.current.send(message);
    }
  };

  const desligarLuz = () => {
    if (clientRef.current?.isConnected()) {
      const message = new Paho.Message("off");
      message.destinationName = luzTopic;
      clientRef.current.send(message);
    }
  };

  // Tomada quarto
  const ligarTomada = () => {
    if (clientRef.current?.isConnected()) {
      const message = new Paho.Message("on");
      message.destinationName = tomadaTopic;
      clientRef.current.send(message);
    }
  };

  const desligarTomada = () => {
    if (clientRef.current?.isConnected()) {
      const message = new Paho.Message("off");
      message.destinationName = tomadaTopic;
      clientRef.current.send(message);
    }
  };

  // Luz sala
  const ligarLuzSala = () => {
    if (clientRef.current?.isConnected()) {
      const message = new Paho.Message("on");
      message.destinationName = luzSalaTopic;
      clientRef.current.send(message);
    }
  };

  const desligarLuzSala = () => {
    if (clientRef.current?.isConnected()) {
      const message = new Paho.Message("off");
      message.destinationName = luzSalaTopic;
      clientRef.current.send(message);
    }
  };

  // Ar condicionado
  const ligarAr = () => {
    if (clientRef.current?.isConnected()) {
      const msg = new Paho.Message("on");
      msg.destinationName = arSalaTopic;
      clientRef.current.send(msg);
      setStatusArCondicionado("Ligado");
    }
  };

  const desligarAr = () => {
    if (clientRef.current?.isConnected()) {
      const msg = new Paho.Message("off");
      msg.destinationName = arSalaTopic;
      clientRef.current.send(msg);
      setStatusArCondicionado("Desligado");
    }
  };

  // Umidificador sala
  const ligarUmidificador = () => {
    if (clientRef.current?.isConnected()) {
      const message = new Paho.Message("on");
      message.destinationName = umidificadorSalaTopic;
      clientRef.current.send(message);
    }
  };

  const desligarUmidificador = () => {
    if (clientRef.current?.isConnected()) {
      const message = new Paho.Message("off");
      message.destinationName = umidificadorSalaTopic;
      clientRef.current.send(message);
    }
  };

  // Inicializa tema a partir do localStorage ou preferência do SO
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
      // Falha ao acessar localStorage (modo privado, etc.)
    }
  }, []);

  // Observa mudanças na preferência de cor do sistema (caso usuário não tenha fixado manualmente)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const listener = (ev) => {
      if (!localStorage.getItem("theme-preference")) {
        const next = ev.matches ? "light" : "dark";
        setTheme(next);
        document.documentElement.setAttribute("data-theme", next);
      }
    };
    try {
      mq.addEventListener("change", listener);
    } catch {
      // Fallback para navegadores antigos
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

  // Aplica e persiste o tema escolhido
  const applyTheme = (value) => {
    setTheme(value);
    document.documentElement.setAttribute("data-theme", value);
    try {
      localStorage.setItem("theme-preference", value);
    } catch {
      /* Ignora erros de armazenamento */
    }
  };

  // Alterna entre dark e light
  const toggleTheme = () => {
    applyTheme(theme === "dark" ? "light" : "dark");
  };

  // Efeito para animar transições de estado de conexão
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

    // Se recém conectou após connecting
    if (prev === "connecting" && current === "connected") {
      setTransitionClass("connected-transition");
      transitionTimeoutRef.current = setTimeout(
        () => setTransitionClass(""),
        1100
      );
    }
    // Se saiu de desconectado para tentando reconectar
    if (prev === "disconnected" && current === "connecting") {
      setTransitionClass("reconnect-transition");
      transitionTimeoutRef.current = setTimeout(
        () => setTransitionClass(""),
        1300
      );
    }

    prevConnStateRef.current = current;

    return () => {
      if (transitionTimeoutRef.current)
        clearTimeout(transitionTimeoutRef.current);
    };
  }, [connecting, clientStatus]);

  // JSX principal
  return (
    <>
      {/* Cabeçalho / Barra superior */}
      <header className="container-fluid py-3 border-bottom border-dark mb-4">
        <div className="row g-3 align-items-center justify-content-between">
          {/* Branding */}
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
          {/* Lado direito: status + toggle tema */}
          <div className="col-12 col-md-6 d-flex align-items-center justify-content-center justify-content-md-end gap-3 flex-wrap">
            {/* Bloco de status de conexão (usa IIFE para lógica inline) */}
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

            {/* Botão alternar tema */}
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

      {/* Conteúdo principal */}
      <main className="container-fluid mt-3">
        <div className="row g-3 justify-content-center">
          {/* Container Garagem */}
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
            statusSocial={statusPortaoSocial}
            luz={statusLuzGaragem}
          />

          {/* Container Quarto */}
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

          {/* Container Sala (inclui sensores de temperatura/umidade) */}
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
            status={statusLuzSala}
            onAbrir2={ligarAr}
            onFechar2={desligarAr}
            status2={statusArCondicionado}
            onAbrir3={ligarUmidificador}
            onFechar3={desligarUmidificador}
            status3={statusUmidificador}
            statusAr={statusArCondicionado}
          />
        </div>
      </main>
    </>
  );
}

export default App;
