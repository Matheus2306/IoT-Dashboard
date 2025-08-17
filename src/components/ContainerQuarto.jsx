import React from "react";
import useInteractiveTilt from "../hooks/useInteractiveTilt";
import BotoesDeControleGar from "./BotoesDeControleGar";

const ContainerQuarto = (props) => {
  const tiltRef = useInteractiveTilt();

  return (
    <div
      ref={tiltRef}
      className="col-12 col-sm-10 col-md-6 col-lg-4 col-xxl-3 mx-2 rounded-2 p-3 container"
      tabIndex={0}
    >
      <h4 className="border-bottom border-2 my-1 border-white p-2">
        <i className="bi bi-houses fs-4"></i> {props.titulo}
      </h4>
      <BotoesDeControleGar
        icon={<i className="bi bi-broadcast fs-5"></i>}
        intrucao="Cortina"
        botaoAb="Abrir"
        botaoFe="Fechar"
        onFechar={props.onFecharCortina}
        onAbrir={props.onAbrirCortina}
        status={props.statusCortina}
      />
      <BotoesDeControleGar
        icon={<i className="bi bi-lightbulb fs-5"></i>}
        intrucao="Luz do Quarto"
        botaoAb="Ligar"
        botaoFe="Desligar"
        onFechar={props.onDesligarLuz}
        onAbrir={props.onLigarLuz}
        status={props.statusLuz}
      />
      <BotoesDeControleGar
        icon={<i className="bi bi-plug fs-5"></i>}
        intrucao="Tomada"
        botaoAb="Ligar"
        botaoFe="Desligar"
        onFechar={props.onDesligarTomada}
        onAbrir={props.onLigarTomada}
        status={props.statusTomada}
      />
    </div>
  );
};

export default ContainerQuarto;
