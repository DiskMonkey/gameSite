const http = require('http');
const portTest = process.env.PORT || 3000;

const serverTest = http.createServer((req, res) => {
  res.statusCode = 200;
  const msg = 'Hello Node!\n'
  res.end(msg);
});

serverTest.listen(portTest, () => {
  console.log(`Server running on http://localhost:${portTest}/`);
});
