/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

import http               from 'http';
import WebSocket          from 'ws';
import { promises as fs } from 'fs';


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

const server = http.createServer(); // web server

server.on('request', async(req, res) => {
    switch (req.url) {
        case '/page':
            await servePage(res);
            break;
        default:
            res.writeHead(404);
            res.end();
            break;
    }
});

async function servePage(res) {
    const file = await fs.readFile('page.html');
    const html = file.toString('utf8').replace('{{timestamp}}', new Date().toISOString().split('T')[1]);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(html);
    res.end();
}

server.listen(3000);
console.info('Server listening on 3000');


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

const wsServer = new WebSocket.Server({ port: 3001 }); // websocket server

wsServer.on('connection', async (ws, req) => {
    console.log('new connection', ws._socket.remoteAddress);
    let open = true;
    let n = 0;

    ws.on('message', message => {
        console.log(`msg rec’d: ‘${message}’`)
    });

    ws.on('close', () => {
        console.log('connection closed');
        open = false;
    });

    while (open) { // send 3 messages followed by 'refresh' message at random intervals
        n++;
        const msg = n%4 ? `msg from websocket-test @ ${new Date().toISOString().split('T')[1]}` : 'refresh';
        console.log('send msg', n, msg);
        ws.send(msg);
        await sleep(Math.floor(Math.random()*4000));
    }
});


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
