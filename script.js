'use strict';

/* =========================================================
   DATOS PERSONALIZABLES
   (Los títulos y textos de los recuerdos están en index.html)
   ========================================================= */
const CONFIG = {
  // Inicio de la relación, en hora de Perú (-05:00)
  fechaInicio: '2018-12-21T00:00:00-05:00',

  // Canción: ID del video de YouTube
  youtubeId: 'TTP-X8T2lGo',
  // Opcional: si colocas este archivo, se usa en lugar de YouTube
  mp3: 'audio/cancion.mp3',

  // Respaldo por si no encuentra la carpeta local "images/"
  fotosRespaldo: 'https://raw.githubusercontent.com/InnovacionesEdwin/Feliz26A-osDino/main/images/',

  // Mensaje que ella copia al canjear el vale
  mensajeCanje: '¡Mi amor! Quiero canjear mi vale por una cita especial 🦕💚',

  // Velocidad de la máquina de escribir (milisegundos por letra)
  velocidadCarta: 22,
};

/* CARTA: cada texto entre comillas invertidas es un párrafo */
const CARTA = [
  `Mi intención, desde el primer día que te vi, siempre fue amarte de una manera leal, algo que actualmente no se ve. En todo este tiempo no he besado, y menos me he acostado, con ninguna otra mujer que no seas tú.`,
  `Eres esa persona con corazón de pollo que amaré por siempre. Hicimos muchas primeras veces en muchas cosas; por ende, eres la persona más especial que puedo tener y quiero tener hasta el último día de mi vida.`,
  `Por desgracia, no sabemos si moriremos viejitos o jóvenes, pero creo que mientras estemos juntos, apoyándonos, podemos decir que existe aún el amor bonito.`,
  `Sabes que más me encantas sin maquillaje, y cuando perreas borrachita eres una loquita.`,
  `No sabes nada cómo me siento al hacer esto manual. Nada puede describir el dolor de mi corazón, pero, ¿sabes?, a pesar de eso yo siempre estuve para ti, viéndote crecer. E inclusive si llegabas a ser mejor que yo, simplemente me alegraría, porque eres mi pareja y estamos para apoyarnos.`,
  `Hice muchas cosas para que estés bien. Sé que también pasamos por malos momentos, pero nadie dijo que este mundo es color de rosa.`,
  `Yo sí reconozco ahora que muchas veces hice mal. Mi amor, te pido perdón por todas esas veces en las que no supe expresarme y te veías afectada. Ahora tu dolor está en mí, y aunque te podría decir muchas cosas, no sabrías en sí cómo es estar en la mente de una persona como yo en las noches.`,
  `Pero ¿sabes algo? Al menos con el nacimiento del Vabe y conocerte a ti pude liberar mi alma de sus ataduras. Siempre estaré agradecido con ustedes por querer siempre estar ahí y cambiar las cosas en mi vida.`,
  `ありがとう`,
];

const $ = (sel) => document.querySelector(sel);
const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Notificaciones tipo toast ---------- */
function toast(mensaje, enlace) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = mensaje;
  if (enlace) {
    const a = document.createElement('a');
    Object.assign(a, { href: enlace.url, target: '_blank', rel: 'noopener', textContent: enlace.texto });
    t.append(' ', a);
  }
  $('#toasts').append(t);
  setTimeout(() => t.remove(), enlace ? 9000 : 4500);
}

/* ---------- Fotos: respaldo si no cargan ---------- */
document.querySelectorAll('img[data-n]').forEach((img) => {
  const fallo = () => {
    if (!img.dataset.respaldo) {
      img.dataset.respaldo = '1';
      img.src = `${CONFIG.fotosRespaldo}recuerdo-${img.dataset.n}.jpg`;
    } else {
      img.parentElement.classList.add('sin-foto');
    }
  };
  img.addEventListener('error', fallo);
  if (img.complete && img.naturalWidth === 0 && img.loading !== 'lazy') fallo();
});

/* =========================================================
   MÚSICA: primero busca el MP3; si no existe, usa YouTube
   ========================================================= */
const enlaceYT = { url: `https://www.youtube.com/watch?v=${CONFIG.youtubeId}`, texto: 'Abrir en YouTube' };
const esArchivoLocal = location.protocol === 'file:'; // YouTube no permite insertar videos así
let modo = null;        // 'mp3' | 'youtube'
let yt = null;
let ytListo = false;
let quiereSonar = false;

const audio = new Audio();
audio.loop = true;
audio.preload = 'auto';

const marcarSonando = (si) => {
  $('#reproductor').classList.toggle('sonando', si);
  $('#btn-musica').setAttribute('aria-label', si ? 'Pausar canción' : 'Reproducir canción');
};
audio.addEventListener('play', () => marcarSonando(true));
audio.addEventListener('pause', () => marcarSonando(false));
audio.addEventListener('canplay', () => {
  if (modo === 'mp3') return;
  modo = 'mp3';
  $('#btn-video').hidden = true;
  mostrarVideo(false);
  if (yt && ytListo) yt.pauseVideo();
  if (quiereSonar) reproducir();
}, { once: true });
audio.addEventListener('error', () => { if (!esArchivoLocal) cargarYouTube(); });
audio.src = CONFIG.mp3;

function cargarYouTube() {
  window.onYouTubeIframeAPIReady = () => {
    yt = new YT.Player('yt', {
      width: 200, height: 200, videoId: CONFIG.youtubeId,
      playerVars: { playsinline: 1, loop: 1, playlist: CONFIG.youtubeId, rel: 0 },
      events: {
        onReady: () => { ytListo = true; modo = 'youtube'; if (quiereSonar) reproducir(); },
        onStateChange: (e) => marcarSonando(e.data === YT.PlayerState.PLAYING),
        onError: () => toast('No se pudo cargar la canción aquí.', enlaceYT),
      },
    });
  };
  const s = document.createElement('script');
  s.src = 'https://www.youtube.com/iframe_api';
  s.onerror = () => toast('Sin conexión con YouTube.', enlaceYT);
  document.head.append(s);
}

function mostrarVideo(si) {
  $('#video-caja').classList.toggle('visible', si);
  $('#video-caja').inert = !si;
  $('#btn-video').setAttribute('aria-expanded', String(si));
}
mostrarVideo(false);

function reproducir() {
  quiereSonar = true;
  if (modo === 'mp3') {
    audio.play().catch(() => toast('Toca el botón de reproducir para escuchar la canción.'));
  } else if (modo === 'youtube') {
    yt.playVideo();
    // Algunos celulares bloquean el inicio automático
    setTimeout(() => {
      if (quiereSonar && yt.getPlayerState() !== YT.PlayerState.PLAYING) {
        mostrarVideo(true);
        toast('Toca el video para iniciar nuestra canción.');
      }
    }, 2500);
  } else if (esArchivoLocal) {
    toast('Para escuchar la canción:', enlaceYT);
  }
}

$('#btn-musica').addEventListener('click', () => {
  if ($('#reproductor').classList.contains('sonando')) {
    quiereSonar = false;
    if (modo === 'mp3') audio.pause(); else yt.pauseVideo();
  } else {
    reproducir();
  }
});
$('#btn-video').addEventListener('click', () => {
  if (esArchivoLocal) { toast('El video se ve al publicar la página.', enlaceYT); return; }
  mostrarVideo(!$('#video-caja').classList.contains('visible'));
});

/* =========================================================
   PARTÍCULAS (Canvas puro)
   ========================================================= */
const lienzo = $('#particulas');
const ctx = lienzo.getContext('2d');
let particulas = [];
let animando = false;

function ajustarLienzo() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  lienzo.width = innerWidth * dpr;
  lienzo.height = innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
addEventListener('resize', ajustarLienzo);
ajustarLienzo();

const azar = (a, b) => a + Math.random() * (b - a);

function lanzar(cantidad, colores, tipo) {
  if (sinMovimiento) return;
  for (let i = 0; i < cantidad; i++) {
    const lluvia = tipo === 'lluvia';
    particulas.push({
      x: lluvia ? azar(0, innerWidth) : innerWidth / 2,
      y: lluvia ? azar(-innerHeight, -10) : innerHeight * .55,
      vx: lluvia ? azar(-.6, .6) : azar(-7, 7),
      vy: lluvia ? azar(2, 5) : azar(-13, -3),
      g: lluvia ? .015 : .22,
      r: azar(4, 9),
      giro: azar(0, 6.28),
      vg: azar(-.12, .12),
      color: colores[i % colores.length],
      forma: ['hoja', 'corazon', 'circulo'][i % 3],
      vida: lluvia ? 420 : 170,
    });
  }
  if (!animando) { animando = true; requestAnimationFrame(dibujar); }
}

function dibujar() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  particulas = particulas.filter((p) => p.vida > 0 && p.y < innerHeight + 20);
  for (const p of particulas) {
    p.vx *= .99; p.vy = Math.min(p.vy + p.g, 6);
    p.x += p.vx; p.y += p.vy; p.giro += p.vg; p.vida--;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.giro);
    ctx.globalAlpha = Math.min(1, p.vida / 40);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    const r = p.r;
    if (p.forma === 'hoja') {
      ctx.ellipse(0, 0, r, r * .45, 0, 0, 6.28);
    } else if (p.forma === 'corazon') {
      ctx.moveTo(0, r);
      ctx.bezierCurveTo(-r * 1.6, -r * .2, -r * .6, -r * 1.3, 0, -r * .4);
      ctx.bezierCurveTo(r * .6, -r * 1.3, r * 1.6, -r * .2, 0, r);
    } else {
      ctx.arc(0, 0, r * .45, 0, 6.28);
    }
    ctx.fill();
    ctx.restore();
  }
  if (particulas.length) requestAnimationFrame(dibujar);
  else animando = false;
}

/* ---------- Título letra por letra ---------- */
(() => {
  const h1 = $('#titulo');
  const texto = h1.textContent.trim();
  let i = 0;
  h1.setAttribute('aria-label', texto);
  h1.replaceChildren();
  texto.split(' ').forEach((palabra) => {
    const caja = document.createElement('span');
    caja.className = 'palabra';
    caja.setAttribute('aria-hidden', 'true');
    for (const l of palabra) {
      const s = document.createElement('span');
      s.className = 'letra';
      s.style.setProperty('--i', i++);
      s.textContent = l;
      caja.append(s);
    }
    h1.append(caja, ' ');
  });
})();

/* ---------- Animaciones al hacer scroll ---------- */
function activarScroll() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.revelar').forEach((el) => el.classList.add('visible'));
    return;
  }
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: .12 });
  document.querySelectorAll('.revelar').forEach((el) => obs.observe(el));
}

/* ---------- Abrir el regalo ---------- */
$('#btn-abrir').addEventListener('click', () => {
  $('#puerta').classList.add('abierta');
  document.body.classList.remove('bloqueado');
  $('#contenido').inert = false;
  $('#reproductor').classList.add('listo');
  document.body.classList.add('visible-titulo');
  activarScroll();
  reproducir(); // debe ir dentro del clic para que el navegador permita el sonido
  lanzar(110, ['#3f7d4e', '#86c97a', '#e59a93', '#e9b44c'], 'explosion');
});

/* ---------- Contador en tiempo real ---------- */
const inicio = new Date(CONFIG.fechaInicio);
function actualizarContador() {
  const s = Math.max(0, Math.floor((Date.now() - inicio) / 1000));
  $('#c-dias').textContent = Math.floor(s / 86400).toLocaleString('es-PE');
  $('#c-horas').textContent = String(Math.floor(s / 3600) % 24).padStart(2, '0');
  $('#c-min').textContent = String(Math.floor(s / 60) % 60).padStart(2, '0');
  $('#c-seg').textContent = String(s % 60).padStart(2, '0');

  // Días que faltan para el próximo aniversario (calendario de Perú)
  const hoy = new Date(Date.now() - 5 * 3600e3);
  const diaHoy = Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate());
  let anio = hoy.getUTCFullYear();
  if (Date.UTC(anio, 11, 21) < diaHoy) anio++;
  const faltan = Math.round((Date.UTC(anio, 11, 21) - diaHoy) / 86400e3);
  const n = anio - 2018;
  $('#aniversario').textContent = faltan === 0
    ? `¡Hoy cumplimos ${n} años!`
    : `${faltan === 1 ? 'Falta 1 día' : `Faltan ${faltan} días`} para cumplir ${n} años.`;
}
actualizarContador();
setInterval(actualizarContador, 1000);

/* ---------- Efecto tilt 3D (solo con mouse) ---------- */
if (matchMedia('(hover: hover) and (pointer: fine)').matches && !sinMovimiento) {
  document.querySelectorAll('.tilt').forEach((t) => {
    t.addEventListener('pointermove', (e) => {
      const r = t.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      t.style.transform = `rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
    });
    t.addEventListener('pointerleave', () => { t.style.transform = ''; });
  });
}

/* =========================================================
   CARTA con efecto máquina de escribir
   ========================================================= */
const modal = $('#modal');
let relojCarta = null;
let letras = [];
let escritas = 0;

// El texto completo se coloca oculto para que nada "salte" al escribir
CARTA.forEach((parrafo) => {
  const p = document.createElement('p');
  const visible = document.createElement('span');
  const oculto = document.createElement('span');
  oculto.className = 'pendiente';
  oculto.textContent = parrafo;
  p.setAttribute('aria-label', parrafo);
  p.append(visible, oculto);
  $('#carta').append(p);
  letras.push({ visible, oculto, texto: parrafo });
});

let iParrafo = 0;
function escribir() {
  const actual = letras[iParrafo];
  if (!actual) { terminarCarta(); return; }
  escritas++;
  actual.visible.textContent = actual.texto.slice(0, escritas);
  actual.oculto.textContent = actual.texto.slice(escritas);
  // Desplaza la carta siguiendo el texto
  const caja = $('#carta-scroll');
  const fin = actual.oculto.getClientRects()[0] || actual.visible.parentElement.getBoundingClientRect();
  const sobra = fin.top - caja.getBoundingClientRect().bottom + 60;
  if (sobra > 0) caja.scrollTop += sobra;
  let pausa = /[.?!]/.test(actual.texto[escritas - 1]) ? 260 : CONFIG.velocidadCarta;
  if (escritas >= actual.texto.length) { iParrafo++; escritas = 0; pausa = 450; }
  relojCarta = setTimeout(escribir, pausa);
}
function terminarCarta() {
  clearTimeout(relojCarta);
  letras.forEach((l) => { l.visible.textContent = l.texto; l.oculto.textContent = ''; });
  iParrafo = letras.length;
  $('#btn-todo').hidden = true;
}

$('#btn-sobre').addEventListener('click', () => {
  modal.showModal();
  $('#carta-scroll').focus();
  clearTimeout(relojCarta);
  if (sinMovimiento) terminarCarta();
  else if (iParrafo < letras.length) relojCarta = setTimeout(escribir, 500);
});
$('#btn-todo').addEventListener('click', terminarCarta);
$('#btn-cerrar').addEventListener('click', () => modal.close());
modal.addEventListener('close', () => clearTimeout(relojCarta));
modal.addEventListener('click', (e) => { if (e.target === modal) {
  const r = modal.getBoundingClientRect();
  if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) modal.close();
} });

/* ---------- Sorpresa final ---------- */
$('#btn-deseo').addEventListener('click', () => {
  const boton = $('#btn-deseo');
  const huevo = $('#huevo');
  boton.disabled = true;
  huevo.classList.add('temblando');
  setTimeout(() => {
    huevo.classList.remove('temblando');
    huevo.classList.add('abierto');
    lanzar(220, ['#e9b44c', '#f6d58e', '#e59a93', '#f2c4bd'], 'lluvia');
    lanzar(60, ['#e9b44c', '#e59a93'], 'explosion');
    $('#vale').hidden = false;
    boton.hidden = true;
    toast('Deseo enviado. Tu vale ya está aquí abajo.');
    setTimeout(() => {
      $('#vale').focus({ preventScroll: true });
      $('#vale').scrollIntoView({ block: 'center' });
    }, 1300);
  }, sinMovimiento ? 0 : 1100);
});

$('#btn-canjear').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(CONFIG.mensajeCanje);
    toast('Mensaje copiado. Pégalo en nuestro chat.');
  } catch {
    toast(`Escríbeme esto: ${CONFIG.mensajeCanje}`);
  }
});
