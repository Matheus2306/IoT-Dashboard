import React from "react";
import BotoesDeControleGar from "./BotoesDeControleGar";

const ContainerQuarto = (props) => {
  return (
    <div className="container-fluid mt-3">
      <div className="row justify-content-center">
        <div className="container col-12 col-md-8 col-lg-5 mx-2 rounded-2 p-3">
          <h4 className="border-bottom border-2 my-1 border-white p-2">
            {props.titulo}
          </h4>
          <BotoesDeControleGar
            intrucao="Cortina"
            botaoAb="Abrir"
            botaoFe="Fechar"
            onFechar={props.onFecharCortina}
            onAbrir={props.onAbrirCortina}
            status={props.statusCortina}
          />
          <BotoesDeControleGar
            intrucao="Luz do Quarto"
            botaoAb="Ligar"
            botaoFe="Desligar"
            onFechar={props.onDesligarLuz}
            onAbrir={props.onLigarLuz}
            status={props.statusLuz}
          />
          <BotoesDeControleGar
            intrucao="Tomada"
            botaoAb="Ligar"
            botaoFe="Desligar"
            onFechar={props.onDesligarTomada}
            onAbrir={props.onLigarTomada}
            status={props.statusTomada}
          />
        </div>
      </div>
    </div>
  );
};

export default ContainerQuarto;
