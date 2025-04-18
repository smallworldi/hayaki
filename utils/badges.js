const { createCanvas } = require('@napi-rs/canvas');

function createBadge(type, size = 40) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Common badge background
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
  ctx.fillStyle = '#2c2f33';
  ctx.fill();

  // Get badge color based on type
  const badgeColor = getBadgeColor(type);
  const colors = generateGradientColors(badgeColor);


  switch(type) {
    case 'hex':
      drawHexBadge(ctx, size, colors);
      break;
    case 'shield':
      drawShieldBadge(ctx, size, colors);
      break;
    case 'circle':
      drawCircleBadge(ctx, size, colors);
      break;
  }

  return canvas.toBuffer('image/png');
}

function getBadgeColor(type) {
  const colors = {
    0: '#FFFFFF',    // Branco
    100: '#FF0000',  // Vermelho
    200: '#FF6600',  // Laranja
    300: '#FFFF00',  // Amarelo
    400: '#00FF00',  // Verde
    500: '#0099FF',  // Azul
    600: '#6633FF',  // Roxo
    700: '#FF00FF',  // Rosa
    800: '#990000'   // Vermelho escuro
  };
  return colors[type] || '#FFFFFF';
}

function generateGradientColors(baseColor) {
  // Generate lighter and darker shades for gradient
  const lighterColor = lightenDarkenColor(baseColor, 20);
  const darkerColor = lightenDarkenColor(baseColor, -20);
  return [lighterColor, baseColor, darkerColor];
}

function lightenDarkenColor(color, amount) {
  let usePound = false;

  if (color[0] == "#") {
    color = color.slice(1);
    usePound = true;
  }

  const num = parseInt(color, 16);
  let r = (num >> 16) + amount;
  if (r > 255) r = 255;
  else if  (r < 0) r = 0;
  let b = ((num >> 8) & 0x00FF) + amount;
  if (b > 255) b = 255;
  else if  (b < 0) b = 0;
  let g = (num & 0x0000FF) + amount;
  if (g > 255) g = 255;
  else if (g < 0) g = 0;

  return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
}

function createGradient(ctx, size, colors) {
  const gradient = ctx.createLinearGradient(0, 0, size, 0);
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(0.5, colors[1]);
  gradient.addColorStop(1, colors[2]);
  return gradient;
}


function drawHexBadge(ctx, size, colors) {
  const gradient = createGradient(ctx, size, colors);
  ctx.beginPath();
  for(let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = size/2 + (size/3) * Math.cos(angle);
    const y = size/2 + (size/3) * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Brilho
  ctx.beginPath();
  ctx.moveTo(size/3, size/3);
  ctx.lineTo(size/2, size/3);
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawShieldBadge(ctx, size, colors) {
  const gradient = createGradient(ctx, size, colors);
  ctx.beginPath();
  ctx.moveTo(size/2, size/6);
  ctx.lineTo(size*5/6, size/2);
  ctx.lineTo(size/2, size*5/6);
  ctx.lineTo(size/6, size/2);
  ctx.closePath();
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Brilho
  ctx.beginPath();
  ctx.moveTo(size/3, size/3);
  ctx.lineTo(size/2, size/3);
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawCircleBadge(ctx, size, colors) {
  const gradient = createGradient(ctx, size, colors);
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/3, 0, Math.PI * 2);
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Brilho
  ctx.beginPath();
  ctx.arc(size/3, size/3, size/10, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fill();
}

function createLevelBadge(level, size = 40) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  const color = level % 10 === 0 ? '#808080' : getBadgeColor(Math.floor(level/100) * 100);
  const colors = generateGradientColors(color);

  // Escolhe o formato baseado no nível
  if (level <= 100) {
    // Círculo para níveis 0-100
    drawCircleBadge(ctx, size, colors);
  } else if (level <= 300) {
    // Hexágono para níveis 101-300
    drawHexBadge(ctx, size, colors);
  } else {
    // Escudo para níveis 301+
    drawShieldBadge(ctx, size, colors);
  }

  // Level text
  ctx.fillStyle = color;
  ctx.font = 'bold ' + (size/2.5) + 'px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(level.toString(), size/2, size/2);

  return canvas.toBuffer('image/png');
}

module.exports = { createBadge, createLevelBadge };
