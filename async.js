const http = require('http');
const url = require('url');
const request = require('request');
const cheerio = require('cheerio');
const async = require('async');

const server = http.createServer((req, res) => {
  const { pathname, query } = url.parse(req.url, true);

  const array = ["google.com", "yahoo.com", "www.dawn.com/events/"]

  if (pathname === '/I/want/title' && query.address) {
    const addresses = Array.isArray(query.address) ? query.address : [query.address];

    async.map(
      addresses,
      (address, callback) => {
        request(`http://${address}`, (error, response, body) => {
          if (!error && response.statusCode === 200 && array.includes(address)) {
            const $ = cheerio.load(body);
            const title = $('title').text();
            callback(null, `${address} - "${title}"`);
          } else {
            callback(null, `${address} - NO RESPONSE`);
          }
        });
      },
      (err, results) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.write('<html><head></head><body>');
          res.write('<h1>Following are the titles of given websites:</h1><ul>');
          results.forEach((title) => {
            res.write(`<li>${title}</li>`);
          });
          res.write('</ul></body></html>');
          res.end();
        }
      }
    );
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
