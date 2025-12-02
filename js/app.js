let seedPoints = [];
let delaunay, voronoi;
let img;
let imagePath = "./data/img.jpg";
let imageLoaded = false;
let voronoiCells = [];
let exportButton;
let numSites = 3000;

// Loads image before setup
function preload() {
  try {
    img = loadImage(
      imagePath,
      () => {
        console.log("Image loaded successfully");
        imageLoaded = true;
      },
      () => {
        console.error("Failed to load image. Please check the image path.");
      }
    );
  } catch (e) {
    console.error("Error loading image:", e);
  }
}

// Initializes canvas, sites, and button
function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("visualization");

  for (let i = 0; i < numSites; i++) {
    seedPoints[i] = createVector(random(width), random(height));
  }

  exportButton = createButton("Export as SVG");
  exportButton.parent("button");
  exportButton.mousePressed(exportSVG);
  exportButton.style("padding", "10px 20px");
  exportButton.style("font-size", "16px");
  exportButton.style("cursor", "pointer");

  delaunay = calculateDelaunay(seedPoints);

  if (imageLoaded && img) {
    calculateVoronoiWithColors();
  }
}

// Renders Voronoi cells
function draw() {
  background(0);

  if (imageLoaded && img && voronoiCells.length === 0) {
    calculateVoronoiWithColors();
  }

  if (voronoiCells.length > 0) {
    for (let cell of voronoiCells) {
      fill(cell.color);
      noStroke();
      beginShape();
      for (let point of cell.polygon) {
        vertex(point[0], point[1]);
      }
      endShape(CLOSE);
    }
  } else if (!imageLoaded) {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(20);
    text("Loading image...", width / 2, height / 2);
  }
}

// Exports Voronoi diagram as SVG file
function exportSVG() {
  if (voronoiCells.length === 0) {
    alert("Please wait for the Voronoi diagram to finish calculating.");
    return;
  }

  console.log("Exporting SVG...");

  let svgContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
  svgContent +=
    '<svg width="' +
    width +
    '" height="' +
    height +
    '" xmlns="http://www.w3.org/2000/svg">\n';

  for (let cell of voronoiCells) {
    if (cell.polygon.length > 0) {
      let c = cell.color;
      let r = red(c);
      let g = green(c);
      let b = blue(c);

      let points = "";
      for (let point of cell.polygon) {
        points += point[0] + "," + point[1] + " ";
      }

      svgContent +=
        '  <polygon points="' +
        points.trim() +
        '" fill="rgb(' +
        r +
        "," +
        g +
        "," +
        b +
        ')" stroke="none"/>\n';
    }
  }

  svgContent += "</svg>";

  let blob = new Blob([svgContent], { type: "image/svg+xml" });
  let url = URL.createObjectURL(blob);
  let link = document.createElement("a");
  link.href = url;
  link.download = "voronoi-diagram.svg";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  console.log("SVG exported!");
}

