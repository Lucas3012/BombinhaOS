const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const DB_NOTAS = path.join(__dirname, 'notas.json');
const DB_TECNICOS = path.join(__dirname, 'tecnicos.json');

const carregar = (f) => {
    if (!fs.existsSync(f)) fs.writeFileSync(f, JSON.stringify([]));
    return JSON.parse(fs.readFileSync(f, 'utf8'));
};
const salvar = (f, d) => fs.writeFileSync(f, JSON.stringify(d, null, 2));

// Rotas
app.get('/api/notas', (req, res) => res.json(carregar(DB_NOTAS)));
app.get('/api/tecnicos', (req, res) => res.json(carregar(DB_TECNICOS)));

app.post('/api/notas', (req, res) => {
    const d = carregar(DB_NOTAS);
    const nova = { id: Date.now(), status: 'Pendente', ...req.body };
    d.push(nova);
    salvar(DB_NOTAS, d);
    res.status(201).json(nova);
});

app.patch('/api/notas/:id', (req, res) => {
    const d = carregar(DB_NOTAS);
    const i = d.findIndex(n => n.id == req.params.id);
    if (i !== -1) {
        d[i] = { ...d[i], ...req.body };
        salvar(DB_NOTAS, d);
        res.json(d[i]);
    } else res.status(404).send();
});

app.post('/api/admin/reiniciar', (req, res) => {
    res.json({ msg: "Reiniciando..." });
    exec('bash iniciar.sh');
});

app.listen(3000, () => console.log('🚀 Server ON: Port 3000'));
const DB_LOGINS = path.join(__dirname, 'login.json');

// Rotas para Gerenciamento de Logins
app.get('/api/logins', (req, res) => res.json(carregar(DB_LOGINS)));

app.post('/api/logins', (req, res) => {
    const logins = carregar(DB_LOGINS);
    const novo = { id: Date.now(), ...req.body };
    logins.push(novo);
    salvar(DB_LOGINS, logins);
    res.status(201).json(novo);
});

app.put('/api/logins/:id', (req, res) => {
    const logins = carregar(DB_LOGINS);
    const index = logins.findIndex(l => l.id == req.params.id);
    if (index !== -1) {
        logins[index] = { ...logins[index], ...req.body };
        salvar(DB_LOGINS, logins);
        res.json(logins[index]);
    } else res.status(404).send();
});

app.delete('/api/logins/:id', (req, res) => {
    let logins = carregar(DB_LOGINS);
    logins = logins.filter(l => l.id != req.params.id);
    salvar(DB_LOGINS, logins);
    res.json({ msg: "Removido com sucesso" });
});
