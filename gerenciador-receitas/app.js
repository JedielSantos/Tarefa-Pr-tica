const express = require('express');
const dotenv = require('dotenv');
const https = require('https');
const fs = require('fs');
const path = require('path');
const app = express();

dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env

const PORT = process.env.PORT || 3000;

// Opções SSL
const sslOptions = {
  key: fs.readFileSync('certificates/server.key'),
  cert: fs.readFileSync('certificates/server.cert')
};

// Configura JSON e arquivos estáticos
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Dados em memória
let receitas = [
  { id: 1, nome: 'Lasanha', ingredientes: ['massa', 'molho', 'queijo'], tipo: 'Italiana' },
  { id: 2, nome: 'Feijoada', ingredientes: ['feijão preto', 'carne de porco'], tipo: 'Brasileira' },
];

// Rotas do backend para gerenciamento de receitas
app.post('/receitas', (req, res) => {
  const { nome, ingredientes, tipo } = req.body;
  const id = receitas.length ? receitas[receitas.length - 1].id + 1 : 1;
  const novaReceita = { id, nome, ingredientes, tipo };
  receitas.push(novaReceita);
  res.json(novaReceita);
});

app.get('/receitas', (req, res) => {
  res.json(receitas);
});

app.get('/receitas/:id', (req, res) => {
  const { id } = req.params;
  const receita = receitas.find(r => r.id === parseInt(id));
  if (receita) res.json(receita);
  else res.status(404).json({ error: 'Receita não encontrada' });
});

app.put('/receitas/:id', (req, res) => {
  const { id } = req.params;
  const { nome, ingredientes, tipo } = req.body;
  const receita = receitas.find(r => r.id === parseInt(id));

  if (receita) {
    receita.nome = nome || receita.nome;
    receita.ingredientes = ingredientes || receita.ingredientes;
    receita.tipo = tipo || receita.tipo;
    res.json(receita);
  } else {
    res.status(404).json({ error: 'Receita não encontrada' });
  }
});

app.delete('/receitas/:id', (req, res) => {
  const { id } = req.params;
  const index = receitas.findIndex(r => r.id === parseInt(id));
  if (index !== -1) {
    const receitaDeletada = receitas.splice(index, 1);
    res.json(receitaDeletada);
  } else {
    res.status(404).json({ error: 'Receita não encontrada' });
  }
});

app.get('/pesquisa', (req, res) => {
  const { ingrediente, tipo } = req.query;
  let resultados = receitas;

  if (ingrediente) {
    resultados = resultados.filter(r => r.ingredientes.includes(ingrediente));
  }

  if (tipo) {
    resultados = resultados.filter(r => r.tipo === tipo);
  }

  res.json(resultados);
});

// Servir o arquivo index.html na rota raiz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicializa o servidor HTTPS
https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`Servidor HTTPS rodando na porta ${PORT}`);
});