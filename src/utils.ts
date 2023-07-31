export type ShapeType = "hexagon" | "quarter";
export type Result = {
	shapeType: ShapeType;
	elementCount: number;
	withText: boolean;
	duration: number;
};

console.debug("available PerformanceObserver supportedEntryTypes:", PerformanceObserver.supportedEntryTypes);

export function observeLongtasks(
	cb: (duration: number, entry: PerformanceEntry[]) => void,
	autoDisconnect = true
): PerformanceObserver | void {
	if (!("PerformanceObserver" in window)) return console.warn("PerformanceObserver not supported");
	if (!PerformanceObserver.supportedEntryTypes.includes("longtask"))
		return console.warn("PerformanceObserver does not support longtask");

	const observer = new PerformanceObserver((list) => {
		const entries = list.getEntries();
		const duration = entries.reduce((acc, entry) => acc + entry.duration, 0);
		cb(duration, entries);
		if (autoDisconnect) observer.disconnect();
	});
	observer.observe({ type: "longtask", buffered: false });
	return observer;
}

const stats = document.getElementById("stats");
export function displayStats(shapes: number) {
	if (!stats) throw new Error("stats element not found");
	const content = [`${shapes} shapes rendered`].join("\n");
	stats.textContent = content;
}

export function hexagonPath(r: number) {
	const b = (Math.sqrt(3) / 2) * r;
	return `M 0 0 l ${r} 0 l ${r / 2} ${b} l ${-r / 2} ${b} l ${-r} 0 l ${-r / 2} ${-b} l ${r / 2} ${-b} l ${r} 0 Z`;
}
export function quarterPath(r: number) {
	const d = r * 2;
	return `M 0 0 L ${d} 0 A ${d} ${d} 0 0 1 1 ${d} Z`;
}
