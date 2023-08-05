import type { ShapeType } from "../utils";
import { createMesh } from "./utils";
import { hexagonPath, quarterPath } from "../utils";

export function createShape(type: ShapeType, r: number) {
	return createMesh(type == "hexagon" ? hexagonPath(r) : quarterPath(r), {
		scale: 1,
		simplify: 0.01,
	});
}

export async function createShapesWithWorkers(type: ShapeType, length: number, r: number): Promise<number[][][]> {
	const workerCount = navigator.hardwareConcurrency - 1 > length ? length : navigator.hardwareConcurrency - 1;
	return new Promise((resolve) => {
		const workers = new Array(workerCount)
			.fill(null)
			.map(() => new Worker("src/canvas/builder-worker.ts", { type: "module" }));
		const shapes: number[][][] = [];
		let count = 0;
		workers.forEach((worker, i) => {
			worker.addEventListener("message", (event) => {
				if (event.data) {
					event.data.forEach((shape: number[][]) => shapes.push(shape));
					count++;
					if (count === workerCount) {
						resolve(shapes);
						workers.forEach((worker) => worker.terminate());
					}
				}
			});
			const surplus = (length * length) % workerCount;
			const amount = Math.floor((length * length) / workerCount) + (i === workerCount - 1 ? surplus : 0);
			worker.postMessage({ amount, type, r });
		});
	});
}

export function drawTriangles(context: CanvasRenderingContext2D, positions: number[][]) {
	context.beginPath();
	positions.forEach((p, i) => {
		if (i === 0) context.moveTo(p[0], p[1]);
		else context.lineTo(p[0], p[1]);
	});
	context.closePath();
}
