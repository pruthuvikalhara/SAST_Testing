const express = require('express');
const mysql = require('mysql');
const crypto = require('crypto');
const app = express();

// --- 1. SECRETS (GitLeaks & SonarQube) ---
const API_KEY = "AIzaSyA1234567890-AbCdEfGhIjKlMnOpQrStU"; // Fake Google API Key
const DB_PASS = "admin123"; 

// --- 2. WEAK CRYPTOGRAPHY (Semgrep & SonarQube) ---
function hashPassword(password) {
    // MD5 is broken and insecure
    return crypto.createHash('md5').update(password).digest('hex');
}

// --- 3. SQL INJECTION (Semgrep & SonarQube) ---
app.get('/search', (req, res) => {
    const userInput = req.query.q;
    // Direct string concatenation is a huge No-No
    const query = "SELECT * FROM products WHERE name = '" + userInput + "'";
    
    db.query(query, (err, results) => {
        res.send(results);
    });
});

// --- 4. COMMAND INJECTION (Semgrep) ---
const { exec } = require('child_process');
app.get('/ping', (req, res) => {
    const ip = req.query.ip;
    // An attacker can run: ; rm -rf /
    exec(`ping -c 4 ${ip}`, (err, stdout) => {
        res.send(stdout);
    });
});

// --- 5. INSECURE REDIRECT (SonarQube) ---
app.get('/redirect', (req, res) => {
    const url = req.query.url;
    res.redirect(url); // Open redirect vulnerability
});

app.listen(3000, () => console.log("Vulnerable app listening on port 3000"));
