const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

const ADMIN_PASSWORD = 'Ev2024!Batarya*'; // Şifreyi frontend ile aynı tut

const DATA_DIR = path.join(__dirname, 'data');
const NEWS_FILE = path.join(DATA_DIR, 'news.json');
const MODELS_FILE = path.join(DATA_DIR, 'models.json');
const INFOS_FILE = path.join(DATA_DIR, 'infos.json');

function readJson(file, fallback) {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch (e) { console.error(e); }
  return fallback;
}
function writeJson(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) { console.error(e); }
}

// Multer ayarları
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Middleware: Admin şifre kontrolü
function checkAdminPassword(req, res, next) {
  const pw = req.headers['x-admin-password'];
  if (pw !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Yetkisiz' });
  }
  next();
}

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + '/../'));

// Haber veri modeli güncellendi
let news = readJson(NEWS_FILE, [
  {
    id: 1,
    title: 'Elektrikli Araçlarda Yeni Dönem',
    summary: 'Elektrikli araçlar hızla yaygınlaşıyor...',
    content: 'Elektrikli araçlar hızla yaygınlaşıyor... Detaylı içerik burada.',
    image: '/backend/uploads/2020-Audi-E-Tron-Sportback-11.jpg',
    category: 'haber',
    date: '2024-07-13'
  },
  {
    id: 2,
    title: 'Şarj İstasyonları Artıyor',
    summary: 'Türkiye genelinde şarj istasyonları sayısı artıyor...',
    content: 'Türkiye genelinde şarj istasyonları sayısı artıyor... Detaylı içerik burada.',
    image: '/backend/uploads/2021-volkswagen-id.4-exterior-in-motion.jpg',
    category: 'haber',
    date: '2024-07-13'
  }
]);
let models = readJson(MODELS_FILE, [
  {
    id: 1,
    title: 'Tesla Model S',
    summary: 'Uzun menzili ve yüksek performansıyla öne çıkan lüks elektrikli sedan.'
  },
  {
    id: 2,
    title: 'BMW iX',
    summary: 'Modern tasarım, ileri teknoloji ve konforu bir arada sunan SUV.'
  }
]);
let infos = readJson(INFOS_FILE, [
  {
    id: 1,
    title: 'Elektrikli Araç Nedir?',
    summary: 'Elektrikli araçlar, fosil yakıt yerine elektrik enerjisiyle çalışan çevre dostu ulaşım araçlarıdır.'
  },
  {
    id: 2,
    title: 'Şarj Teknolojileri',
    summary: 'AC ve DC hızlı şarj, evde ve istasyonda şarj yöntemleri hakkında temel bilgiler.'
  }
]);

// On server start, ensure at least 6 sample news exist (add missing only)
const ensureSampleNews = () => {
  const samples = [
    {
      title: 'Elektrikli Araçlarda Yeni Dönem',
      summary: 'Elektrikli araçlar hızla yaygınlaşıyor...',
      content: 'Elektrikli araçlar hızla yaygınlaşıyor... Detaylı içerik burada.',
      image: '/backend/uploads/2020-Audi-E-Tron-Sportback-11.jpg',
      category: 'haber',
      date: '2024-07-13'
    },
    {
      title: 'Şarj İstasyonları Artıyor',
      summary: 'Türkiye genelinde şarj istasyonları sayısı artıyor...',
      content: 'Türkiye genelinde şarj istasyonları sayısı artıyor... Detaylı içerik burada.',
      image: '/backend/uploads/2021-volkswagen-id.4-exterior-in-motion.jpg',
      category: 'haber',
      date: '2024-07-13'
    },
    {
      title: '2025 Mercedes EQS Tanıtıldı',
      summary: 'Mercedes-Benz, yeni EQS modeliyle elektrikli lüksü yeniden tanımlıyor.',
      content: '2025 Mercedes EQS, gelişmiş batarya teknolojisi ve 800 km menziliyle dikkat çekiyor...',
      image: '/backend/uploads/2025-mercedes-benz-eqs-exterior-113-6616f12b6d591.avif',
      category: 'haber',
      date: '2024-07-13'
    },
    {
      title: 'Hyundai Ioniq 5: 2024 Güncellemesi',
      summary: 'Hyundai Ioniq 5, yeni donanım ve yazılım güncellemeleriyle geliyor.',
      content: '2024 Ioniq 5, daha hızlı şarj ve gelişmiş sürüş asistanları sunuyor...',
      image: '/backend/uploads/ioniq5-2024-og.jpg',
      category: 'haber',
      date: '2024-07-13'
    },
    {
      title: 'Audi e-tron Sportback Türkiye’de',
      summary: 'Audi’nin elektrikli SUV modeli e-tron Sportback, Türkiye yollarında.',
      content: 'Audi e-tron Sportback, sportif tasarımı ve 400 km menziliyle öne çıkıyor...',
      image: '/backend/uploads/2020-Audi-E-Tron-Sportback-11.jpg',
      category: 'haber',
      date: '2024-07-13'
    },
    {
      title: 'Tesla Model S 2025: Performans Zirvesi',
      summary: 'Tesla, yeni Model S ile performans ve menzilde sınırları zorluyor.',
      content: '2025 Model S, 0-100 km/s hızlanmasını 2 saniyede tamamlıyor...',
      image: '/backend/uploads/2025-tesla-model-s-1-672d42e172407.avif',
      category: 'haber',
      date: '2024-07-13'
    }
  ];
  let changed = false;
  while (news.length < 6) {
    const sample = samples[news.length % samples.length];
    news.push({
      ...sample,
      id: Date.now() + Math.floor(Math.random() * 1000000) + news.length
    });
    changed = true;
  }
  if (changed) writeJson(NEWS_FILE, news);
};
ensureSampleNews();

// Haberleri listele
app.get('/api/news', (req, res) => {
  res.json(news);
});

// Tek bir haberi getir
app.get('/api/news/:id', (req, res) => {
  const id = req.params.id;
  const item = news.find(n => String(n.id) === String(id));
  if (!item) return res.status(404).json({ error: 'Haber bulunamadı.' });
  res.json(item);
});

// Yeni haber ekle (dosya upload destekli, max 10 haber)
app.post('/api/news', checkAdminPassword, upload.single('image'), (req, res) => {
  if (news.length >= 10) {
    return res.status(400).json({ error: 'En fazla 10 haber eklenebilir.' });
  }
  const { title, summary, content, category, date } = req.body;
  let image = req.body.image || '';
  if (req.file) {
    image = '/backend/uploads/' + req.file.filename;
  }
  const newNews = {
    id: Date.now().toString(),
    title,
    summary,
    content,
    image,
    category,
    date: date || new Date().toISOString().slice(0, 10)
  };
  news.push(newNews);
  writeJson(NEWS_FILE, news);
  res.status(201).json(newNews);
});

// Haberi güncelle (dosya upload destekli)
app.put('/api/news/:id', checkAdminPassword, upload.single('image'), (req, res) => {
  const { id } = req.params;
  const idx = news.findIndex(item => String(item.id) === String(id));
  if (idx === -1) return res.status(404).json({ error: 'Haber bulunamadı.' });
  const { title, summary, content, category, date } = req.body;
  let image = news[idx].image;
  if (req.file) {
    image = '/backend/uploads/' + req.file.filename;
  } else if (req.body.image) {
    image = req.body.image;
  }
  news[idx] = {
    ...news[idx],
    title: title || news[idx].title,
    summary: summary || news[idx].summary,
    content: content || news[idx].content,
    image,
    category: category || news[idx].category,
    date: date || news[idx].date
  };
  writeJson(NEWS_FILE, news);
  res.json(news[idx]);
});

// Haberi sil
app.delete('/api/news/:id', checkAdminPassword, (req, res) => {
  const { id } = req.params;
  news = news.filter(item => String(item.id) !== String(id));
  writeJson(NEWS_FILE, news);
  res.status(204).end();
});

// Modelleri listele
app.get('/api/models', (req, res) => {
  res.json(models);
});

// Yeni model ekle
app.post('/api/models', (req, res) => {
  const { title, summary } = req.body;
  const newModel = {
    id: Date.now(),
    title,
    summary
  };
  models.push(newModel);
  writeJson(MODELS_FILE, models);
  res.status(201).json(newModel);
});

// Model sil
app.delete('/api/models/:id', (req, res) => {
  const { id } = req.params;
  models = models.filter(item => item.id !== Number(id));
  writeJson(MODELS_FILE, models);
  res.status(204).end();
});

// Bilgileri listele
app.get('/api/infos', (req, res) => {
  res.json(infos);
});

// Yeni bilgi ekle
app.post('/api/infos', (req, res) => {
  const { title, summary } = req.body;
  const newInfo = {
    id: Date.now(),
    title,
    summary
  };
  infos.push(newInfo);
  writeJson(INFOS_FILE, infos);
  res.status(201).json(newInfo);
});

// Bilgi sil
app.delete('/api/infos/:id', (req, res) => {
  const { id } = req.params;
  infos = infos.filter(item => item.id !== Number(id));
  writeJson(INFOS_FILE, infos);
  res.status(204).end();
});

// Tek bir bilgiyi getir
app.get('/api/infos/:id', (req, res) => {
  const id = req.params.id;
  const item = infos.find(info => String(info.id) === String(id));
  if (!item) return res.status(404).json({ error: 'Bilgi bulunamadı.' });
  res.json(item);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}); 