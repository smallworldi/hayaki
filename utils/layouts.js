
const { createCanvas } = require('canvas');

const layouts = {
  profileCardWhite: (width, height) => {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Bottom panel - white version
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 300, width, 276);
    
    // Text layout - black text
    ctx.fillStyle = '#000000';
    ctx.font = '22px Arial';
    ctx.fillText('NOME', 20, 380);
    ctx.fillText('ID', 20, 435);
    ctx.fillText('SALDO', 20, 490);
    ctx.fillText('XP/META', 20, 545);
    
    // Level text - black
    ctx.fillText('LEVEL', 820, 390);
    ctx.fillText('RANKING LEVEL', 820, 440);
    
    return canvas;
  },

  profileCard: (width, height) => {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Bottom panel
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 300, width, 276);
    
    // Text layout
    ctx.fillStyle = '#fff';
    ctx.font = '22px Arial';
    ctx.fillText('NOME', 20, 380);
    ctx.fillText('ID', 20, 435);
    ctx.fillText('SALDO', 20, 490);
    ctx.fillText('XP/META', 20, 545);
    
    // Level text
    ctx.fillText('LEVEL', 820, 390);
    ctx.fillText('RANKING LEVEL', 820, 440);
    
    return canvas;
  },
  
  layout1: (width, height) => {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Layout 1: Modern with gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#2c3e50');
    gradient.addColorStop(1, '#3498db');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    return canvas;
  },
  
  layout2: (width, height) => {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Layout 2: Minimalist with border
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#gold';
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, width - 20, height - 20);
    
    return canvas;
  },
  
  layout3: (width, height) => {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Layout 3: Split design
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, width/2, height);
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(width/2, 0, width/2, height);
    
    return canvas;
  }
};

module.exports = layouts;
