const http = require('http');
const url = require('url');
const request = require('request-promise');
const cheerio = require('cheerio');

const server = http.createServer((req, res) => {
  const { pathname, query } = url.parse(req.url, true);

  if (pathname === '/I/want/title' && query.address) {
    const addresses = Array.isArray(query.address) ? query.address : [query.address];
    const array = ["google.com", "yahoo.com", "www.dawn.com/events/"]

    const fetchTitle = (address) => {
      if(array.includes(address)) {

        return request(`http://${address}`)
          .then((body) => {
            const $ = cheerio.load(body);
            const title = $('title').text();
            return `${address} - "${title}"`;
          })
          .catch((error) => {
            return `${address} - NO RESPONSE`;
          });
      } else {
        return `${address} - NO RESPONSE`;
      }
    };

    Promise.all(addresses.map(fetchTitle))
      .then((results) => {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('<html><head></head><body>');
        res.write('<h1>Following are the titles of given websites:</h1><ul>');
        results.forEach((title) => {
          res.write(`<li>${title}</li>`);
        });
        res.write('</ul></body></html>');
        res.end();
      })
      .catch((error) => {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
