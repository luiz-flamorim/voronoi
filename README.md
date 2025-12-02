# Voronoi Diagram Generator

A web-based tool that generates Voronoi diagrams from images using p5.js and D3 Delaunay. Each Voronoi cell is colored based on the average color sampled from the underlying image.

## What is a Voronoi Diagram?

A Voronoi diagram partitions a plane into regions based on distance to a set of seed points. Each region (cell) contains all points that are closer to its seed point than to any other seed point. The boundaries between cells are formed by the perpendicular bisectors of lines connecting neighboring seed points.

In this implementation, random seed points are generated, and the resulting Voronoi cells are colored by sampling and averaging colors from an underlying image.

## Required Libraries

- **p5.js** (v1.8.0) - For canvas rendering and image processing
- **d3-delaunay** (v6) - For efficient Voronoi diagram calculation

Both libraries are loaded via CDN in `index.html`.

## Key Features

- **Image-based color sampling**: Each Voronoi cell's color is determined by averaging colors sampled from the image at polygon vertices and center point
- **SVG export**: Export the generated Voronoi diagram as a vector SVG file
- **Fast computation**: Uses D3's optimized Delaunay triangulation for efficient Voronoi calculation

## Usage

1. Place your image in the `data/` folder and update `imagePath` in `app.js`
2. Adjust `numSites` to control the number of Voronoi cells (more cells = more detail)
3. Open `index.html` in a web browser
4. Wait for the image to load and the Voronoi diagram to generate
5. Click "Export as SVG" to download the result

## Project Structure

```
├── index.html          # Main HTML file
├── js/
│   ├── voronoi-core.js # Core Voronoi calculation logic
│   └── app.js          # Main application logic
├── style/
│   └── style.css       # Stylesheet
└── data/
    └── img.jpg         # Source image
```

Example image sourced via [Freepik](https://www.freepik.com)