const express = require('express');
const mysql = require('mysql');
const crypto = require('crypto');
const fs = require('fs');
const { exec } = require('child_process');
const app = express();

// --- CATEGORY 1: SECRETS & CREDENTIALS (3 Flaws) --
// 1. Hardcoded Plaintext Password
const dbPassword = "SuperSecretPassword123!"; 
// 2. Hardcoded AWS Access Key (GitLeaks target)
const aws_key = "AKIAIMNO88KLMNB99JOP"; 
// 3. Hardcoded IP Address (Bad practice for SonarQube)
const dbHost = "192.168.1.50";

// --- CATEGORY 2: INSECURE CRYPTOGRAPHY (2 Flaws) ---
// 4. Use of MD5 (Broken algorithm)
function hashData(data) {
    return crypto.createHash('md5').update(data).digest('hex');
}
// 5. Use of a weak/static Salt
const salt = "static_salt";

// --- CATEGORY 3: INJECTION ATTACKS (3 Flaws) ---
// 6. SQL Injection (Direct user input in query)
app.get('/user/:id', (req, res) => {
    const query = "SELECT * FROM users WHERE id = " + req.params.id;
    db.query(query, (err, result) => { res.send(result); });
});

// 7. Command Injection (Executing shell commands from input)
app.get('/network/ping', (req, res) => {
    exec("ping -c 1 " + req.query.host, (err, stdout) => { res.send(stdout); });
});

// 8. Path Traversal (Reading files based on user input)
app.get('/read/file', (req, res) => {
    const filePath = "/var/www/html/public/" + req.query.name;
    const content = fs.readFileSync(filePath);
    res.send(content);
});

// --- CATEGORY 4: BROKEN ACCESS CONTROL (2 Flaws) ---
// 9. Open Redirect (Attackers can redirect users to phishing sites)
app.get('/login-redirect', (req, res) => {
    res.redirect(req.query.url);
});

// 10. Missing CSRF Protection (Standard SonarQube check)
// (App is initialized without 'csurf' or security headers)

// --- CATEGORY 5: INFORMATION EXPOSURE (2 Flaws) ---
// 11. Stack Trace Exposure (Sending raw errors to user)
app.use((err, req, res, next) => {
    res.status(500).send(err.stack); 
});

// 12. Insecure Cookie Settings (Missing HttpOnly and Secure flags)
app.get('/set-session', (req, res) => {
    res.cookie('sessionID', '12345'); 
    res.send("Session set");
});

app.listen(3000);

//hia
