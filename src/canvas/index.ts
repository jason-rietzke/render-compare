import type { ShapeType, Result } from "../utils";
import { createMesh } from "./utils";
import { observeLongtasks, hexagonPath, quarterPath } from "../utils";

export const canvas = document.getElementsByTagName("canvas")[0];
if (!canvas) throw new Error("canvas not found");
const context = canvas.getContext("2d");
if (!context) throw new Error("context not found");

const size = Math.min(window.innerWidth, window.innerHeight);
canvas.width = size;
canvas.height = size;
canvas.style.width = `${size}px`;
canvas.style.height = `${size}px`;
if (size < window.innerWidth) canvas.style.marginLeft = `${(window.innerWidth - size) / 2}px`;
if (size < window.innerHeight) canvas.style.marginTop = `${(window.innerHeight - size) / 2}px`;

export function clear() {
	if (!context) throw new Error("context not found");
	context.clearRect(-size / 2, -size / 2, size * 2, size * 2);
	context.restore();
	context.save();
}

function drawTriangles(context: CanvasRenderingContext2D, positions: number[][]) {
	context.beginPath();
	positions.forEach((p, i) => {
		if (i === 0) context.moveTo(p[0], p[1]);
		else context.lineTo(p[0], p[1]);
	});
	context.closePath();
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
						canvas.innerHTML = "";
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
	return createMesh(type == "hexagon" ? hexagonPath(r) : quarterPath(r), {
		scale: 1,
		simplify: 0.01,
	});
}

function renderShapes(type: ShapeType, length: number, withText = false): number {
	if (!context) throw new Error("context not found");
	clear();
	const canvasSize = { width: canvas.clientWidth, height: canvas.clientHeight };
	const r = Math.min(canvasSize.width, canvasSize.height) / (length * 2);
	const shapes = new Array(length * length).fill(null).map(() => createShape(type, r));
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
