let audioCtx = null;
let isPlaying = false;
let timer = null;
let step = 0;

const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');
const points = [];

// Frecuencias base en Hz (Escala pentatónica ampliada)
const scale = [220, 246.94, 261.63, 293.66, 329.63, 349.23, 392.00, 440, 493.88, 523.25];

function getFibonacci(n) {
  let a = 0, b = 1;
  for (let i = 0; i < n; i++) {
    let temp = a + b;
    a = b;
    b = temp;
  }
  return a;
}

function calculateMathValue(type, n) {
  if (type === 'fibonacci') {
    return getFibonacci(n) % 4;
  } else if (type === 'fifths') {
    return (4 * n) % 7;
  } else if (type === 'pendulum') {
    return Math.floor(Math.abs(Math.sin(n * 0.4) * 6));
  }
  return 0;
}

function playNote(freq, duration = 0.2) {
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function tick() {
  const selectedFunc = document.getElementById('funcSelect').value;
  const value = calculateMathValue(selectedFunc, step);
  
  const noteFreq = scale[value % scale.length];
  playNote(noteFreq);

  points.push({ x: canvas.width, y: canvas.height - (value + 1) * 30 });
  if (points.length > 50) points.shift();

  drawUI(value);
  step++;
}

function drawUI(val) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#1e1e38';
  ctx.lineWidth = 1;
  for (let i = 0; i < canvas.width; i += 30) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.strokeStyle = '#00ffcc';
  ctx.lineWidth = 3;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const x = (i / 50) * canvas.width;
    if (i === 0) ctx.moveTo(x, p.y);
    else ctx.lineTo(x, p.y);
  }
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '16px monospace';
  ctx.fillText(`Paso (n): ${step}`, 20, 30);
  ctx.fillText(`f(n) = ${val}`, 20, 50);
}

document.getElementById('startBtn').addEventListener('click', () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (isPlaying) {
    clearInterval(timer);
    isPlaying = false;
    document.getElementById('startBtn').innerText = '▶ Iniciar';
  } else {
    isPlaying = true;
    document.getElementById('startBtn').innerText = '⏸ Pausar';
    timer = setInterval(tick, 180);
  }
});
