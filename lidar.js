const SerialPort = require('serialport');
const port = new SerialPort('/dev/serial0', {
	baudRate: 115200,
	autoOpen: false,
});

const debounce = (callback, wait) => {
	let timeout;
	return (...args) => {
		const context = this;
		clearTimeout(timeout);
		timeout = setTimeout(() => callback.apply(context, args), wait);
	};
};

const handleDistance = dist => {
	console.log('>', dist, 'next shader');
};

const handleDistanceDebounced = debounce(handleDistance, 250);

port.open((error) => {
	if (error ) { console.error(error); }

	console.log('open');
});

port.on('open', () => console.log('is open'));

port.on('data', data => {
	const txt = data.toString();
	if (txt === '\n') { return; }

	const distance = Number(txt.replace('E', ''));
	console.log(distance, txt.replace('E', ''), +txt.replace('E', ''));

	if (distance < 400) {
		handleDistanceDebounced(distance);
	}
});
