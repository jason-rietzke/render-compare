import type { ShapeType, Result } from "../utils";
import { observeLongtasks, displayStats } from "../utils";
import { createShape, createShapesWithWorkers, drawTriangles } from "./builder";

export const canvas = document.getElementsByTagName("canvas")[0];
if (!canvas) throw new Error("canvas not found");
const context = canvas.getContext("2d");
if (!context) throw new Error("context not found");

let size = Math.min(window.innerWidth, window.innerHeight);
export function resize() {
	size = Math.min(window.innerWidth, window.innerHeight);
	canvas.width = size;
	canvas.height = size;
	canvas.style.width = `${size}px`;
	canvas.style.height = `${size}px`;
	canvas.style.marginLeft = size < window.innerWidth ? `${(window.innerWidth - size) / 2}px` : "0px";
	canvas.style.marginTop = size < window.innerHeight ? `${(window.innerHeight - size) / 2}px` : "0px";
}
resize();
window.addEventListener("resize", () => {
	resize();
	clear();
});

export function clear() {
	if (!context) throw new Error("context not found");
	context.clearRect(-size / 2, -size / 2, size * 2, size * 2);
	context.restore();
	context.save();
}

export async function render(
	type: ShapeType,
	length: number,
	withText: boolean,
	withWorkers: boolean
): Promise<number> {
	let n = 0;
	observeLongtasks((duration, entries) => {
		console.log(`rendered ${n} shapes in ${duration}ms`, entries);
	});
	n = await renderShapes(type, length, withText, withWorkers);
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
					setTimeout(async () => {
						if (lastObserver) lastObserver.disconnect();
						const c = j1 * types.length * withTexts.length + j2 * withTexts.length + j3;
						console.log(
							`rendering ${type} with ${length}x${length} elements ${
								withText ? "with" : "without"
							} text (${c + 1}/${total})`
						);
						canvas.innerHTML = "";
						let elementCount = 0;
						lastObserver = observeLongtasks((duration) => {
							results.push({ shapeType: type, elementCount, withText, duration });
						});
						elementCount = await renderShapes(type, length, withText);
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

async function renderShapes(type: ShapeType, length: number, withText = false, withWorkers = false): Promise<number> {
	if (!context) throw new Error("context not found");
	clear();
	const r = size / (length * 2);
	let shapes: number[][][];
	if (withWorkers) {
		shapes = await createShapesWithWorkers(type, length, r);
	} else {
		shapes = new Array(length * length).fill(null).map(() => createShape(type, r));
	}
	shapes.forEach((shape, i) => {
		const x = (i % length) * r * 2 + r / 2;
		const y = Math.floor(i / length) * r * 2;
		context.translate(x + r / 2, y + r);
		context.scale(r, -r);
		drawTriangles(context, shape);
		context.fillStyle = "#94a8ff";
		context.fill();
		context.restore();
		context.save();
		if (withText) {
			const text = `${i}`;
			const textWidth = context.measureText(text).width;
			context.translate(x + r / 2, y + r * 1.1);
			context.scale(r * 0.04, r * 0.04);
			context.fillStyle = "#000";
			context.fillText(text, -textWidth / 2, 0);
			context.restore();
			context.save();
		}
	});
	return shapes.length;
}
