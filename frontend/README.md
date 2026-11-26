# MoodTracker

**Seu espaço de acolhimento e autoconhecimento.**

O MoodTracker é uma aplicação web desenvolvida para permitir que usuários registrem suas emoções, atividades e acontecimentos cotidianos, acompanhando padrões emocionais ao longo do tempo.

A proposta é incentivar o autoconhecimento por meio de registros pessoais, ajudando o usuário a observar possíveis relações entre emoções, hábitos e situações vivenciadas.

## Tecnologias utilizadas

### Frontend
- React.js
- Vite
- JavaScript
- CSS

### Backend
- Node.js
- Express.js
- MySQL
- JWT para autenticação
- bcryptjs para proteção de senhas

## Estrutura do projeto

```text
moodtracker/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── bd.sql
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

> O arquivo `.env` é criado localmente por cada pessoa e não deve ser enviado ao GitHub. O arquivo `bd.sql` deve ser disponibilizado em uma versão sem dados pessoais ou credenciais.

## Requisitos

Antes de executar o projeto, instale:

- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [XAMPP](https://www.apachefriends.org/) ou outro servidor MySQL/MariaDB.

## 1. Baixar o projeto

Abra o terminal e execute:

```bash
git clone https://github.com/LeticiaDeSantanaLins/moodtracker.git
```

Entre na pasta:

```bash
cd moodtracker
```

## 2. Configurar o banco de dados

1. Abra o XAMPP.
2. Inicie os serviços Apache e MySQL.
3. Acesse o phpMyAdmin:

   http://localhost/phpmyadmin

4. Crie um banco de dados chamado `moodtracker`.
5. Importe o arquivo SQL de estrutura do projeto, disponibilizado separadamente.

O banco precisa estar criado e com as tabelas necessárias antes de executar o backend.

## 3. Configurar o backend

Entre na pasta:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Crie um arquivo chamado `.env` dentro da pasta `backend`.

Preencha com as configurações do seu ambiente local:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=moodtracker
JWT_SECRET=coloque_uma_chave_secreta_aqui
```

**Importante:** os nomes das variáveis devem corresponder aos utilizados no `server.js`. Não compartilhe suas credenciais ou sua chave JWT.

Para iniciar o servidor:

```bash
node server.js
```

O backend deverá iniciar na porta configurada no projeto.

## 4. Configurar o frontend

Abra um segundo terminal, na pasta principal do projeto, e execute:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Inicie a aplicação:

```bash
npm run dev
```

O Vite mostrará o endereço local no terminal. Normalmente:

http://localhost:5173

Abra esse endereço no navegador.

## 5. Executar o projeto

Para utilizar o MoodTracker localmente, mantenha os dois terminais abertos:

| Serviço | Comando |
|---|---|
| Backend | `node server.js` |
| Frontend | `npm run dev` |

O frontend realiza as requisições ao backend, que se comunica com o banco de dados.

## Segurança

- Não publique arquivos `.env`.
- Não compartilhe senhas do banco de dados.
- Não coloque chaves JWT no código-fonte.
- Não publique dumps de banco que contenham informações pessoais.
- Utilize credenciais próprias em cada ambiente.

## Publicação

O projeto possui configuração de publicação com:

- **Frontend:** Vercel.
- **Backend:** Render.
- **Banco de dados:** MySQL compatível, com possibilidade de hospedagem em nuvem.

Cada ambiente precisa ter suas próprias variáveis de configuração.

## Autoria

Projeto desenvolvido como parte de atividades de desenvolvimento de sistemas, com foco em tecnologia, organização de informações e autoconhecimento emocional.

**MoodTracker — Seu espaço de acolhimento.**