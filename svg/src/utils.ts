export type ShapeType = "hexagon" | "quater";
export type Result = {
	shapeType: ShapeType;
	elementCount: number;
	withText: boolean;
	duration: number;
};

console.debug("available PerformanceObserver supportedEntryTypes:", PerformanceObserver.supportedEntryTypes);

export function observeLongtasks(
	cb: (duration: number, entry: PerformanceEntry[]) => void,
	autoDisconnect = true,
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
