/*
 This program simulates a "data collection station", which joins a multicast
 group in order to receive measures published by thermometers (or other sensors).
 The measures are transported in json payloads with the following format:


 Usage: to start the station, use the following command in a terminal

   node Auditor.js

*/

/*
 * We have defined the multicast address and port in a file, that can be imported both by
 * Musician.js and Auditor.js. The address and the port are part of our simple
 * application-level protocol
 */


const protocol = require('./musique-protocol');

/*
 * We use a standard Node.js module to work with UDP
 */
const dgram = require('dgram');

const moment = require('moment');

const instrum = new Map();
instrum.set("ti-ta-ti","piano");
instrum.set("pouet","trumpet");
instrum.set("trulu","flute");
instrum.set("gzi-gzi","violin");
instrum.set("boum-boum","drum");

var maMap = new Map();
var timeMap = new Map();


/* 
 * Let's create a datagram socket. We will use it to listen for datagrams published in the
 * multicast group by thermometers and containing measures
 */
const s = dgram.createSocket('udp4');
s.bind(protocol.PROTOCOL_PORT, function() {
  console.log("Joining multicast group");
  s.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});



/* 
 * This call back is invoked when a new datagram has arrived.
 */
s.on('message', function(msg, source) {

    const jmessage = JSON.parse(msg);
    const uid =jmessage['id'];

    const instru = instrum.get(jmessage['sound']);;



    const truc = {
        uuid: uid,
        instrument: instru,
        activeSince: moment().format('YYYY-MM-DDThh:mm:ss.sss')
    };

    if(!maMap.has(uid))
        maMap.set(uid,truc);

    timeMap.set(uid,Date.now());

	console.log("Data has arrived: " + uid + "  " + instru + ". Source port: " + source.port);
});


/*
In the node.js intro tutorial (http://nodejs.org/), they show a basic tcp
server, but for some reason omit a client connecting to it.  I added an
example at the bottom.
Save the following server in example.js:
*/

const net = require('net');

const server = net.createServer(function (socket) {
    const jsonres = [];

    maMap.forEach(function (v, k) {
        const start = timeMap.get(k);
        const end = Date.now();

        if (end - start < 5000) {
            jsonres.push(v);
        }
    });


    const jsonPretty = JSON.stringify(jsonres, null, 2);

    socket.write(jsonPretty);
    socket.pipe(socket);
    socket.end();
});

server.listen(2205);





