import { createShape } from "./builder";

self.addEventListener("message", (event) => {
	if (event.data) {
		const { amount, type, r } = event.data;
		const shapes = [];
		for (let i = 0; i < amount; i++) {
			shapes.push(createShape(type, r));
		}
		self.postMessage(shapes);
		self.close();
	}
});
