const http = require('http');

http.get('http://localhost:8080/api/stock-history', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(data.substring(0, 500)); // Print first 500 chars
  });
}).on('error', (err) => {
  console.log('Error: ' + err.message);
});
