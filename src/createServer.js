'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

function createServer() {
  return http.createServer(async (req, res) => {
    const { url, method } = req;

    if (method === 'GET' && url === '/') {
      const htmlPath = path.join(__dirname, 'index.html');

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(htmlPath).pipe(res);

      return;
    }

    if (
      method === 'POST' &&
      (url === '/add-expense' || url === '/submit-expense')
    ) {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk;
      });

      req.on('end', () => {
        let expense;

        try {
          expense = JSON.parse(body);
        } catch {
          res.writeHead(400);

          return res.end('Invalid JSON');
        }

        if (!expense.date || !expense.title || expense.amount === undefined) {
          res.writeHead(400);

          return res.end('Invalid form data');
        }

        const dbPath = path.resolve('db', 'expense.json');

        fs.writeFileSync(dbPath, JSON.stringify(expense, null, 2), 'utf-8');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(expense));
      });

      return;
    }

    res.writeHead(404);
    res.end('Not Found');
  });
}

module.exports = {
  createServer,
};
