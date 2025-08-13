import React from "react";
import BotoesDeControleGar from "./BotoesDeControleGar";

const Container = (props) => {
  return (
    <div className="container-fluid mt-3">
      <div className="row justify-content-center">
        <div className="bg-dark col-12 col-md-8 col-lg-5 mx-2 rounded-2 p-3">
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
            onFechar={props.onFecharSocial}
            onAbrir={props.onAbrirSocial}
            botaoFe={props.botaoFe}
            status={props.statusSocial}
          />
          <div className="p-2 w-100 d-flex flex-column flex-md-row align-items-center justify-content-around gap-2">
            <h5 className="mb-2 mb-md-0 text-center w-100">
              {props.intrucao3}
            </h5>
            <span>{props.movimento}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Container;
