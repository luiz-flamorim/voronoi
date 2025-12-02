// Converts points to D3 Delaunay format
function calculateDelaunay(points) {
  let pointsArray = [];
  for (let v of points) {
    pointsArray.push(v.x, v.y);
  }
  return new d3.Delaunay(pointsArray);
}

// Calculates Voronoi diagram and samples colors from image
function calculateVoronoiWithColors() {
  if (!img) return;

  console.log("Calculating Voronoi with colors...");
  let startTime = millis();

  img.loadPixels();

  voronoi = delaunay.voronoi([
    imageDisplayArea.x, 
    imageDisplayArea.y, 
    imageDisplayArea.x + imageDisplayArea.w, 
    imageDisplayArea.y + imageDisplayArea.h
  ]);
  let polygons = voronoi.cellPolygons();

  voronoiCells = [];
  for (let poly of polygons) {
    let avgColor = sampleColorFromPolygon(poly);

    let polygonArray = [];
    for (let i = 0; i < poly.length; i++) {
      polygonArray.push([poly[i][0], poly[i][1]]);
    }

    voronoiCells.push({
      polygon: polygonArray,
      color: avgColor,
    });
  }

  console.log(
    "Voronoi with colors calculated in",
    (millis() - startTime) / 1000,
    "seconds"
  );
}

// Samples and averages colors from image for a polygon
function sampleColorFromPolygon(polygon) {
  if (polygon.length === 0) return color(128, 128, 128);

  let samples = [];

  for (let i = 0; i < polygon.length; i++) {
    let p = polygon[i];
    let imgX = floor(map(p[0], imageDisplayArea.x, imageDisplayArea.x + imageDisplayArea.w, 0, img.width));
    let imgY = floor(map(p[1], imageDisplayArea.y, imageDisplayArea.y + imageDisplayArea.h, 0, img.height));
    imgX = constrain(imgX, 0, img.width - 1);
    imgY = constrain(imgY, 0, img.height - 1);

    let index = (imgY * img.width + imgX) * 4;
    samples.push({
      r: img.pixels[index],
      g: img.pixels[index + 1],
      b: img.pixels[index + 2],
    });
  }

  let cx = 0,
    cy = 0;
  for (let p of polygon) {
    cx += p[0];
    cy += p[1];
  }
  cx /= polygon.length;
  cy /= polygon.length;

  let imgX = floor(map(cx, imageDisplayArea.x, imageDisplayArea.x + imageDisplayArea.w, 0, img.width));
  let imgY = floor(map(cy, imageDisplayArea.y, imageDisplayArea.y + imageDisplayArea.h, 0, img.height));
  imgX = constrain(imgX, 0, img.width - 1);
  imgY = constrain(imgY, 0, img.height - 1);

  let index = (imgY * img.width + imgX) * 4;
  samples.push({
    r: img.pixels[index],
    g: img.pixels[index + 1],
    b: img.pixels[index + 2],
  });

  if (samples.length > 0) {
    let r = 0,
      g = 0,
      b = 0;
    for (let s of samples) {
      r += s.r;
      g += s.g;
      b += s.b;
    }
    return color(r / samples.length, g / samples.length, b / samples.length);
  }

  return color(128, 128, 128);
}
