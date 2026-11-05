const menu = document.querySelector('.menu');
const nav = document.querySelector('#nav');
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open); });
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {nav.classList.remove('open');menu.setAttribute('aria-expanded','false');}));
const date = document.querySelector('#date');
const today = new Date();
date.min = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
document.querySelector('#year').textContent = today.getFullYear();
document.querySelectorAll('.select-package').forEach(a => a.addEventListener('click', () => {document.querySelector('#package').value = a.dataset.package;}));
document.querySelector('#inquiry').addEventListener('submit', e => {
 e.preventDefault();
 const names = document.querySelector('#names').value.trim();
 const location = document.querySelector('#location').value.trim();
 if (!names || !location) {document.querySelector('#copy-status').textContent = 'Escribe los nombres y la ubicación para preparar tu mensaje.';return;}
 const formatted = new Date(date.value+'T12:00:00').toLocaleDateString('es-MX',{day:'numeric',month:'long',year:'numeric'});
 document.querySelector('#message').value = `¡Hola, Yau! Somos ${names}. Nuestra boda es el ${formatted}, en ${location}. Nos interesa: ${document.querySelector('#package').value}. ¿Tienes disponibilidad? Nos gustaría conocer la cotización y los detalles de contratación. ¡Gracias!`;
 document.querySelector('#whatsapp-inquiry').href = 'https://wa.me/525525068925?text=' + encodeURIComponent(document.querySelector('#message').value);
 document.querySelector('#message-panel').hidden = false;
 document.querySelector('#copy-status').textContent = 'Abre tu consulta en WhatsApp o copia el mensaje para enviarlo por Instagram.';
 document.querySelector('#message').focus();
});
document.querySelector('#copy').addEventListener('click', async () => {
 const field = document.querySelector('#message');
 try {await navigator.clipboard.writeText(field.value);document.querySelector('#copy-status').textContent='Mensaje copiado. Pégalo en Instagram o usa el botón de WhatsApp.';}
 catch {field.focus();field.select();document.querySelector('#copy-status').textContent='Seleccionamos el mensaje. Cópialo para Instagram o abre tu consulta en WhatsApp.';}
});

// Select a couple's photos and recommendation, with keyboard-accessible tabs.
const storyTabs = [...document.querySelectorAll('.story-tabs [role="tab"]')];
function activateStory(tab, focus = false) {
 storyTabs.forEach(item => {
  const selected = item === tab;
  item.setAttribute('aria-selected', String(selected));
  item.tabIndex = selected ? 0 : -1;
  const panel = document.getElementById(item.getAttribute('aria-controls'));
  panel.hidden = !selected;
  if (!selected) panel.querySelector('video')?.pause();
 });
 if (focus) tab.focus();
}
storyTabs.forEach((tab, index) => {
 tab.addEventListener('click', () => activateStory(tab));
 tab.addEventListener('keydown', event => {
  let next;
  if (event.key === 'ArrowRight') next = (index + 1) % storyTabs.length;
  if (event.key === 'ArrowLeft') next = (index + storyTabs.length - 1) % storyTabs.length;
  if (event.key === 'Home') next = 0;
  if (event.key === 'End') next = storyTabs.length - 1;
  if (next !== undefined) { event.preventDefault(); activateStory(storyTabs[next], true); }
 });
});
const photoDialog = document.querySelector('#photo-dialog');
let activePhotos = [];
let activePhotoIndex = 0;
let photoTrigger;
let previousOverflow;
function showPhoto(index) {
 activePhotoIndex = index;
 const button = activePhotos[index];
 const image = document.querySelector('#expanded-photo');
 image.src = button.dataset.image;
 image.alt = button.dataset.caption;
 document.querySelector('#expanded-caption').textContent = button.dataset.caption;
 document.querySelector('#photo-position').textContent = `${index + 1} de ${activePhotos.length}`;
 document.querySelector('.photo-prev').disabled = index === 0;
 document.querySelector('.photo-next').disabled = index === activePhotos.length - 1;
}
document.querySelectorAll('.photo-open').forEach(button => button.addEventListener('click', () => {
 activePhotos = [...button.closest('.story-gallery').querySelectorAll('.photo-open')];
 photoTrigger = button;
 showPhoto(activePhotos.indexOf(button));
 previousOverflow = document.body.style.overflow;
 document.body.style.overflow = 'hidden';
 photoDialog.showModal();
 document.querySelector('.photo-close').focus();
}));
document.querySelector('.photo-close').addEventListener('click', () => photoDialog.close());
photoDialog.addEventListener('click', event => {if (event.target === photoDialog) photoDialog.close();});
photoDialog.addEventListener('close', () => {document.body.style.overflow = previousOverflow || ''; photoTrigger?.focus();});
document.querySelector('.photo-prev').addEventListener('click', () => {if (activePhotoIndex > 0) showPhoto(activePhotoIndex - 1);});
document.querySelector('.photo-next').addEventListener('click', () => {if (activePhotoIndex < activePhotos.length - 1) showPhoto(activePhotoIndex + 1);});
photoDialog.addEventListener('keydown', event => {
 if (event.key === 'ArrowLeft' && activePhotoIndex > 0) {event.preventDefault();showPhoto(activePhotoIndex - 1);}
 if (event.key === 'ArrowRight' && activePhotoIndex < activePhotos.length - 1) {event.preventDefault();showPhoto(activePhotoIndex + 1);}
});

// Reservation dates are inclusive in Mexico City. The private review site always shows the campaign.
const campaignCalendar = new Intl.DateTimeFormat('en-CA', {
 timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit'
});
const { hostname, search } = window.location;
const localPreviewHosts = new Set(['terminal.local', 'localhost', '127.0.0.1']);
const campaignPreview = hostname === 'capturando-by-yau.abinadigamezrodrigue.chatgpt.site'
 || (localPreviewHosts.has(hostname) && new URLSearchParams(search).get('vista') === 'black-friday');
function isBlackFriday(now = new Date()) {
 const parts = Object.fromEntries(campaignCalendar.formatToParts(now).map(({type, value}) => [type, value]));
 const localDay = `${parts.year}-${parts.month}-${parts.day}`;
 return localDay >= '2026-11-23' && localDay <= '2026-11-27';
}
function updateCampaign() {
 const visible = campaignPreview || isBlackFriday();
 document.querySelectorAll('[data-black-friday]').forEach(element => {element.hidden = !visible;});
 document.querySelectorAll('[data-promotion-regular]').forEach(element => {element.hidden = visible;});
 document.querySelectorAll('[data-promotion-preview]').forEach(element => {element.hidden = !campaignPreview;});
}
updateCampaign();
window.addEventListener('pageshow', updateCampaign);
document.addEventListener('visibilitychange', updateCampaign);
window.setInterval(updateCampaign, 30000);
