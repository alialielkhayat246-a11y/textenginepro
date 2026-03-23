// api/detect.js — Vercel Serverless Function
// Zero dependencies — pure Node.js, no npm packages needed

const ISO_MAP = {
  ara: { name:'Arabic',               native:'العربية',         flag:'🇸🇦', family:'Semitic',        script:'Arabic'     },
  heb: { name:'Hebrew',               native:'עברית',           flag:'🇮🇱', family:'Semitic',        script:'Hebrew'     },
  amh: { name:'Amharic',              native:'አማርኛ',           flag:'🇪🇹', family:'Semitic',        script:'Ethiopic'   },
  eng: { name:'English',              native:'English',          flag:'🇬🇧', family:'Germanic',       script:'Latin'      },
  fra: { name:'French',               native:'Français',         flag:'🇫🇷', family:'Romance',        script:'Latin'      },
  spa: { name:'Spanish',              native:'Español',          flag:'🇪🇸', family:'Romance',        script:'Latin'      },
  por: { name:'Portuguese',           native:'Português',        flag:'🇵🇹', family:'Romance',        script:'Latin'      },
  ita: { name:'Italian',              native:'Italiano',         flag:'🇮🇹', family:'Romance',        script:'Latin'      },
  ron: { name:'Romanian',             native:'Română',           flag:'🇷🇴', family:'Romance',        script:'Latin'      },
  deu: { name:'German',               native:'Deutsch',          flag:'🇩🇪', family:'Germanic',       script:'Latin'      },
  nld: { name:'Dutch',                native:'Nederlands',       flag:'🇳🇱', family:'Germanic',       script:'Latin'      },
  swe: { name:'Swedish',              native:'Svenska',          flag:'🇸🇪', family:'Germanic',       script:'Latin'      },
  dan: { name:'Danish',               native:'Dansk',            flag:'🇩🇰', family:'Germanic',       script:'Latin'      },
  nor: { name:'Norwegian',            native:'Norsk',            flag:'🇳🇴', family:'Germanic',       script:'Latin'      },
  afr: { name:'Afrikaans',            native:'Afrikaans',        flag:'🇿🇦', family:'Germanic',       script:'Latin'      },
  rus: { name:'Russian',              native:'Русский',          flag:'🇷🇺', family:'Slavic',         script:'Cyrillic'   },
  ukr: { name:'Ukrainian',            native:'Українська',       flag:'🇺🇦', family:'Slavic',         script:'Cyrillic'   },
  pol: { name:'Polish',               native:'Polski',           flag:'🇵🇱', family:'Slavic',         script:'Latin'      },
  ces: { name:'Czech',                native:'Čeština',          flag:'🇨🇿', family:'Slavic',         script:'Latin'      },
  hrv: { name:'Croatian',             native:'Hrvatski',         flag:'🇭🇷', family:'Slavic',         script:'Latin'      },
  bul: { name:'Bulgarian',            native:'Български',        flag:'🇧🇬', family:'Slavic',         script:'Cyrillic'   },
  hin: { name:'Hindi',                native:'हिन्दी',           flag:'🇮🇳', family:'Indo-Iranian',   script:'Devanagari' },
  urd: { name:'Urdu',                 native:'اردو',             flag:'🇵🇰', family:'Indo-Iranian',   script:'Arabic'     },
  ben: { name:'Bengali',              native:'বাংলা',            flag:'🇧🇩', family:'Indo-Iranian',   script:'Bengali'    },
  mar: { name:'Marathi',              native:'मराठी',            flag:'🇮🇳', family:'Indo-Iranian',   script:'Devanagari' },
  fas: { name:'Persian (Farsi)',       native:'فارسی',            flag:'🇮🇷', family:'Indo-Iranian',   script:'Arabic'     },
  tur: { name:'Turkish',              native:'Türkçe',           flag:'🇹🇷', family:'Turkic',         script:'Latin'      },
  kaz: { name:'Kazakh',               native:'Қазақша',          flag:'🇰🇿', family:'Turkic',         script:'Cyrillic'   },
  zho: { name:'Chinese (Simplified)', native:'中文（简体）',       flag:'🇨🇳', family:'Sino-Tibetan',   script:'Han'        },
  jpn: { name:'Japanese',             native:'日本語',            flag:'🇯🇵', family:'Japonic',        script:'Japanese'   },
  kor: { name:'Korean',               native:'한국어',            flag:'🇰🇷', family:'Koreanic',       script:'Hangul'     },
  vie: { name:'Vietnamese',           native:'Tiếng Việt',       flag:'🇻🇳', family:'Austro-Asiatic', script:'Latin'      },
  ind: { name:'Indonesian',           native:'Bahasa Indonesia', flag:'🇮🇩', family:'Austronesian',   script:'Latin'      },
  msa: { name:'Malay',                native:'Bahasa Melayu',    flag:'🇲🇾', family:'Austronesian',   script:'Latin'      },
  tam: { name:'Tamil',                native:'தமிழ்',            flag:'🇮🇳', family:'Dravidian',      script:'Tamil'      },
  tel: { name:'Telugu',               native:'తెలుగు',           flag:'🇮🇳', family:'Dravidian',      script:'Telugu'     },
  mal: { name:'Malayalam',            native:'മലയാളം',           flag:'🇮🇳', family:'Dravidian',      script:'Malayalam'  },
  tha: { name:'Thai',                 native:'ภาษาไทย',          flag:'🇹🇭', family:'Tai-Kadai',      script:'Thai'       },
  ell: { name:'Greek',                native:'Ελληνικά',         flag:'🇬🇷', family:'Hellenic',       script:'Greek'      },
  fin: { name:'Finnish',              native:'Suomi',            flag:'🇫🇮', family:'Uralic',         script:'Latin'      },
  hun: { name:'Hungarian',            native:'Magyar',           flag:'🇭🇺', family:'Uralic',         script:'Latin'      },
  est: { name:'Estonian',             native:'Eesti',            flag:'🇪🇪', family:'Uralic',         script:'Latin'      },
  kat: { name:'Georgian',             native:'ქართული',          flag:'🇬🇪', family:'Kartvelian',     script:'Georgian'   },
  hye: { name:'Armenian',             native:'Հայerén',          flag:'🇦🇲', family:'IE Isolate',     script:'Armenian'   },
  swh: { name:'Swahili',              native:'Kiswahili',        flag:'🇰🇪', family:'Niger-Congo',    script:'Latin'      },
};

const WORD_PROFILES = {
  eng: /\b(the|and|that|have|for|not|with|you|this|but|his|they|from|she|will|would|there|their|been|has)\b/gi,
  fra: /\b(le|la|les|de|du|des|un|une|est|et|en|au|que|qui|dans|sur|par|avec|pour|pas|je|vous|nous)\b/gi,
  spa: /\b(el|la|los|las|de|del|que|en|un|una|es|se|no|con|por|para|su|al|como|más|pero|fue|ser)\b/gi,
  por: /\b(de|da|do|dos|das|que|em|um|uma|para|com|não|mais|como|se|por|ao|na|no|ele|isso|esta)\b/gi,
  deu: /\b(der|die|das|und|ist|in|von|den|dem|nicht|mit|zu|sie|auf|ich|ein|eine|des|als|für|auch)\b/gi,
  ita: /\b(il|la|le|di|del|della|che|in|un|una|non|con|per|si|gli|mi|ma|lo|sono|come|più|sua)\b/gi,
  nld: /\b(de|het|een|van|in|is|dat|op|te|hij|zijn|voor|niet|met|ze|je|aan|er|maar|ook|om|bij)\b/gi,
  rus: /\b(в|и|не|на|что|это|он|она|они|мы|вы|его|как|из|по|за|то|же|но|а|так|уже|если)\b/g,
  pol: /\b(i|w|z|na|do|nie|się|to|że|jest|jak|co|ale|tak|już|po|za|go|przez|tego|tym|być)\b/gi,
  swe: /\b(och|i|att|det|som|en|ett|är|på|de|med|av|för|till|den|men|han|om|inte|var|vi|har)\b/gi,
  dan: /\b(og|i|at|det|er|en|et|de|med|af|for|til|den|men|han|om|ikke|var|vi|hun|skal|som)\b/gi,
  nor: /\b(og|i|at|det|er|en|et|de|med|av|for|til|den|men|han|om|ikke|var|vi|seg|hun|skal)\b/gi,
  fin: /\b(ja|on|ei|se|että|joka|hän|kun|tai|niin|myös|vain|kuin|sitten|jo|oli|minä|sinä)\b/gi,
  hun: /\b(és|a|az|hogy|is|nem|egy|de|ha|van|volt|már|csak|még|ezt|mint|sem|vagy|le|el)\b/gi,
  ind: /\b(yang|di|dan|ini|itu|dengan|ke|dari|dalam|untuk|juga|tidak|ada|pada|saya|akan)\b/gi,
  vie: /\b(của|và|là|có|trong|được|với|cho|này|một|những|đã|không|từ|người|khi|tôi)\b/gi,
  tur: /\b(bir|bu|ve|da|de|ile|ben|sen|biz|için|gibi|kadar|var|yok|daha|çok|en|ne)\b/gi,
};

function detectByScript(str) {
  const counts = {
    arabic:     (str.match(/[\u0600-\u06FF]/g)||[]).length,
    hebrew:     (str.match(/[\u0590-\u05FF]/g)||[]).length,
    cyrillic:   (str.match(/[\u0400-\u04FF]/g)||[]).length,
    cjk:        (str.match(/[\u4E00-\u9FFF]/g)||[]).length,
    hiragana:   (str.match(/[\u3040-\u309F]/g)||[]).length,
    katakana:   (str.match(/[\u30A0-\u30FF]/g)||[]).length,
    hangul:     (str.match(/[\uAC00-\uD7AF]/g)||[]).length,
    devanagari: (str.match(/[\u0900-\u097F]/g)||[]).length,
    bengali:    (str.match(/[\u0980-\u09FF]/g)||[]).length,
    tamil:      (str.match(/[\u0B80-\u0BFF]/g)||[]).length,
    telugu:     (str.match(/[\u0C00-\u0C7F]/g)||[]).length,
    malayalam:  (str.match(/[\u0D00-\u0D7F]/g)||[]).length,
    thai:       (str.match(/[\u0E00-\u0E7F]/g)||[]).length,
    georgian:   (str.match(/[\u10A0-\u10FF]/g)||[]).length,
    armenian:   (str.match(/[\u0530-\u058F]/g)||[]).length,
    ethiopic:   (str.match(/[\u1200-\u137F]/g)||[]).length,
    greek:      (str.match(/[\u0370-\u03FF]/g)||[]).length,
  };
  const total = str.replace(/\s/g,'').length || 1;
  let best = '', max = 0;
  for (const k in counts) if (counts[k] > max) { max = counts[k]; best = k; }
  return { script: best, ratio: max / total, counts };
}

function detectByWords(str) {
  const lower = str.toLowerCase();
  let best = '', bestScore = 0;
  for (const lang in WORD_PROFILES) {
    const matches = (lower.match(WORD_PROFILES[lang])||[]).length;
    if (matches > bestScore) { bestScore = matches; best = lang; }
  }
  return { lang: best, score: bestScore };
}

function disambiguateCyrillic(str) {
  if (/[іїєґ]/i.test(str)) return 'ukr';
  if (/[ўі]/i.test(str))   return 'bel';
  const ru = (str.match(/[ыэъё]/gi)||[]).length;
  const bg = (str.match(/[ъь]/gi)||[]).length;
  if (ru === 0 && bg > 0)  return 'bul';
  return 'rus';
}

function detect(text) {
  const t = text.trim();
  const sc = detectByScript(t);

  if (sc.script === 'arabic'     && sc.ratio > 0.25) return /[\u06F0-\u06F9\u067E\u0686\u0698\u06AF]/.test(t) ? 'fas' : 'ara';
  if (sc.script === 'hebrew'     && sc.ratio > 0.25) return 'heb';
  if (sc.script === 'cyrillic'   && sc.ratio > 0.25) return disambiguateCyrillic(t);
  if (sc.counts.hiragana + sc.counts.katakana > 0)   return 'jpn';
  if (sc.counts.cjk > 0)                             return 'zho';
  if (sc.script === 'hangul'     && sc.ratio > 0.25) return 'kor';
  if (sc.script === 'devanagari' && sc.ratio > 0.25) return /\b(आहे|नाही)\b/.test(t) ? 'mar' : 'hin';
  if (sc.script === 'bengali'    && sc.ratio > 0.25) return 'ben';
  if (sc.script === 'tamil'      && sc.ratio > 0.25) return 'tam';
  if (sc.script === 'telugu'     && sc.ratio > 0.25) return 'tel';
  if (sc.script === 'malayalam'  && sc.ratio > 0.25) return 'mal';
  if (sc.script === 'thai'       && sc.ratio > 0.25) return 'tha';
  if (sc.script === 'georgian'   && sc.ratio > 0.25) return 'kat';
  if (sc.script === 'armenian'   && sc.ratio > 0.25) return 'hye';
  if (sc.script === 'ethiopic'   && sc.ratio > 0.25) return 'amh';
  if (sc.script === 'greek'      && sc.ratio > 0.25) return 'ell';

  const w = detectByWords(t);
  if (w.score >= 2) return w.lang;

  if (/[äöüß]/i.test(t))             return 'deu';
  if (/[àâæçéèêëîïôœùûüÿ]/i.test(t)) return 'fra';
  if (/[ñ¿¡]/i.test(t))              return 'spa';
  if (/[ãõ]/i.test(t))               return 'por';
  if (/[ğışİ]/i.test(t))             return 'tur';
  if (/[łżź]/i.test(t))              return 'pol';
  if (/[čšž]/i.test(t))              return 'ces';
  if (/[å]/i.test(t))                return 'swe';
  if (/[ø]/i.test(t))                return 'nor';
  if (w.lang)                         return w.lang;
  return 'eng';
}

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Vercel auto-parses JSON body, but handle raw string just in case
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch(e) { body = {}; }
    }
    body = body || {};

    const text = body.text;
    if (!text || typeof text !== 'string' || text.trim().length < 3) {
      return res.status(400).json({ error: 'Text too short' });
    }
    const code = detect(text);
    const info = ISO_MAP[code];
    if (!info) return res.status(200).json({ code, name: code, native: '', flag: '🌐', family: 'Unknown', script: 'Unknown' });
    return res.status(200).json({ code, name: info.name, native: info.native, flag: info.flag, family: info.family, script: info.script });
  } catch (err) {
    console.error('detect error:', err);
    return res.status(500).json({ error: String(err) });
  }
}
