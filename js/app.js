let seedPoints = [];
let delaunay, voronoi;
let img;
let imagePath = "./data/img.jpg";
let imageLoaded = false;
let voronoiCells = [];
let exportButton;
let loadImageButton;
let fileInput;
let numSites = 3000;
let imageDisplayArea = { x: 0, y: 0, w: 0, h: 0 };

// Loads image before setup
function preload() {
  try {
    img = loadImage(
      imagePath,
      () => {
        console.log("Image loaded successfully");
        imageLoaded = true;
        if (typeof resizeCanvasForImage === 'function') {
          resizeCanvasForImage();
        }
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

  if (imageLoaded && img) {
    resizeCanvasForImage();
    generateSeedPoints();
  } else {
    imageDisplayArea.w = width;
    imageDisplayArea.h = height;
    imageDisplayArea.x = 0;
    imageDisplayArea.y = 0;
    generateSeedPoints();
  }

  fileInput = createFileInput(handleFileSelect);
  fileInput.parent("button");
  fileInput.attribute("accept", "image/*");
  fileInput.style("display", "none");
  
  loadImageButton = createButton('<span class="material-icons">image</span> Load Image');
  loadImageButton.parent("button");
  loadImageButton.mousePressed(() => fileInput.elt.click());
  loadImageButton.class("material-button");

  exportButton = createButton('<span class="material-icons">download</span> Export as SVG');
  exportButton.parent("button");
  exportButton.mousePressed(exportSVG);
  exportButton.class("material-button");

  if (imageLoaded && img) {
    delaunay = calculateDelaunay(seedPoints);
    calculateVoronoiWithColors();
  }
}

// Renders Voronoi cells
function draw() {
  background(0);

  if (imageLoaded && img && voronoiCells.length === 0) {
    delaunay = calculateDelaunay(seedPoints);
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

// Calculates canvas size and image display area to maintain aspect ratio
function resizeCanvasForImage() {
  if (!img) return;
  
  let imgAspect = img.width / img.height;
  let availableWidth = windowWidth;
  let availableHeight = windowHeight;
  let canvasWidth, canvasHeight;
  
  if (img.width > img.height) {
    canvasWidth = availableWidth;
    canvasHeight = availableWidth / imgAspect;
    if (canvasHeight > availableHeight) {
      canvasHeight = availableHeight;
      canvasWidth = availableHeight * imgAspect;
    }
  } else {
    canvasHeight = availableHeight;
    canvasWidth = availableHeight * imgAspect;
    if (canvasWidth > availableWidth) {
      canvasWidth = availableWidth;
      canvasHeight = availableWidth / imgAspect;
    }
  }
  
  resizeCanvas(canvasWidth, canvasHeight);
  
  imageDisplayArea.w = canvasWidth;
  imageDisplayArea.h = canvasHeight;
  imageDisplayArea.x = 0;
  imageDisplayArea.y = 0;
}

// Generates seed points within the image display area
function generateSeedPoints() {
  seedPoints = [];
  for (let i = 0; i < numSites; i++) {
    seedPoints[i] = createVector(
      random(imageDisplayArea.x, imageDisplayArea.x + imageDisplayArea.w),
      random(imageDisplayArea.y, imageDisplayArea.y + imageDisplayArea.h)
    );
  }
}

// Handles file selection and loads new image
function handleFileSelect(file) {
  if (file.file && file.file.type.startsWith("image/")) {
    let reader = new FileReader();
    reader.onload = function(e) {
      img = loadImage(e.target.result,
        () => {
          imageLoaded = true;
          voronoiCells = [];
          resizeCanvasForImage();
          generateSeedPoints();
          delaunay = calculateDelaunay(seedPoints);
          calculateVoronoiWithColors();
        },
        () => {
          alert("Failed to load image. Please try another file.");
        }
      );
    };
    reader.readAsDataURL(file.file);
  } else {
    alert("Please select an image file.");
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
