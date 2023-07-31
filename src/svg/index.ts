import type { ShapeType, Result } from "../utils";
import { observeLongtasks, hexagonPath, quarterPath, displayStats } from "../utils";

export const svg = document.getElementsByTagName("svg")[0];
if (!svg) throw new Error("svg not found");

let size = Math.min(window.innerWidth, window.innerHeight);
export function resize() {
	size = Math.min(window.innerWidth, window.innerHeight);
	svg.style.width = `${size}px`;
	svg.style.height = `${size}px`;
	svg.style.marginLeft = size < window.innerWidth ? `${(window.innerWidth - size) / 2}px` : "0px";
	svg.style.marginTop = size < window.innerHeight ? `${(window.innerHeight - size) / 2}px` : "0px";
}
resize();
window.addEventListener("resize", () => {
	resize();
	clear();
});

export function clear() {
	svg.innerHTML = "";
}

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
		const types: ShapeType[] = ["hexagon", "quarter"];
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
						displayStats(elementCount);
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
	shape.setAttribute("d", type == "hexagon" ? hexagonPath(r) : quarterPath(r));
	return shape;
}

function renderShapes(type: ShapeType, length: number, withText = false): number {
	const r = size / (length * 2);
	const shapes = new Array(length * length).fill(null).map(() => createShape(type, r));
	const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
	shapes.forEach((shape, i) => {
		shape.setAttribute("fill", "#94a8ff");
		const x = (i % length) * r * 2 + r / 2;
		const y = Math.floor(i / length) * r * 2;
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
