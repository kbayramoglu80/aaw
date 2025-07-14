// Admin Panel JavaScript - Backend API ile Tam Fonksiyonel

const ADMIN_PASSWORD = 'Ev2024!Batarya*';
const API_BASE = 'http://localhost:3001/api';
let haberler = [];

async function fetchHaberler() {
  const res = await fetch(`${API_BASE}/news`);
  haberler = await res.json();
}

function renderHaberler() {
  const list = document.getElementById('haberler-list');
  list.innerHTML = '';
  haberler.forEach(haber => {
    const card = document.createElement('div');
    card.className = 'content-card';
    card.innerHTML = `
      <img src="${haber.image}" alt="${haber.title}" style="width:100%;height:120px;object-fit:cover;border-radius:8px;">
      <h3><a href="haber-detay.html?id=${haber.id}" target="_blank" style="color:inherit;text-decoration:underline;">${haber.title}</a></h3>
      <p>${haber.summary}</p>
      <div style="font-size:0.95rem;color:#1976d2;margin-bottom:8px;">${haber.category} | ${haber.date}</div>
      <div class="card-actions">
        <button class="edit-btn" data-id="${haber.id}">Düzenle</button>
        <button class="delete-btn" data-id="${haber.id}">Sil</button>
      </div>
    `;
    list.appendChild(card);
  });
  list.querySelectorAll('.edit-btn').forEach(btn => {
    btn.onclick = () => openEditModal(btn.dataset.id);
  });
  list.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = async () => {
      if (confirm('Bu haberi silmek istiyor musunuz?')) {
        try {
          await deleteHaber(btn.dataset.id);
          await fetchHaberler();
          renderHaberler();
        } catch (e) { alert(e.message); }
      }
    };
  });
}

async function addHaber(haber, file) {
  const formData = new FormData();
  for (const key in haber) if (haber[key]) formData.append(key, haber[key]);
  if (file) formData.append('image', file);
  const res = await fetch(`${API_BASE}/news`, {
    method: 'POST',
    headers: { 'x-admin-password': ADMIN_PASSWORD },
    body: formData
  });
  if (!res.ok) throw new Error('Haber eklenemedi');
  return await res.json();
}

async function updateHaber(id, haber, file) {
  const formData = new FormData();
  for (const key in haber) if (haber[key]) formData.append(key, haber[key]);
  if (file) formData.append('image', file);
  const res = await fetch(`${API_BASE}/news/${id}`, {
    method: 'PUT',
    headers: { 'x-admin-password': ADMIN_PASSWORD },
    body: formData
  });
  if (!res.ok) throw new Error('Haber güncellenemedi');
  return await res.json();
}

async function deleteHaber(id) {
  const res = await fetch(`${API_BASE}/news/${id}`, {
    method: 'DELETE',
    headers: { 'x-admin-password': ADMIN_PASSWORD }
  });
  if (!res.ok) throw new Error('Haber silinemedi');
}

function openEditModal(id) {
  const haber = haberler.find(h => h.id == id);
  if (!haber) return alert('Haber bulunamadı!');
  const modal = document.getElementById('content-modal');
  document.getElementById('modal-title').textContent = 'Haberi Düzenle';
  document.getElementById('content-title').value = haber.title || '';
  document.getElementById('content-summary').value = haber.summary || '';
  document.getElementById('content-detail').value = haber.content || '';
  document.getElementById('content-category').value = haber.category || 'haber';
  document.getElementById('content-date').value = haber.date || '';
  document.getElementById('content-image-file').value = '';
  document.getElementById('content-image-preview').style.display = haber.image ? 'block' : 'none';
  document.getElementById('content-image-preview').src = haber.image || '';
  modal.dataset.editId = haber.id;
  modal.style.display = 'block';
}
function openModal(haber = null) {
  const modal = document.getElementById('content-modal');
  document.getElementById('modal-title').textContent = haber ? 'Haberi Düzenle' : 'Yeni Haber Ekle';
  document.getElementById('content-title').value = haber ? haber.title : '';
  document.getElementById('content-summary').value = haber ? haber.summary : '';
  document.getElementById('content-detail').value = haber ? haber.content : '';
  document.getElementById('content-category').value = haber ? haber.category : 'haber';
  document.getElementById('content-date').value = haber ? haber.date : '';
  document.getElementById('content-image-file').value = '';
  document.getElementById('content-image-preview').style.display = haber && haber.image ? 'block' : 'none';
  document.getElementById('content-image-preview').src = haber && haber.image ? haber.image : '';
  modal.dataset.editId = haber ? haber.id : '';
  modal.style.display = 'block';
}
function closeModal() {
  document.getElementById('content-modal').style.display = 'none';
}

// Remove add modal and add button logic
// Only allow editing and deleting existing news

const contentForm = document.getElementById('content-form');
contentForm.onsubmit = async function(e) {
  e.preventDefault();
  const modal = document.getElementById('content-modal');
  const id = modal.dataset.editId;
  const haber = {
    title: document.getElementById('content-title').value,
    summary: document.getElementById('content-summary').value,
    content: document.getElementById('content-detail').value,
    category: document.getElementById('content-category').value,
    date: document.getElementById('content-date').value
  };
  const file = document.getElementById('content-image-file').files[0];
  try {
    const formData = new FormData();
    for (const key in haber) if (haber[key]) formData.append(key, haber[key]);
    if (file) formData.append('image', file);
    const res = await fetch(`http://localhost:3001/api/news/${id}`, {
      method: 'PUT',
      headers: { 'x-admin-password': ADMIN_PASSWORD },
      body: formData
    });
    if (!res.ok) throw new Error('Haber güncellenemedi!');
    await fetchHaberler();
    renderHaberler();
    closeModal();
  } catch (err) {
    alert(err.message);
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  await fetchHaberler();
  if (haberler.length < 10) {
    const samples = [
      {
        title: 'BYD Seal U Türkiye’de',
        summary: 'BYD Seal U, SUV segmentinde elektrikli konfor sunuyor.',
        content: 'Seal U, 500 km menzil ve geniş iç hacmiyle aileler için ideal...',
        category: 'haber',
        date: '2024-07-14',
        image: '/backend/uploads/ioniq5-2024-og.jpg'
      },
      {
        title: 'MG4 Electric: Uygun Fiyatlı Elektrikli',
        summary: 'MG4 Electric, şehir içi kullanım için ekonomik çözüm.',
        content: 'MG4, 350 km menzil ve hızlı şarj desteğiyle öne çıkıyor...',
        category: 'haber',
        date: '2024-07-14',
        image: '/backend/uploads/2021-volkswagen-id.4-exterior-in-motion.jpg'
      },
      {
        title: 'Peugeot e-208: Kompakt Elektrikli',
        summary: 'Peugeot e-208, genç ve dinamik tasarımıyla dikkat çekiyor.',
        content: 'e-208, 340 km menzil ve sportif sürüş deneyimi sunuyor...',
        category: 'haber',
        date: '2024-07-14',
        image: '/backend/uploads/BMW_iX_IAA_2021_1X7A0204.jpg'
      },
      {
        title: 'Opel Astra Electric: Yeni Nesil',
        summary: 'Opel Astra Electric, yenilikçi teknolojilerle donatıldı.',
        content: 'Astra Electric, 420 km menzil ve gelişmiş sürüş destek sistemleriyle geliyor...',
        category: 'haber',
        date: '2024-07-14',
        image: '/backend/uploads/2020-Audi-E-Tron-Sportback-11.jpg'
      }
    ];
    for (let i = 0; i < 10 - haberler.length && i < samples.length; i++) {
      // This loop is now unreachable as addHaber is removed
      // await addHaber(samples[i]); 
    }
    await fetchHaberler();
  }
  renderHaberler();
}); 