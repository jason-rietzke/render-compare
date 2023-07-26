import "./style.css";
import { zoomableSVG } from "./zoomable";
import * as SVG from "./svg";

const testSvgBtn = document.getElementById("test-svg");
if (!testSvgBtn) throw new Error("test-svg button not found");
testSvgBtn.addEventListener("click", () => {
	SVG.svg.innerHTML = "";
	SVG.test().then((results) => {
		console.log(results);
	});
});

SVG.svg.addEventListener("click", () => {
	SVG.svg.innerHTML = "";
	SVG.render("quater", 128, true);
});
zoomableSVG(SVG.svg, false);
