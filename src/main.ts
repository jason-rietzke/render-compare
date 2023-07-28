import "./style.css";
import { ShapeType, displayStats } from "./utils";
import { zoomableSVG } from "./svg/zoomable";
import * as SVG from "./svg";
import * as Canvas from "./canvas";

let active: "svg" | "canvas" = "svg";
let type: ShapeType = "hexagon";
let length = 1;
let withText = false;

const selectSvgBtn = document.getElementById("select-svg");
if (!selectSvgBtn) throw new Error("select-svg button not found");
const selectCanvasBtn = document.getElementById("select-canvas");
if (!selectCanvasBtn) throw new Error("select-canvas button not found");

const typeInput = document.getElementById("type") as HTMLInputElement;
if (!typeInput) throw new Error("type input not found");
const lengthInput = document.getElementById("length") as HTMLInputElement;
if (!lengthInput) throw new Error("length input not found");
const withTextInput = document.getElementById("with-text") as HTMLInputElement;
if (!withTextInput) throw new Error("with-text input not found");

const renderBtn = document.getElementById("render");
if (!renderBtn) throw new Error("render button not found");
const testBtn = document.getElementById("test");
if (!testBtn) throw new Error("test button not found");

typeInput.addEventListener("change", () => (type = typeInput.value as ShapeType));
lengthInput.addEventListener("change", () => (length = parseInt(lengthInput.value)));
withTextInput.addEventListener("change", () => (withText = withTextInput.checked));

function activateSvg() {
	active = "svg";
	selectSvgBtn?.classList.add("active");
	selectCanvasBtn?.classList.remove("active");
	SVG.svg.classList.remove("hidden");
	Canvas.canvas.classList.add("hidden");
}
function activateCanvas() {
	active = "canvas";
	selectSvgBtn?.classList.remove("active");
	selectCanvasBtn?.classList.add("active");
	SVG.svg.classList.add("hidden");
	Canvas.canvas.classList.remove("hidden");
}

selectSvgBtn.addEventListener("click", activateSvg);
selectCanvasBtn.addEventListener("click", activateCanvas);
activateSvg();

renderBtn.addEventListener("click", () => {
	if (active === "svg") {
		SVG.svg.innerHTML = "";
		const n = SVG.render(type, length, withText);
		displayStats(n);
	}
	if (active === "canvas") {
		const n = Canvas.render(type, length, withText);
		displayStats(n);
	}
});

testBtn.addEventListener("click", () => {
	if (active === "svg") {
		SVG.svg.innerHTML = "";
		SVG.test().then((results) => {
			console.log(results);
		});
	}
	if (active === "canvas") {
		Canvas.clear();
		Canvas.test().then((results) => {
			console.log(results);
		});
	}
});

zoomableSVG(SVG.svg, false);
