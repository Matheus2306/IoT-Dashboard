import React, { useMemo, useRef } from "react";

const BotoesDeControleGar = (props) => {
  const {
    intrucao,
    botaoAb = "Ligar",
    botaoFe = "Desligar",
    status = "",
    onAbrir,
    onFechar,
  } = props;

  // Determina se o dispositivo/atuador está em estado "ativo"
  const isAtivo = useMemo(() => {
    const s = (status || "").toLowerCase().trim();
    if (!s) return false;
    // Normaliza separando em tokens (remove acentuação simples se necessário futuramente)
    const tokens = s
      .replace(/[.,;:|]/g, " ")
      .split(/\s+/)
      .filter(Boolean);
    const ativos = new Set([
      "aberto",
      "aberta",
      "ligado",
      "ligada",
      "on",
      "abrindo",
      "acionado",
      "acionada",
    ]);
    const inativos = new Set([
      "desligado",
      "desligada",
      "fechado",
      "fechada",
      "off",
      "parado",
    ]);

    // Se qualquer token explícito de inatividade aparecer -> inativo
    if (tokens.some((t) => inativos.has(t))) return false;
    // Ativo somente se algum token bater exatamente
    return tokens.some((t) => ativos.has(t));
  }, [status]);

  const btnRef = useRef(null);

  const handleToggle = (e) => {
    // Ripple effect
    const btn = btnRef.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + "px";
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      ripple.style.left = x + "px";
      ripple.style.top = y + "px";
      btn.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
    }

    if (isAtivo) {
      onFechar && onFechar();
    } else {
      onAbrir && onAbrir();
    }
  };

  const label = isAtivo ? botaoFe : botaoAb;
  const variantClass = isAtivo ? "btn-outline-light" : "btn-primary";

  return (
    <div className="p-4 w-100 d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center justify-content-between gap-3 border rounded-2 bg-opacity-10 desfoque mb-2">
      <div>
        <h6 className="mb-0 text-lg-start flex-grow-1 fw-semibold small d-flex align-items-center gap-2">
          {props.icon} {intrucao}
        </h6>
        <span
          className=" flex-grow-1 order-2 order-lg-2 fs-6 "
          title={`Status: ${status}`}
        >
          Status: {status}
        </span>
      </div>
      <button
        ref={btnRef}
        type="button"
        aria-pressed={isAtivo}
        data-estado={isAtivo ? "ativo" : "inativo"}
        className={`ctrl-btn px-3 py-2 rounded-2 btn btn-sm ${variantClass} flex-grow-1 order-3 order-lg-1 ${
          isAtivo ? "is-active" : ""
        }`}
        onClick={handleToggle}
      >
        <span className="ctrl-btn__shine" aria-hidden="true" />
        <span className="ctrl-btn__label">{label}</span>
      </button>
    </div>
  );
};

export default BotoesDeControleGar;
