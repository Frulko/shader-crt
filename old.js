const spawn = require('child_process').spawn;

const scripts = [
'692.frag',
'694.frag',
'695.frag',
'696.frag',
'699.frag',
'704.frag',
'710.frag',
'713.frag',
'720.frag',
'721.frag',
'722.frag',
'724.frag',
'726.frag',
'738.frag',
'745.frag',
'746.frag',
'747.frag',
'749.frag',
'751.frag',
'752.frag',
'758.frag',
'759.frag',
'760.frag',
'762.frag',
'764.frag',
'766.frag',
'773.frag',
'774.frag',
'785.frag',
'788.frag',
'789.frag',
'793.frag',
'797.frag',
'798.frag',
'801.frag',
'808.frag',
'809.frag',
'811.frag',
'815.frag',
'817.frag',
'818.frag',
'824.frag',
'825.frag',
'830.frag',
];

const run = filename => {
	const child = spawn(`glslViewer`, [`./scripts/${filename}`, '-f']);

	child.stdout.on('data', data => console.log('stdout:', data));

	child.stderr.on('data', data => console.log('stderr:', data));

	child.stderr.on('data', data => console.log('stderr:', data));

	/* setTimeout(() => {
		child.kill();
	}, 2000); */
	return child;
};

let index = 0;
let child = run(scripts[index]);

setInterval(() => {
	index++;
	if (index === scripts.length) { index = 0; }

	child.kill();
	child = run(scripts[index]);
}, 5000);
