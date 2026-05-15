import { useState, useRef } from 'react'
import './App.css'

export default function App() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)

  function capturarESalvar() {
    if (!navigator.geolocation) {
      setStatus({ type: 'err', msg: 'Geolocalização não suportada neste navegador.' })
      return
    }
    setLoading(true)
    setStatus(null)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const entry = {
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
          precisao_m: Math.round(pos.coords.accuracy),
          horario: new Date(pos.timestamp).toLocaleString('pt-BR'),
        }

        try {
          const res = await fetch('localizacao-103035760.us-east-1.elb.amazonaws.com/api/salvar-localizacao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry),
          })
          const data = await res.json()

          if (data.ok) {
            setRecords(prev => [...prev, entry])
            setStatus({ type: 'ok', msg: `Salvo! Total: ${data.total} registro(s) em /excel/localizacoes.xlsx` })
          } else {
            setStatus({ type: 'err', msg: data.erro || 'Erro ao salvar.' })
          }
        } catch (e) {
          setStatus({ type: 'err', msg: 'Não foi possível conectar ao servidor.' })
        }

        setLoading(false)
      },
      (err) => {
        const msgs = {
          1: 'Permissão negada pelo usuário.',
          2: 'Posição indisponível.',
          3: 'Tempo de espera esgotado.',
        }
        setStatus({ type: 'err', msg: msgs[err.code] || 'Erro desconhecido.' })
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div className="card">
      <div className="header">
        <div className="icon-wrap"></div>
        <div>
          <h1>Ver chave aleatoria</h1>
         </div>
        {records.length > 0 && (
          <span className="badge">{records.length} reg.</span>
        )}
      </div>

      <button className="btn-primary" onClick={capturarESalvar} disabled={loading}>
        {loading
          ? <><span className="spinner" /> </>
          : <>clique aqui</>}
      </button>

      {status && (
        <div className={`status ${status.type}`}>
          {status.type === 'ok' ? '✓' : '✗'} {status.msg}
        </div>
      )}

      {records.length > 0 && (
        <div className="log-section">
          <p className="log-title">Registros desta sessão</p>
          <div className="log-list">
            {records.map((r, i) => (
              <div className="log-item" key={i}>
                <span className="log-num">#{records.length - i}</span>
                <div className="log-data">
                  <span className="log-coords">{r.latitude}, {r.longitude}</span>
                  <span className="log-meta">±{r.precisao_m}m · {r.horario}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
