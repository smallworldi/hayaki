
const { createCanvas } = require('@napi-rs/canvas');

function createBadge(type, size = 40) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Common badge background
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
  ctx.fillStyle = '#2c2f33';
  ctx.fill();

  switch(type) {
    case 'hex':
      drawHexBadge(ctx, size);
      break;
    case 'diamond':
      drawDiamondBadge(ctx, size);
      break;
    case 'star':
      drawStarBadge(ctx, size);
      break;
    case 'spiral':
      drawSpiralBadge(ctx, size);
      break;
    case 'flower':
      drawFlowerBadge(ctx, size);
      break;
  }

  return canvas.toBuffer('image/png');
}

function drawHexBadge(ctx, size) {
  ctx.beginPath();
  for(let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = size/2 + (size/3) * Math.cos(angle);
    const y = size/2 + (size/3) * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.strokeStyle = '#9a46ca';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawDiamondBadge(ctx, size) {
  ctx.beginPath();
  ctx.moveTo(size/2, size/4);
  ctx.lineTo(size*3/4, size/2);
  ctx.lineTo(size/2, size*3/4);
  ctx.lineTo(size/4, size/2);
  ctx.closePath();
  ctx.strokeStyle = '#ff5555';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawStarBadge(ctx, size) {
  const spikes = 5;
  const outerRadius = size/2;
  const innerRadius = size/4;
  
  ctx.beginPath();
  for(let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (Math.PI / spikes) * i;
    const x = size/2 + radius * Math.cos(angle - Math.PI/2);
    const y = size/2 + radius * Math.sin(angle - Math.PI/2);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.strokeStyle = '#ffaa00';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawSpiralBadge(ctx, size) {
  ctx.beginPath();
  for(let i = 0; i < 720; i++) {
    const angle = 0.1 * i;
    const radius = (size/4) * (1 - i/720);
    const x = size/2 + radius * Math.cos(angle);
    const y = size/2 + radius * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.strokeStyle = '#55ff55';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawFlowerBadge(ctx, size) {
  const petals = 6;
  for(let i = 0; i < petals; i++) {
    ctx.beginPath();
    const angle = (Math.PI * 2 / petals) * i;
    ctx.ellipse(
      size/2 + (size/6) * Math.cos(angle),
      size/2 + (size/6) * Math.sin(angle),
      size/6,
      size/8,
      angle,
      0,
      Math.PI * 2
    );
    ctx.strokeStyle = '#5555ff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function createLevelBadge(level, size = 40) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Badge circle outline
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2 - 2, 0, Math.PI * 2);
  ctx.strokeStyle = level % 10 === 0 ? '#808080' : '#4a90e2';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Level text
  ctx.fillStyle = level % 10 === 0 ? '#808080' : '#4a90e2';
  ctx.font = 'bold ' + (size/2.5) + 'px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(level.toString(), size/2, size/2);
  
  return canvas.toBuffer('image/png');
}

module.exports = { createBadge, createLevelBadge };
