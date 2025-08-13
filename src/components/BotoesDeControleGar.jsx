import React from 'react'

const BotoesDeControleGar = (props) => {
  return (
    <div className="p-2 w-100 d-flex flex-column flex-md-row align-items-center justify-content-between gap-2">
      <h5 className="mb-2 mb-md-0 text-center mx-4 w-25">{props.intrucao}</h5>
      <div className='d-flex gap-2 mx-4 w-25 justify-content-center'>

      <button className="px-3 py-2 rounded-2 w-100" onClick={props.onAbrir}>{props.botaoAb}</button>
      {props.intrucao == "Abrir portão social" ? null
      :<button className="py-2 px-3 rounded-2 w-100" onClick={props.onFechar}>{props.botaoFe}</button>
    }
    </div>
      <span className='mx-4 w-25'>Status: {props.status}</span>
    </div>
  )
}

export default BotoesDeControleGar