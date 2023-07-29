# Render Compare

## Table of Contents

-   [About](#about)
-   [Results](#results)
    -   [SVG](#results-svg)
    -   [Canvas 2D](#results-canvas-2d)
-   [Comparison](#comparison)
    -   [SVG vs Canvas Comparison](#comparison-svg-vs-canvas)

## About <a name = "about"></a>

Comparing different rendering strategies for web applications.  
Aiming to find the best strategy to improve the performance of libraries like [Graphly D3](https://docs.graphly.dev)

## Results <a name = "results"></a>

All tests were run on a 2021 MacBook Pro M1 Max `64GB RAM`, `10-Core CPU`, `24-Core GPU` on `macOS Ventura 13.4.1`.

The time measurements are performed using the Chrome DevTools Performance tab by recording how long the initial render takes.

The `Hexagon` type is composed of 6 lines and resembles a fairly primitive shape since it has no curves.  
The `Quater` type is composed of 2 lines and a arc and is therefore more complex to render.  
Text blocks are bringing additional complexity to the rendering process.

### SVG <a name = "results-svg"></a>

| Type    | +Text | Elements | Time (ms) |
| ------- | :---: | -------: | --------: |
| Hexagon |       |    1,024 |       7ms |
| Hexagon |  ✅   |    1,024 |      23ms |
| Quater  |       |    1,024 |       7ms |
| Quater  |  ✅   |    1,024 |      24ms |
| Hexagon |       |    4,096 |      33ms |
| Hexagon |  ✅   |    4,096 |     100ms |
| Quater  |       |    4,096 |      23ms |
| Quater  |  ✅   |    4,096 |      93ms |
| Hexagon |       |   16,384 |     111ms |
| Hexagon |  ✅   |   16,384 |     453ms |
| Quater  |       |   16,384 |      98ms |
| Quater  |  ✅   |   16,384 |     387ms |

> Somewhat surprisingly, the easier `Hexagon` type is slower to render than the more complex `Quater` type.

---

### Canvas 2D <a name = "results-canvas-2d"></a>

| Type    | +Text | Elements | Time (ms) |
| ------- | :---: | -------: | --------: |
| Hexagon |       |    1,024 |      17ms |
| Hexagon |  ✅   |    1,024 |      21ms |
| Quater  |       |    1,024 |      15ms |
| Quater  |  ✅   |    1,024 |      19ms |
| Hexagon |       |    4,096 |      52ms |
| Hexagon |  ✅   |    4,096 |      69ms |
| Quater  |       |    4,096 |      34ms |
| Quater  |  ✅   |    4,096 |      50ms |
| Hexagon |       |   16,384 |     204ms |
| Hexagon |  ✅   |   16,384 |     254ms |
| Quater  |       |   16,384 |     172ms |
| Quater  |  ✅   |   16,384 |     206ms |

> Outstanding is the decreased overhead of rendering text blocks on the canvas compared to SVG.

## Comparison <a name = "comparison"></a>

Comparing the results for 16,384 elements.

### SVG vs Canvas Comparison <a name = "comparison-svg-vs-canvas"></a>

|  Strategy | Type    |  Time (+Text) | Text Overhead |
| --------: | :------ | ------------: | ------------- |
|       SVG | Hexagon | 111ms (453ms) | 342ms (75.5%) |
|       SVG | Quater  |  98ms (387ms) | 289ms (74.7%) |
| Canvas 2D | Hexagon | 204ms (254ms) | 50ms (19.7%)  |
| Canvas 2D | Quater  | 172ms (206ms) | 34ms (16.5%)  |
