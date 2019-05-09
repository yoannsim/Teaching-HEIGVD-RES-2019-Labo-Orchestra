/*
 This program simulates a "smart" thermometer, which publishes the measured temperature
 on a multicast group. Other programs can join the group and receive the measures. The
 measures are transported in json payloads with the following forma

*/

var protocol = require('./musique-protocol');

/*
 * We use a standard Node.js module to work with UDP
 */
var dgram = require('dgram');

const uid = require('uuid');

/*
 * Let's create a datagram socket. We will use it to send our UDP datagrams 
 */
var s = dgram.createSocket('udp4');

/*
 * Let's define a javascript class for our thermometer. The constructor accepts
 * a location, an initial temperature and the amplitude of temperature variation
 * at every iteration
 */
function Musician(sound) {


	const id = uid.v4();
/*
   * We will simulate temperature changes on a regular basis. That is something that
   * we implement in a class method (via the prototype)
   */
	Musician.prototype.update = function() {


/*
	  * Let's create the sound as a dynamic javascript object,
	  * add the 3 properties (timestamp, location and temperature)
	  * and serialize the object to a JSON string
	  *
	  */
		const pay = {
			id: id,
			sound: sound,
		};
		const payload = JSON.stringify(pay);

		/*
               * Finally, let's encapsulate the payload in a UDP datagram, which we publish on
               * the multicast address. All subscribers to this address will receive the message.
               */
		const message = new Buffer(payload);
		s.send(message, 0, message.length, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, function(err, bytes) {
			console.log("Sending payload: " + payload + " via port " + s.address().port);
		});

	}

/*
	 * Let's take and send a measure every 500 ms
	 */
	setInterval(this.update.bind(this), 1000);

}

/*
 * Let's get the thermometer properties from the command line attributes
 * Some error handling wouln't hurt here...
 */
var instrum = process.argv[2];
console.log(instrum);
var maMap = new Map();
maMap.set("piano","ti-ta-ti");
maMap.set("trumpet","pouet");
maMap.set("flute","trulu");
maMap.set("violin","gzi-gzi");
maMap.set("drum","boum-boum");
/*
 * Let's create a new thermoter - the regular publication of measures will
 * be initiated within the constructor
 */
new Musician(maMap.get(instrum));
