const { createCanvas } = require('canvas');

function hslToCss(h, s = 80, l = 60) {
  return `hsl(${h}, ${s}%, ${l}%)`;
}
function hslaToCss(h, s = 80, l = 60, a = 1) {
  return `hsla(${h}, ${s}%, ${l}%, ${a})`;
}

function drawCircle(ctx, size, gradient) {
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2 - 2, 0, Math.PI * 2);
  ctx.lineWidth = 1;
  ctx.strokeStyle = gradient;
  ctx.stroke();
}
function drawTriangle(ctx, size, gradient) {
  ctx.beginPath();
  ctx.moveTo(size/2, 2);
  ctx.lineTo(size - 2, size - 2);
  ctx.lineTo(2, size - 2);
  ctx.closePath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = gradient;
  ctx.stroke();
}
function drawSquare(ctx, size, gradient) {
  ctx.beginPath();
  ctx.rect(2, 2, size - 4, size - 4);
  ctx.lineWidth = 1;
  ctx.strokeStyle = gradient;
  ctx.stroke();
}
function drawPentagon(ctx, size, gradient) {
  const angle = (2 * Math.PI) / 5;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const x = size/2 + (size/2 - 2) * Math.cos(angle * i - Math.PI/2);
    const y = size/2 + (size/2 - 2) * Math.sin(angle * i - Math.PI/2);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = gradient;
  ctx.stroke();
}
function drawHexagon(ctx, size, gradient) {
  const angle = (2 * Math.PI) / 6;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const x = size/2 + (size/2 - 2) * Math.cos(angle * i);
    const y = size/2 + (size/2 - 2) * Math.sin(angle * i);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = gradient;
  ctx.stroke();
}

function drawOctagon(ctx, size, gradient) {
  const angle = (2 * Math.PI) / 8;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const x = size / 2 + (size / 2 - 2) * Math.cos(angle * i - Math.PI / 8);
    const y = size / 2 + (size / 2 - 2) * Math.sin(angle * i - Math.PI / 8);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = gradient;
  ctx.stroke();
}

function drawDiamond(ctx, size, gradient) {
  ctx.beginPath();
  ctx.moveTo(size / 2, 2);
  ctx.lineTo(size - 2, size / 2);
  ctx.lineTo(size / 2, size - 2);
  ctx.lineTo(2, size / 2);
  ctx.closePath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = gradient;
  ctx.stroke();
}

function createHueGradient(ctx, size, hue) {
  const start = hslToCss(hue);
  const end = hslaToCss(hue, 80, 60, 0);
  const gradient = ctx.createLinearGradient(0, 0, size, 0);
  gradient.addColorStop(0, start);
  gradient.addColorStop(1, end);
  return gradient;
}

function createLevelBadge(level, size = 40) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  const hue = (level * 12) % 360;
  const gradient = createHueGradient(ctx, size, hue);

  if (level <= 50) drawCircle(ctx, size, gradient);
  else if (level <= 100) drawTriangle(ctx, size, gradient);
  else if (level <= 200) drawSquare(ctx, size, gradient);
  else if (level <= 300) drawPentagon(ctx, size, gradient);
  else if (level <= 400) drawHexagon(ctx, size, gradient);
  else if (level <= 500) drawOctagon(ctx, size, gradient); // Octágono entre 400 e 500
  else drawDiamond(ctx, size, gradient); // Losango acima de 500

  ctx.fillStyle = hslaToCss(hue, 80, 60, 0.6);
  ctx.font = `bold ${Math.floor(size / 3)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(level.toString(), size / 2, size / 2);

  return canvas.toBuffer('image/png');
}

function createBadge(type, size = 40) {
  const level = Number(type) || 0;
  return createLevelBadge(level, size);
}

module.exports = { createLevelBadge, createBadge };
