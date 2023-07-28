import type { ShapeType, Result } from "../utils";
import { observeLongtasks, hexagonPath, quaterPath } from "../utils";

export const svg = document.getElementsByTagName("svg")[0];
if (!svg) throw new Error("svg not found");

export function render(type: ShapeType, length: number, withText: boolean): number {
	let n = 0;
	observeLongtasks((duration, entries) => {
		console.log(`rendered ${n} shapes in ${duration}ms`, entries);
	});
	n = renderShapes(type, length, withText);
	return n;
}

export function test(): Promise<Result[]> {
	return new Promise((resolve) => {
		const results: Result[] = [];
		const types: ShapeType[] = ["hexagon", "quater"];
		const lengths = [32, 64, 128];
		const withTexts = [false, true];
		let t = 0;
		const total = types.length * lengths.length * withTexts.length;
		lengths.forEach((length, j1) => {
			types.forEach((type, j2) => {
				withTexts.forEach((withText, j3) => {
					let lastObserver: PerformanceObserver | void;
					setTimeout(() => {
						if (lastObserver) lastObserver.disconnect();
						const c = j1 * types.length * withTexts.length + j2 * withTexts.length + j3;
						console.log(
							`rendering ${type} with ${length}x${length} elements ${
								withText ? "with" : "without"
							} text (${c + 1}/${total})`
						);
						svg.innerHTML = "";
						let elementCount = 0;
						lastObserver = observeLongtasks((duration) => {
							results.push({ shapeType: type, elementCount, withText, duration });
						});
						elementCount = renderShapes(type, length, withText);
					}, 1500 * t);
					t++;
				});
			});
		});
		setTimeout(() => {
			resolve(results);
		}, 1500 * t + 1500);
	});
}

function createShape(type: ShapeType, r: number) {
	const shape = document.createElementNS("http://www.w3.org/2000/svg", "path");
	shape.setAttribute("d", type == "hexagon" ? hexagonPath(r) : quaterPath(r));
	return shape;
}

function renderShapes(type: ShapeType, length: number, withText = false): number {
	const svgSize = { width: svg.clientWidth, height: svg.clientHeight };
	const r = Math.min(svgSize.width, svgSize.height) / (length * 2);
	const shapes = new Array(length * length).fill(null).map(() => createShape(type, r));
	const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
	shapes.forEach((shape, i) => {
		shape.setAttribute("fill", "#94a8ff");
		const xOffset = (i % length) * r * 2 + r / 2;
		const yOffset = Math.floor(i / length) * r * 2;
		const x = xOffset + (svgSize.width > svgSize.height ? (svgSize.width - svgSize.height) / 2 : 0);
		const y = yOffset + (svgSize.height > svgSize.width ? (svgSize.height - svgSize.width) / 2 : 0);
		shape.setAttribute("transform", `translate(${x} ${y})`);
		g.appendChild(shape);
		if (withText) {
			const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
			text.setAttribute("x", `${r / 2}`);
			text.setAttribute("y", `${r / 2}`);
			text.setAttribute("fill", "#000");
			text.setAttribute("font-size", `${r / 3}`);
			text.setAttribute("font-family", "monospace");
			text.setAttribute("text-anchor", "middle");
			text.setAttribute("dominant-baseline", "middle");
			text.textContent = `${i}`;
			text.setAttribute("transform", `translate(${x} ${y})`);
			g.appendChild(text);
		}
	});
	svg.appendChild(g);
	return shapes.length;
}
