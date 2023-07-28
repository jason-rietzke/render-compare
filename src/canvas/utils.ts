// @ts-ignore
import getContours from "svg-path-contours";
// @ts-ignore
import normalize from "normalize-path-scale";
// @ts-ignore
import simplify from "simplify-path";

export function createMesh(svgPath: string, config?: { scale?: number; simplify?: number }): number[][] {
	const options = {
		delaunay: true,
		clean: true,
		exterior: false,
		normalize: true,
		randomization: 0,
		simplify: config?.simplify || 0,
		scale: config?.scale || 1,
	};
	let svg = parseSVG(svgPath);

	// convert curves into discrete points
	var contours = getContours(svg, options.scale);

	// optionally simplify the path for faster triangulation and/or aesthetics
	if (options.simplify > 0) {
		for (let i = 0; i < contours.length; i++) {
			contours[i] = simplify(contours[i], options.simplify);
		}
	}

	// prepare for triangulation
	var polyline = denestPolyline(contours);
	var positions = polyline.positions;
	var bounds = getBounds(positions);

	// // optionally add random points for aesthetics
	// if (options.randomization > 0) addRandomPoints(positions, bounds, options.randomization);

	var loops = polyline.edges;
	var edges = [];
	for (let i = 0; i < loops.length; ++i) {
		var loop = loops[i];
		for (var j = 0; j < loop.length; ++j) {
			edges.push([loop[j], loop[(j + 1) % loop.length]]);
		}
	}

	// rescale to [-1 ... 1]
	if (options.normalize !== false) normalize(positions, bounds);

	// convert to 3D representation and flip on Y axis for convenience w/ OpenGL
	to3D(positions);

	return positions;
}

function to3D(positions: any) {
	for (var i = 0; i < positions.length; i++) {
		var xy = positions[i];
		xy[1] *= -1;
		xy[2] = xy[2] || 0;
	}
}

function denestPolyline(nested: any) {
	var positions = [];
	var edges = [];

	for (var i = 0; i < nested.length; i++) {
		var path = nested[i];
		var loop = [];
		for (var j = 0; j < path.length; j++) {
			var pos = path[j];
			var idx = positions.indexOf(pos);
			if (idx === -1) {
				positions.push(pos);
				idx = positions.length - 1;
			}
			loop.push(idx);
		}
		edges.push(loop);
	}
	return {
		positions: positions,
		edges: edges,
	};
}

function parseSVG(path: any) {
	const length: any = { a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0 };
	const data: any[] = [];
	path.replace(/([astvzqmhlc])([^astvzqmhlc]*)/gi, (_: any, command: any, args: any) => {
		let type: any = command.toLowerCase();
		const numbers = args.match(/-?[0-9]*\.?[0-9]+(?:e[-+]?\d+)?/gi);
		args = numbers ? numbers.map(Number) : [];

		// overloaded moveTo
		if (type == "m" && args.length > 2) {
			data.push([command].concat(args.splice(0, 2)));
			type = "l";
			command = command == "m" ? "l" : "L";
		}

		while (true) {
			if (args.length == length[type]) {
				args.unshift(command);
				return data.push(args);
			}
			if (args.length < length[type]) throw new Error("malformed path data");
			data.push([command].concat(args.splice(0, length[type])));
		}
	});
	return data;
}

function getBounds(points: number[][]): number[][] {
	var n = points.length;
	if (n === 0) return [[], []];
	var d = points[0].length;
	var lo = points[0].slice();
	var hi = points[0].slice();
	for (var i = 1; i < n; ++i) {
		var p = points[i];
		for (var j = 0; j < d; ++j) {
			var x = p[j];
			lo[j] = Math.min(lo[j], x);
			hi[j] = Math.max(hi[j], x);
		}
	}
	return [lo, hi];
}
