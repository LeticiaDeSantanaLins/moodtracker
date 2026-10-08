import { useEffect, useState } from "react";

function App() {
  const [registros, setRegistros] = useState([]);

  const [formulario, setFormulario] = useState({
    data: "",
    horario: "",
    humor: "",
    intensidade: "",
    atividade: "",
    acontecimento: "",
    gatilho: "",
    observacao: "",
  });

  useEffect(() => {
    buscarRegistros();
  }, []);

  function buscarRegistros() {
    fetch("http://localhost:3001/registros")
      .then((resposta) => resposta.json())
      .then((dados) => {
        setRegistros(dados);
      })
      .catch((erro) => {
        console.error("Erro ao buscar registros:", erro);
      });
  }

  function atualizarCampo(evento) {
    setFormulario({
      ...formulario,
      [evento.target.name]: evento.target.value,
    });
  }

  function adicionarRegistro(evento) {
    evento.preventDefault();

    fetch("http://localhost:3001/registros", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...formulario,
        intensidade: Number(formulario.intensidade),
      }),
    })
      .then((resposta) => resposta.json())
      .then(() => {
        setFormulario({
          data: "",
          horario: "",
          humor: "",
          intensidade: "",
          atividade: "",
          acontecimento: "",
          gatilho: "",
          observacao: "",
        });

        buscarRegistros();
      })
      .catch((erro) => {
        console.error("Erro ao adicionar registro:", erro);
      });
  }

  return (
    <div>
      <h1>MoodTracker</h1>

      <h2>Novo registro</h2>

      <form onSubmit={adicionarRegistro}>
        <input
          type="date"
          name="data"
          value={formulario.data}
          onChange={atualizarCampo}
        />

        <input
          type="time"
          name="horario"
          value={formulario.horario}
          onChange={atualizarCampo}
        />

        <input
          type="text"
          name="humor"
          placeholder="Humor"
          value={formulario.humor}
          onChange={atualizarCampo}
        />

        <input
          type="number"
          name="intensidade"
          placeholder="Intensidade (1-10)"
          min="1"
          max="10"
          value={formulario.intensidade}
          onChange={atualizarCampo}
        />

        <input
          type="text"
          name="atividade"
          placeholder="Atividade"
          value={formulario.atividade}
          onChange={atualizarCampo}
        />

        <input
          type="text"
          name="acontecimento"
          placeholder="O que aconteceu?"
          value={formulario.acontecimento}
          onChange={atualizarCampo}
        />

        <input
          type="text"
          name="gatilho"
          placeholder="Possível gatilho"
          value={formulario.gatilho}
          onChange={atualizarCampo}
        />

        <textarea
          name="observacao"
          placeholder="Observação"
          value={formulario.observacao}
          onChange={atualizarCampo}
        />

        <button type="submit">Adicionar registro</button>
      </form>

      <hr />

      <h2>Meus registros</h2>

      {registros.length === 0 ? (
        <p>Nenhum registro encontrado.</p>
      ) : (
        registros.map((registro) => (
          <div key={registro.id}>
            <p>
              <strong>
                {registro.data} — {registro.horario}
              </strong>
            </p>

            <p>
              Humor: {registro.humor} | Intensidade:{" "}
              {registro.intensidade}/10
            </p>

            <p>Atividade: {registro.atividade}</p>

            <p>Acontecimento: {registro.acontecimento}</p>

            <p>Gatilho: {registro.gatilho}</p>

            <p>Observação: {registro.observacao}</p>

            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default App;