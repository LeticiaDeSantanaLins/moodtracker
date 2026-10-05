const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
const PORT = 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexão com o banco
const banco = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "moodtracker",
});

banco.connect((erro) => {
  if (erro) {
    console.error("Erro ao conectar ao MySQL:", erro);
    return;
  }

  console.log("Conectado ao MySQL!");
});

// ===============================
// GET - testar servidor
// ===============================
app.get("/", (req, res) => {
  res.send("MoodTracker backend funcionando!");
});

// ===============================
// GET - buscar todos os registros
// ===============================
app.get("/registros", (req, res) => {
  const sql = "SELECT * FROM registros ORDER BY id DESC";

  banco.query(sql, (erro, resultados) => {
    if (erro) {
      console.error("Erro ao buscar registros:", erro);

      return res.status(500).json({
        erro: "Erro ao buscar registros",
      });
    }

    res.json(resultados);
  });
});

// ===============================
// POST - criar registro
// ===============================
app.post("/registros", (req, res) => {
  console.log("POST /registros FOI RECEBIDO!");

  const {
    data,
    horario,
    humor,
    intensidade,
    atividade,
    acontecimento,
    gatilho,
    observacao,
  } = req.body;

  const sql = `
    INSERT INTO registros
    (
      data,
      horario,
      humor,
      intensidade,
      atividade,
      acontecimento,
      gatilho,
      observacao
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const valores = [
    data,
    horario,
    humor,
    intensidade,
    atividade,
    acontecimento,
    gatilho,
    observacao,
  ];

  banco.query(sql, valores, (erro, resultado) => {
    if (erro) {
      console.error("Erro ao cadastrar registro:", erro);

      return res.status(500).json({
        erro: "Erro ao cadastrar registro",
        detalhes: erro.message,
      });
    }

    res.status(201).json({
      mensagem: "Registro cadastrado com sucesso!",
      id: resultado.insertId,
    });
  });
});

// ===============================
// PUT - editar registro
// ===============================
app.put("/registros/:id", (req, res) => {
  const { id } = req.params;

  const {
    data,
    horario,
    humor,
    intensidade,
    atividade,
    acontecimento,
    gatilho,
    observacao,
  } = req.body;

  const sql = `
    UPDATE registros
    SET
      data = ?,
      horario = ?,
      humor = ?,
      intensidade = ?,
      atividade = ?,
      acontecimento = ?,
      gatilho = ?,
      observacao = ?
    WHERE id = ?
  `;

  const valores = [
    data,
    horario,
    humor,
    intensidade,
    atividade,
    acontecimento,
    gatilho,
    observacao,
    id,
  ];

  banco.query(sql, valores, (erro, resultado) => {
    if (erro) {
      console.error("Erro ao editar registro:", erro);

      return res.status(500).json({
        erro: "Erro ao editar registro",
      });
    }

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        erro: "Registro não encontrado",
      });
    }

    res.json({
      mensagem: "Registro atualizado com sucesso!",
    });
  });
});

// ===============================
// DELETE - excluir registro
// ===============================
app.delete("/registros/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM registros WHERE id = ?";

  banco.query(sql, [id], (erro, resultado) => {
    if (erro) {
      console.error("Erro ao excluir registro:", erro);

      return res.status(500).json({
        erro: "Erro ao excluir registro",
      });
    }

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        erro: "Registro não encontrado",
      });
    }

    res.json({
      mensagem: "Registro excluído com sucesso!",
    });
  });
});

// ===============================
// Iniciar servidor
// ===============================
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
