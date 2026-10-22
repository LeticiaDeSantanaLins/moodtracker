
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:3001/registros";

const HUMORES = [
  { nome: "Feliz", emoji: "☀️" },
  { nome: "Tranquila", emoji: "🌿" },
  { nome: "Animada", emoji: "✨" },
  { nome: "Ansiosa", emoji: "🦋" },
  { nome: "Triste", emoji: "🌧️" },
  { nome: "Irritada", emoji: "🔥" },
  { nome: "Cansada", emoji: "🌙" },
  { nome: "Confusa", emoji: "☁️" },
];

const FORMULARIO_INICIAL = {
  data: new Date().toLocaleDateString("en-CA"),
  horario: new Date().toTimeString().slice(0, 5),
  humor: "",
  intensidade: "5",
  atividade: "",
  acontecimento: "",
  gatilho: "",
  observacao: "",
};

function App() {
  const [registros, setRegistros] = useState([]);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    buscarRegistros();
  }, []);

  async function buscarRegistros() {
    setCarregando(true);
    setErro("");

    try {
      const resposta = await fetch(API);

      if (!resposta.ok) {
        throw new Error("Não foi possível carregar os registros.");
      }

      const dados = await resposta.json();
      setRegistros(Array.isArray(dados) ? dados : []);
    } catch (erro) {
      console.error("Erro ao buscar registros:", erro);
      setErro(
        "Não conseguimos carregar seus registros. Confira se o servidor está funcionando."
      );
    } finally {
      setCarregando(false);
    }
  }

  function atualizarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));

    setMensagem("");
    setErro("");
  }

  async function adicionarRegistro(evento) {
    evento.preventDefault();
    setErro("");
    setMensagem("");

    if (!formulario.data || !formulario.horario || !formulario.humor) {
      setErro("Preencha a data, o horário e a emoção principal.");
      return;
    }

    const intensidade = Number(formulario.intensidade);

    if (!Number.isInteger(intensidade) || intensidade < 1 || intensidade > 10) {
      setErro("A intensidade deve ser um número entre 1 e 10.");
      return;
    }

    setSalvando(true);

    try {
      const resposta = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formulario,
          intensidade,
        }),
      });

      if (!resposta.ok) {
        throw new Error("O servidor não conseguiu salvar o registro.");
      }

      setFormulario({
        ...FORMULARIO_INICIAL,
        data: new Date().toLocaleDateString("en-CA"),
        horario: new Date().toTimeString().slice(0, 5),
      });

      setMensagem("Seu registro foi salvo com carinho.");
      await buscarRegistros();
    } catch (erro) {
      console.error("Erro ao adicionar registro:", erro);
      setErro(
        "Não foi possível salvar. Confira se o backend está funcionando."
      );
    } finally {
      setSalvando(false);
    }
  }

  function formatarData(data) {
    if (!data) return "Data não informada";

    const dataLimpa = String(data).slice(0, 10);
    const partes = dataLimpa.split("-");

    if (partes.length !== 3) return dataLimpa;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  function formatarHorario(horario) {
    if (!horario) return "";

    return String(horario).slice(0, 5);
  }

  function encontrarHumor(nome) {
    return HUMORES.find((humor) => humor.nome === nome);
  }

  const registrosRecentes = [...registros].reverse();

  return (
    <main className="app-container">
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="MoodTracker, início">
          <span className="brand-icon">☘</span>
          <span>MoodTracker</span>
        </a>

        <span className="topbar-label">Seu espaço de acolhimento</span>
      </header>

      <section className="welcome-section" id="inicio">
        <div className="welcome-copy">
          <span className="eyebrow">UM MOMENTO PARA VOCÊ</span>
          <h1>Olá! Como você está se sentindo?</h1>
          <p>
            Não existe jeito certo ou errado de se sentir. Tire um instante
            para perceber suas emoções e registrar o que está vivendo.
          </p>
          <a className="primary-link" href="#novo-registro">
            <span aria-hidden="true">＋</span> Registrar como estou
          </a>
        </div>

        <div className="welcome-art" aria-hidden="true">
          <span className="art-sun">☀</span>
          <span className="art-leaf leaf-one">❧</span>
          <span className="art-flower">✿</span>
          <div className="art-face">☺</div>
          <span className="art-leaf leaf-two">❧</span>
          <span className="art-star">✦</span>
        </div>
      </section>

      <section className="reflection-note">
        <span className="note-icon" aria-hidden="true">🌱</span>
        <div>
          <strong>Um lembrete gentil</strong>
          <p>
            Você não precisa entender tudo o que sente agora. Observar já é
            um começo.
          </p>
        </div>
      </section>

      <section className="content-section" id="novo-registro">
        <div className="section-heading">
          <div>
            <span className="eyebrow">DIÁRIO EMOCIONAL</span>
            <h2>Como foi seu momento?</h2>
            <p>Registre o que sentir à vontade para compartilhar consigo.</p>
          </div>
          <span className="heading-decoration" aria-hidden="true">✳</span>
        </div>

        <form className="record-form" onSubmit={adicionarRegistro}>
          <div className="form-section">
            <label className="field-label">
              Qual emoção representa melhor este momento?
              <span className="required-mark"> *</span>
            </label>

            <div className="emotion-grid">
              {HUMORES.map((humor) => (
                <button
                  className={`emotion-option ${
                    formulario.humor === humor.nome ? "selected" : ""
                  }`}
                  type="button"
                  key={humor.nome}
                  aria-pressed={formulario.humor === humor.nome}
                  onClick={() =>
                    setFormulario((anterior) => ({
                      ...anterior,
                      humor: humor.nome,
                    }))
                  }
                >
                  <span className="emotion-emoji" aria-hidden="true">
                    {humor.emoji}
                  </span>
                  <span>{humor.nome}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-divider" />

          <div className="form-section">
            <div className="section-subheading">
              <div>
                <h3>Sobre esse momento</h3>
                <p>Alguns detalhes ajudam a guardar essa lembrança.</p>
              </div>
              <span className="optional-label">Campos com * são obrigatórios</span>
            </div>

            <div className="form-grid">
              <div className="field">
                <label htmlFor="data">
                  Data <span className="required-mark">*</span>
                </label>
                <input
                  id="data"
                  type="date"
                  name="data"
                  value={formulario.data}
                  onChange={atualizarCampo}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="horario">
                  Horário <span className="required-mark">*</span>
                </label>
                <input
                  id="horario"
                  type="time"
                  name="horario"
                  value={formulario.horario}
                  onChange={atualizarCampo}
                  required
                />
              </div>

              <div className="field field-full">
                <div className="intensity-heading">
                  <label htmlFor="intensidade">Intensidade da emoção</label>
                  <span className="intensity-value">
                    {formulario.intensidade}/10
                  </span>
                </div>
                <input
                  className="intensity-slider"
                  id="intensidade"
                  type="range"
                  name="intensidade"
                  min="1"
                  max="10"
                  value={formulario.intensidade}
                  onChange={atualizarCampo}
                />
                <div className="range-labels">
                  <span>Suave</span>
                  <span>Muito intensa</span>
                </div>
              </div>

              <div className="field field-full">
                <label htmlFor="atividade">O que você estava fazendo?</label>
                <input
                  id="atividade"
                  type="text"
                  name="atividade"
                  placeholder="Ex.: estudando, descansando, conversando..."
                  value={formulario.atividade}
                  onChange={atualizarCampo}
                />
              </div>

              <div className="field field-full">
                <label htmlFor="acontecimento">
                  Aconteceu algo que você queira registrar?
                </label>
                <textarea
                  id="acontecimento"
                  name="acontecimento"
                  placeholder="Conte um pouco, se quiser..."
                  rows="3"
                  value={formulario.acontecimento}
                  onChange={atualizarCampo}
                />
              </div>

              <div className="field field-full">
                <label htmlFor="gatilho">
                  Algo pode ter influenciado essa emoção?
                </label>
                <input
                  id="gatilho"
                  type="text"
                  name="gatilho"
                  placeholder="Ex.: preocupação, cansaço, uma conversa..."
                  value={formulario.gatilho}
                  onChange={atualizarCampo}
                />
              </div>

              <div className="field field-full">
                <label htmlFor="observacao">Outras observações</label>
                <textarea
                  id="observacao"
                  name="observacao"
                  placeholder="Qualquer outra coisa que queira lembrar..."
                  rows="3"
                  value={formulario.observacao}
                  onChange={atualizarCampo}
                />
              </div>
            </div>
          </div>

          {erro && (
            <p className="feedback feedback-error" role="alert">
              {erro}
            </p>
          )}

          {mensagem && (
            <p className="feedback feedback-success" role="status">
              {mensagem}
            </p>
          )}

          <div className="form-actions">
            <span className="form-footnote">
              <span className="required-mark">*</span> Obrigatório
            </span>
            <button className="submit-button" type="submit" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar meu registro"}
              {!salvando && <span aria-hidden="true"> ↗</span>}
            </button>
          </div>
        </form>
      </section>

      <section className="content-section records-section" id="meus-registros">
        <div className="section-heading">
          <div>
            <span className="eyebrow">SEU CAMINHO</span>
            <h2>Seus registros</h2>
            <p>Cada registro é uma oportunidade de se conhecer melhor.</p>
          </div>
          <span className="records-count">
            {registros.length} {registros.length === 1 ? "registro" : "registros"}
          </span>
        </div>

        {carregando ? (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">🌿</span>
            <p>Buscando seus registros...</p>
          </div>
        ) : erro && registros.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">☁️</span>
            <p>Seus registros não puderam ser carregados.</p>
            <button
              className="secondary-button"
              type="button"
              onClick={buscarRegistros}
            >
              Tentar novamente
            </button>
          </div>
        ) : registrosRecentes.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">🌱</span>
            <h3>Seu diário começa aqui</h3>
            <p>
              Quando você salvar seu primeiro registro, ele aparecerá nesta
              área.
            </p>
            <a className="secondary-button" href="#novo-registro">
              Criar primeiro registro
            </a>
          </div>
        ) : (
          <div className="records-list">
            {registrosRecentes.map((registro) => {
              const humor = encontrarHumor(registro.humor);

              return (
                <article className="record-card" key={registro.id}>
                  <div className="record-emotion">
                    <span className="record-emoji" aria-hidden="true">
                      {humor?.emoji || "💭"}
                    </span>
                  </div>

                  <div className="record-main">
                    <div className="record-title-row">
                      <h3>{registro.humor || "Emoção não informada"}</h3>
                      <span className="record-date">
                        {formatarData(registro.data)}
                        {registro.horario
                          ? ` · ${formatarHorario(registro.horario)}`
                          : ""}
                      </span>
                    </div>

                    <p className="record-intensity">
                      Intensidade: <strong>{registro.intensidade}/10</strong>
                    </p>

                    {registro.atividade && (
                      <p className="record-detail">
                        <strong>Atividade:</strong> {registro.atividade}
                      </p>
                    )}

                    {registro.acontecimento && (
                      <p className="record-detail">
                        <strong>Acontecimento:</strong> {registro.acontecimento}
                      </p>
                    )}

                    {registro.gatilho && (
                      <p className="record-detail">
                        <strong>Possível influência:</strong> {registro.gatilho}
                      </p>
                    )}

                    {registro.observacao && (
                      <p className="record-detail">
                        <strong>Observação:</strong> {registro.observacao}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <footer className="app-footer">
        <span className="footer-mark" aria-hidden="true">☘</span>
        <p>MoodTracker · Um espaço para se escutar com gentileza.</p>
      </footer>
    </main>
  );
}

export default App;
