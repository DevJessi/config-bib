const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/autenticacao', require('./src/controllers/autenticacao'));

app.listen(process.env.PORT || 3000, () => console.log('Sucesso'));