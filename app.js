const express = require('express');
const mysql = require('mysql');
const app = express();

// VULNERABILITY 1: Hardcoded credentials (GitLeaks will catch this)
const dbPassword = "SUPER_SECRET_PASSWORD_12345"; 

// VULNERABILITY 2: SQL Injection (Semgrep & SonarQube will catch this)
app.get('/user', (req, res) => {
    const id = req.query.id;
    const query = "SELECT * FROM users WHERE id = " + id; // Danger!
    db.query(query, (err, result) => {
        res.send(result);
    });
});

app.listen(3000);
