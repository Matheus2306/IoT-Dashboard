import React from "react";

const LeitorDHT = (props) => {

  return (
    <div className="row">
      <div className="col-12 my-3">
        <h3>Leitura de Temperatura e Umidade da sala de estar.</h3>
      </div>
      <div className="col-12 my-3 col-md-6">
        <span className="mx-2 fs-4">Sensor DHT22:</span>
        <span className="mx-3">Temperatura: {!props.temp ? "Carregando" : (props.temp + " °C")}</span>
        <span>Umidade: {!props.umid ? "Carregando" : (props.umid + "%") }</span>
      </div>
    </div>
  );
};

export default LeitorDHT;
