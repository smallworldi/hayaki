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

  switch(type) {
    case 'hex':
      drawHexBadge(ctx, size, badgeColor);
      break;
    case 'shield':
      drawShieldBadge(ctx, size, badgeColor);
      break;
    case 'circle':
      drawCircleBadge(ctx, size, badgeColor);
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

function drawHexBadge(ctx, size, color) {
  ctx.beginPath();
  for(let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = size/2 + (size/3) * Math.cos(angle);
    const y = size/2 + (size/3) * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawShieldBadge(ctx, size, color) {
  ctx.beginPath();
  ctx.moveTo(size/2, size/6);
  ctx.lineTo(size*5/6, size/2);
  ctx.lineTo(size/2, size*5/6);
  ctx.lineTo(size/6, size/2);
  ctx.closePath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawCircleBadge(ctx, size, color) {
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/3, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function createLevelBadge(level, size = 40) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  const color = level % 10 === 0 ? '#808080' : getBadgeColor(Math.floor(level/100) * 100);
  
  // Escolhe o formato baseado no nível
  if (level <= 100) {
    // Círculo para níveis 0-100
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2 - 2, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (level <= 300) {
    // Hexágono para níveis 101-300
    ctx.beginPath();
    for(let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = size/2 + (size/2 - 2) * Math.cos(angle);
      const y = size/2 + (size/2 - 2) * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  } else {
    // Escudo para níveis 301+
    ctx.beginPath();
    ctx.moveTo(size/2, 2);
    ctx.lineTo(size-2, size/2);
    ctx.lineTo(size/2, size-2);
    ctx.lineTo(2, size/2);
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
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
