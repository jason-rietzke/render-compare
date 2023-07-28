import "./style.css";
import { displayStats } from "./utils";
import { zoomableSVG } from "./svg/zoomable";
import * as SVG from "./svg";
import * as Canvas from "./canvas";

let active: "svg" | "canvas" = "svg";
const selectSvgBtn = document.getElementById("select-svg");
if (!selectSvgBtn) throw new Error("select-svg button not found");
const selectCanvasBtn = document.getElementById("select-canvas");
if (!selectCanvasBtn) throw new Error("select-canvas button not found");
const testBtn = document.getElementById("test");
if (!testBtn) throw new Error("test button not found");

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

testBtn.addEventListener("click", () => {
	if (active === "svg") {
		SVG.svg.innerHTML = "";
		SVG.test().then((results) => {
			console.log(results);
		});
	}
});

SVG.svg.addEventListener("click", () => {
	SVG.svg.innerHTML = "";
	const n = SVG.render("quater", 128, true);
	displayStats(n);
});
zoomableSVG(SVG.svg, false);
