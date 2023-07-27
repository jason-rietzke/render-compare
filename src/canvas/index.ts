import type { ShapeType, Result } from "../utils";
import { observeLongtasks } from "../utils";

export const canvas = document.getElementsByTagName("canvas")[0];
if (!canvas) throw new Error("canvas not found");

