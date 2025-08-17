import React from "react";
import useInteractiveTilt from "../hooks/useInteractiveTilt";
import BotoesDeControleGar from "./BotoesDeControleGar";

const Container = (props) => {
  const tiltRef = useInteractiveTilt();

  return (
    <div
      ref={tiltRef}
      className="col-12 col-sm-10 col-md-6 col-lg-4 col-xxl-3 mx-2 rounded-2 p-3 container"
      tabIndex={0}
    >
      <h4 className="border-bottom border-2 my-1 border-white p-2">
        <i class="bi bi-car-front-fill"></i> {props.titulo}
      </h4>
      <BotoesDeControleGar
        icon={<i className="bi bi-door-closed fs-5"></i>}
        intrucao={props.intrucao}
        botaoAb={props.botaoAb}
        onFechar={props.onFechar}
        onAbrir={props.onAbrir}
        botaoFe={props.botaoFe}
        status={props.status}
      />
      <BotoesDeControleGar
        icon={<i className="bi bi-people-fill fs-5"></i>}
        intrucao={props.intrucao2}
        botaoAb={props.botaoAb}
        onFechar={props.onFecharSocial}
        onAbrir={props.onAbrirSocial}
        botaoFe={props.botaoFe}
        status={props.statusSocial}
      />
      <div className="p-2 w-100 d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between gap-2 small">
        <div className="fw-semibold text-center text-lg-start w-100 d-flex align-items-center gap-2 w-lg-50">
          <i className="bi bi-gear-fill fs-5"></i> {props.intrucao3}
        </div>
        <span className=" w-50 text-wrap align-self-start align-self-lg-center fs-6">
          {props.movimento}
        </span>
        <span className="badge text-bg-info align-self-start align-self-lg-center fs-6">
          Luz: {props.luz}
        </span>
      </div>
    </div>
  );
};

export default Container;
