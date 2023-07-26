let svg: SVGSVGElement;
let useRequestAnimationFrame = false;
const minScale = 0.1;
const maxScale = 10;
let lastScale = 1;
let scale = 1;

export function zoomableSVG(el: SVGSVGElement, useRAF = false) {
	svg = el;
	useRequestAnimationFrame = useRAF;
	svg.addEventListener("wheel", (e) => {
		e.preventDefault();
		scale += e.deltaY * ((-0.01 * scale) / 4);
		if (e.deltaY < 0 && scale >= maxScale) scale = maxScale;
		if (e.deltaY > 0 && scale <= minScale) scale = minScale;
		if (!useRequestAnimationFrame) applyScale2SVG();
	});
	if (useRequestAnimationFrame) requestAnimationFrame(applyScale2SVG);
}
function applyScale2SVG() {
	if (useRequestAnimationFrame && lastScale === scale) return requestAnimationFrame(applyScale2SVG);
	lastScale = scale;
	const g = svg.getElementsByTagName("g")[0];
	if (!g) return;
	const svgSize = { width: svg.clientWidth, height: svg.clientHeight };
	const x = svgSize.width / 2 - (svgSize.width / 2) * scale;
	const y = svgSize.height / 2 - (svgSize.height / 2) * scale;
	g.setAttribute("transform", `translate(${x} ${y}) scale(${scale})`);
	if (useRequestAnimationFrame) requestAnimationFrame(applyScale2SVG);
}
