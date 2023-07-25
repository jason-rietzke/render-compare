import "./style.css";

type ShapeType = "hexagon" | "quater";

const svg = document.getElementsByTagName("svg")[0];
if (!svg) throw new Error("svg not found");

function hexagonPath(r: number) {
	const b = (Math.sqrt(3) / 2) * r;
	return `M 0 0 l ${r} 0 l ${r / 2} ${b} l ${-r / 2} ${b} l ${-r} 0 l ${-r / 2} ${-b} l ${r / 2} ${-b} l ${r} 0 Z`;
}
function quaterPath(r: number) {
	return `M 0 0 L ${r} 0 A ${r} ${r} 0 0 1 1 ${r} L 0 0`;
}

function createShape(type: ShapeType, r: number) {
	const shape = document.createElementNS("http://www.w3.org/2000/svg", "path");
	shape.setAttribute("d", type == "hexagon" ? hexagonPath(r) : quaterPath(r));
	return shape;
}

function renderShapes(type: ShapeType, length: number, withText = false) {
	const svgSize = { width: svg.clientWidth, height: svg.clientHeight };
	const r = Math.min(svgSize.width, svgSize.height) / (length * 2);
	const shapes = new Array(length * length).fill(null).map(() => createShape(type, r));
	const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
	shapes.forEach((hexagon, i) => {
		hexagon.setAttribute("fill", "#94a8ff");
		const xOffset = (i % length) * r * 2 + r / 2;
		const yOffset = Math.floor(i / length) * r * 2;
		const x = xOffset + (svgSize.width > svgSize.height ? (svgSize.width - svgSize.height) / 2 : 0);
		const y = yOffset + (svgSize.height > svgSize.width ? (svgSize.height - svgSize.width) / 2 : 0);
		hexagon.setAttribute("transform", `translate(${x} ${y})`);
		g.appendChild(hexagon);
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

function render() {
	const type: ShapeType = "quater";
	const length = 128;
	const withText = true;
	const n = renderShapes(type, length, withText);
	console.log(`rendered ${n} shapes`);
}

let clicked = false;
svg.addEventListener("click", () => {
	if (clicked) return;
	svg.innerHTML = "";
	render();
	clicked = true;
});

const minScale = 0.1;
const maxScale = 10;
let lastScale = 1;
let scale = 1;

svg.addEventListener("wheel", (e) => {
	e.preventDefault();
	scale += e.deltaY * ((-0.01 * scale) / 4);
	if (e.deltaY < 0 && scale >= maxScale) scale = maxScale;
	if (e.deltaY > 0 && scale <= minScale) scale = minScale;
});

function applyScale() {
	if (lastScale === scale) return requestAnimationFrame(applyScale);
	lastScale = scale;
	const g = svg.getElementsByTagName("g")[0];
	if (!g) return;
	const svgSize = { width: svg.clientWidth, height: svg.clientHeight };
	const x = svgSize.width / 2 - (svgSize.width / 2) * scale;
	const y = svgSize.height / 2 - (svgSize.height / 2) * scale;
	g.setAttribute("transform", `translate(${x} ${y}) scale(${scale})`);
	requestAnimationFrame(applyScale);
}
requestAnimationFrame(applyScale);
