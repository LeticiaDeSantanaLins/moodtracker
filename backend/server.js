const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const PORT = 3001;

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET não foi configurado no arquivo .env");
}

// Middlewares
app.use(cors());
app.use(express.json());

// Conexão com o banco
const banco = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

banco.connect((erro) => {
  if (erro) {
    console.error("Erro ao conectar ao MySQL:", erro);
    return;
  }

  console.log("Conectado ao MySQL!");
});

// =====================================
// AUTENTICAÇÃO
// =====================================

// Verificar se o usuário está autenticado
function autenticarToken(req, res, next) {
  const autorizacao = req.headers.authorization;

  if (!autorizacao) {
    return res.status(401).json({
      erro: "Faça login para continuar.",
    });
  }

  const token = autorizacao.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      erro: "Token não informado.",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (erro, usuario) => {
    if (erro) {
      return res.status(403).json({
        erro: "Sessão inválida ou expirada.",
      });
    }

    req.usuario = usuario;
    next();
  });
}

// =====================================
// GET - testar servidor
// =====================================

app.get("/", (req, res) => {
  res.send("MoodTracker backend funcionando!");
});

// =====================================
// POST - cadastrar usuário
// =====================================

app.post("/usuarios/cadastro", async (req, res) => {
  try {
    const { nome, email, pin } = req.body;

    if (!nome || !email || !pin) {
      return res.status(400).json({
        erro: "Preencha todos os campos.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        erro: "Informe um e-mail válido.",
      });
    }

    if (!/^\d{4}$/.test(String(pin))) {
      return res.status(400).json({
        erro: "O PIN deve conter exatamente 4 números.",
      });
    }

    const emailNormalizado = email.trim().toLowerCase();

    banco.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [emailNormalizado],
      async (erro, resultados) => {
        if (erro) {
          console.error("Erro ao verificar e-mail:", erro);
          return res.status(500).json({
            erro: "Erro ao verificar cadastro.",
          });
        }

        if (resultados.length > 0) {
          return res.status(409).json({
            erro: "Este e-mail já está cadastrado.",
          });
        }

        try {
          const pinHash = await bcrypt.hash(String(pin), 10);

          banco.query(
            "INSERT INTO usuarios (nome, email, pin_hash) VALUES (?, ?, ?)",
            [nome.trim(), emailNormalizado, pinHash],
            (erro, resultado) => {
              if (erro) {
                console.error("Erro ao cadastrar usuário:", erro);

                if (erro.code === "ER_DUP_ENTRY") {
                  return res.status(409).json({
                    erro: "Este e-mail já está cadastrado.",
                  });
                }

                return res.status(500).json({
                  erro: "Não foi possível criar sua conta.",
                });
              }

              res.status(201).json({
                mensagem: "Conta criada com sucesso!",
                id: resultado.insertId,
              });
            },
          );
        } catch (erro) {
          console.error("Erro ao proteger PIN:", erro);
          return res.status(500).json({
            erro: "Erro ao processar cadastro.",
          });
        }
      },
    );
  } catch (erro) {
    console.error(erro);
    res.status(500).json({
      erro: "Erro interno no cadastro.",
    });
  }
});

// =====================================
// POST - fazer login
// =====================================

app.post("/usuarios/login", (req, res) => {
  const { email, pin } = req.body;

  if (!email || !pin) {
    return res.status(400).json({
      erro: "Informe seu e-mail e PIN.",
    });
  }

  const emailNormalizado = email.trim().toLowerCase();

  banco.query(
    "SELECT * FROM usuarios WHERE email = ?",
    [emailNormalizado],
    async (erro, resultados) => {
      if (erro) {
        console.error("Erro ao buscar usuário:", erro);
        return res.status(500).json({
          erro: "Erro ao realizar login.",
        });
      }

      if (resultados.length === 0) {
        return res.status(401).json({
          erro: "E-mail ou PIN incorreto.",
        });
      }

      const usuario = resultados[0];

      try {
        const pinCorreto = await bcrypt.compare(String(pin), usuario.pin_hash);

        if (!pinCorreto) {
          return res.status(401).json({
            erro: "E-mail ou PIN incorreto.",
          });
        }

        const token = jwt.sign(
          {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
          },
          process.env.JWT_SECRET,
          { expiresIn: "2h" },
        );

        res.json({
          mensagem: "Login realizado com sucesso!",
          token,
          usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
          },
        });
      } catch (erro) {
        console.error("Erro ao verificar PIN:", erro);
        res.status(500).json({
          erro: "Erro ao realizar login.",
        });
      }
    },
  );
});

// =====================================
// GET - buscar registros do usuário
// =====================================

app.get("/registros", autenticarToken, (req, res) => {
  const sql = `
    SELECT * FROM registros
    WHERE usuario_id = ?
    ORDER BY id DESC
  `;

  banco.query(sql, [req.usuario.id], (erro, resultados) => {
    if (erro) {
      console.error("Erro ao buscar registros:", erro);
      return res.status(500).json({
        erro: "Erro ao buscar registros.",
      });
    }

    res.json(resultados);
  });
});

// =====================================
// POST - criar registro
// =====================================

app.post("/registros", autenticarToken, (req, res) => {
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
      observacao,
      usuario_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    req.usuario.id,
  ];

  banco.query(sql, valores, (erro, resultado) => {
    if (erro) {
      console.error("Erro ao cadastrar registro:", erro);
      return res.status(500).json({
        erro: "Erro ao cadastrar registro.",
        detalhes: erro.message,
      });
    }

    res.status(201).json({
      mensagem: "Registro cadastrado com sucesso!",
      id: resultado.insertId,
    });
  });
});

// =====================================
// PUT - editar registro do usuário
// =====================================

app.put("/registros/:id", autenticarToken, (req, res) => {
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
    WHERE id = ? AND usuario_id = ?
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
    req.usuario.id,
  ];

  banco.query(sql, valores, (erro, resultado) => {
    if (erro) {
      console.error("Erro ao editar registro:", erro);
      return res.status(500).json({
        erro: "Erro ao editar registro.",
      });
    }

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        erro: "Registro não encontrado.",
      });
    }

    res.json({
      mensagem: "Registro atualizado com sucesso!",
    });
  });
});

// =====================================
// DELETE - excluir registro do usuário
// =====================================

app.delete("/registros/:id", autenticarToken, (req, res) => {
  const { id } = req.params;

  const sql = `
    DELETE FROM registros
    WHERE id = ? AND usuario_id = ?
  `;

  banco.query(sql, [id, req.usuario.id], (erro, resultado) => {
    if (erro) {
      console.error("Erro ao excluir registro:", erro);
      return res.status(500).json({
        erro: "Erro ao excluir registro.",
      });
    }

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        erro: "Registro não encontrado.",
      });
    }

    res.json({
      mensagem: "Registro excluído com sucesso!",
    });
  });
});

// =====================================
// Iniciar servidor
// =====================================

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
