import React from "react";
import useInteractiveTilt from "../hooks/useInteractiveTilt";
import BotoesDeControleGar from "./BotoesDeControleGar";

const ContainerSala = (props) => {
  const tiltRef = useInteractiveTilt();

  return (
    <div
      ref={tiltRef}
      className="col-12 col-sm-10 col-md-6 col-lg-4 col-xxl-3 mx-2 rounded-2 p-3 container"
      tabIndex={0}
    >
      <div className="border-bottom border-2 border-white mb-3">
        <h4 className=" my-1 p-2">
          <i class="bi bi-tv"></i> {props.titulo}
        </h4>
        {props.temp && props.umid ? (
          <div className="d-flex align-items-center">
            <span className="mx-3">Temperatura: {props.temp}°C</span>
            <span>Umidade: {props.umid}%</span>
          </div>
        ) : (
          <span>Nenhum dado disponível</span>
        )}
      </div>
      <BotoesDeControleGar
        icon={<i className="bi bi-lamp fs-5"></i>}
        intrucao={props.intrucao}
        botaoAb={props.botaoAb}
        onFechar={props.onFechar}
        onAbrir={props.onAbrir}
        botaoFe={props.botaoFe}
        status={props.status}
      />
      <BotoesDeControleGar
        icon={<i className="bi bi-thermometer fs-5"></i>}
        intrucao={props.intrucao2}
        botaoAb={props.botaoAb}
        onFechar={props.onFechar2}
        onAbrir={props.onAbrir2}
        botaoFe={props.botaoFe}
        status={props.status2}
      />
      <BotoesDeControleGar
        icon={<i className="bi bi-umbrella fs-5"></i>}
        intrucao={props.intrucao3}
        botaoAb={props.botaoAb}
        onFechar={props.onFechar3}
        onAbrir={props.onAbrir3}
        botaoFe={props.botaoFe}
        status={props.status3}
      />
    </div>
  );
};

export default ContainerSala;
