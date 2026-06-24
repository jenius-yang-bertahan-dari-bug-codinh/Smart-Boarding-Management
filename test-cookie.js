const http = require('http');

const data = JSON.stringify({ email: 'alex@example.com', password: 'password123' });

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  const setCookie = res.headers['set-cookie'];
  console.log('Set-Cookie Header:', setCookie);
  
  if (setCookie && setCookie.length > 0) {
    const rawCookie = setCookie[0].split(';')[0];
    console.log('Sending back cookie:', rawCookie);
    
    // Now request /api/auth/me
    const getOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        'Cookie': rawCookie
      }
    };
    
    const getReq = http.request(getOptions, (getRes) => {
      console.log(`ME STATUS: ${getRes.statusCode}`);
      getRes.setEncoding('utf8');
      getRes.on('data', (chunk) => {
        console.log(`ME BODY: ${chunk}`);
      });
    });
    getReq.end();
  }
});

req.write(data);
req.end();
