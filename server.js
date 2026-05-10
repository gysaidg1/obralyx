const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// Configurações para entender os dados do formulário
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 1. Conexão com o Banco de Dados (XAMPP)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      
    password: '',      
    database: 'obralyx_db'
});

db.connect((err) => {
    if (err) {
        console.error('❌ Erro ao conectar ao banco:', err);
        return;
    }
    console.log('✅ Conectado ao Banco MySQL da OBRALYX!');
});

// 2. Configuração do Nodemailer (Transportador)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 3. Rota para receber os dados do formulário
app.post('/enviar-contato', (req, res) => {
    const { nome, email, mensagem } = req.body;

    const query = "INSERT INTO mensagens_contato (nome, email, mensagem) VALUES (?, ?, ?)";
    
    db.query(query, [nome, email, mensagem], (err, result) => {
        if (err) {
            console.error('❌ Erro ao salvar no banco:', err);
            return res.status(500).send("Erro ao salvar no banco.");
        }

        console.log('💾 Dados salvos no banco com sucesso!');

        // Configuração do e-mail com os dados recebidos
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Mude para o e-mail do seu pai se quiser testar o recebimento dele
            subject: '🚨 Novo Orçamento - Site OBRALYX',
            html: `
                <div style="font-family: sans-serif; color: #333;">
                    <h2 style="color: #D4AF37;">Novo contato pelo site!</h2>
                    <p><strong>Nome:</strong> ${nome}</p>
                    <p><strong>E-mail:</strong> ${email}</p>
                    <p><strong>Mensagem:</strong> ${mensagem}</p>
                    <hr>
                    <p style="font-size: 0.8rem; color: #666;">Enviado automaticamente pelo sistema OBRALYX.</p>
                </div>
            `
        };

        // Dispara o e-mail
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("❌ Erro ao enviar e-mail:", error);
            } else {
                console.log('✅ E-mail enviado com sucesso!', info.response);
            }
        });

        // Resposta visual para o cliente
        res.send(`
            <html>
            <head>
                <title>Contato Enviado - OBRALYX</title>
            </head>
            <body style="background: radial-gradient(circle at top right, #1a1b20, #0a0a09); ">
            <div style="text-align: center; font-family: sans-serif; margin-top: 50px;">
                <h1 style="color: #D4AF37;">Mensagem enviada com sucesso!</h1>
                <p style="color: #ffffff;">Obrigado pelo contato, entraremos em contato em breve.</p>
                <a href="javascript:history.back()" style="color: #ffffff; font-weight: bold;">Voltar para o site</a>
            </div>
            </body>
            </html> 
        `);
    });
});

// 4. Iniciar o Servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});