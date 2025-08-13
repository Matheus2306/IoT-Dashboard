import React from "react";
import BotoesDeControleGar from "./BotoesDeControleGar";

const ContainerSala = (props) => {
  return (
    <div className="container-fluid mt-3">
      <div className="row justify-content-center">
        <div className="container col-12 col-md-8 col-lg-5 mx-2 rounded-2 p-3">
          <h4 className="border-bottom border-2 my-1 border-white p-2">
            {props.titulo}
          </h4>
          <BotoesDeControleGar
            intrucao={props.intrucao}
            botaoAb={props.botaoAb}
            onFechar={props.onFechar}
            onAbrir={props.onAbrir}
            botaoFe={props.botaoFe}
            status={props.status}
          />
          <BotoesDeControleGar
            intrucao={props.intrucao2}
            botaoAb={props.botaoAb}
            onFechar={props.onFechar2}
            onAbrir={props.onAbrir2}
            botaoFe={props.botaoFe}
            status={props.status2}
          />
            <BotoesDeControleGar
                intrucao={props.intrucao3}
                botaoAb={props.botaoAb}
                onFechar={props.onFechar3}
                onAbrir={props.onAbrir3}
                botaoFe={props.botaoFe}
                status={props.status3}   
            />
        </div>
      </div>
    </div>
  );
};

export default ContainerSala;
