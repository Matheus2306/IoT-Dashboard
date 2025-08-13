import React from 'react'

const BotoesDeControleGar = (props) => {
  return (
    <div className="p-2 w-100 d-flex flex-column flex-md-row align-items-center justify-content-around gap-2">
      <h5 className="mb-2 mb-md-0 text-center w-100">{props.intrucao}</h5>
      <button className="px-3 py-2 rounded-2 w-100 w-md-auto" onClick={props.onAbrir}>{props.botaoAb}</button>
      <button className="py-2 px-3 rounded-2 w-100 w-md-auto" onClick={props.onFechar}>{props.botaoFe}</button>
    </div>
  )
}

export default BotoesDeControleGar