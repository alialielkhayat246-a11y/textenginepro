// api/detect.js — Vercel Serverless Function
// Uses dynamic import to handle franc-min (ESM-only package) in Vercel's Node runtime

const ISO_MAP = {
  ara: { name:'Arabic',               native:'العربية',         flag:'🇸🇦', family:'Semitic',        script:'Arabic'     },
  arz: { name:'Egyptian Arabic',      native:'عربي مصري',       flag:'🇪🇬', family:'Semitic',        script:'Arabic'     },
  acm: { name:'Iraqi Arabic',         native:'عربي عراقي',      flag:'🇮🇶', family:'Semitic',        script:'Arabic'     },
  apc: { name:'Levantine Arabic',     native:'عربي شامي',       flag:'🇸🇾', family:'Semitic',        script:'Arabic'     },
  heb: { name:'Hebrew',               native:'עברית',           flag:'🇮🇱', family:'Semitic',        script:'Hebrew'     },
  amh: { name:'Amharic',              native:'አማርኛ',           flag:'🇪🇹', family:'Semitic',        script:'Ethiopic'   },
  eng: { name:'English',              native:'English',          flag:'🇬🇧', family:'Germanic',       script:'Latin'      },
  fra: { name:'French',               native:'Français',         flag:'🇫🇷', family:'Romance',        script:'Latin'      },
  spa: { name:'Spanish',              native:'Español',          flag:'🇪🇸', family:'Romance',        script:'Latin'      },
  por: { name:'Portuguese',           native:'Português',        flag:'🇵🇹', family:'Romance',        script:'Latin'      },
  ita: { name:'Italian',              native:'Italiano',         flag:'🇮🇹', family:'Romance',        script:'Latin'      },
  ron: { name:'Romanian',             native:'Română',           flag:'🇷🇴', family:'Romance',        script:'Latin'      },
  cat: { name:'Catalan',              native:'Català',           flag:'🇪🇸', family:'Romance',        script:'Latin'      },
  deu: { name:'German',               native:'Deutsch',          flag:'🇩🇪', family:'Germanic',       script:'Latin'      },
  nld: { name:'Dutch',                native:'Nederlands',       flag:'🇳🇱', family:'Germanic',       script:'Latin'      },
  swe: { name:'Swedish',              native:'Svenska',          flag:'🇸🇪', family:'Germanic',       script:'Latin'      },
  dan: { name:'Danish',               native:'Dansk',            flag:'🇩🇰', family:'Germanic',       script:'Latin'      },
  nor: { name:'Norwegian',            native:'Norsk',            flag:'🇳🇴', family:'Germanic',       script:'Latin'      },
  nob: { name:'Norwegian Bokmål',     native:'Norsk Bokmål',     flag:'🇳🇴', family:'Germanic',       script:'Latin'      },
  isl: { name:'Icelandic',            native:'Íslenska',         flag:'🇮🇸', family:'Germanic',       script:'Latin'      },
  afr: { name:'Afrikaans',            native:'Afrikaans',        flag:'🇿🇦', family:'Germanic',       script:'Latin'      },
  rus: { name:'Russian',              native:'Русский',          flag:'🇷🇺', family:'Slavic',         script:'Cyrillic'   },
  ukr: { name:'Ukrainian',            native:'Українська',       flag:'🇺🇦', family:'Slavic',         script:'Cyrillic'   },
  bel: { name:'Belarusian',           native:'Беларуская',       flag:'🇧🇾', family:'Slavic',         script:'Cyrillic'   },
  pol: { name:'Polish',               native:'Polski',           flag:'🇵🇱', family:'Slavic',         script:'Latin'      },
  ces: { name:'Czech',                native:'Čeština',          flag:'🇨🇿', family:'Slavic',         script:'Latin'      },
  slk: { name:'Slovak',               native:'Slovenčina',       flag:'🇸🇰', family:'Slavic',         script:'Latin'      },
  slv: { name:'Slovenian',            native:'Slovenščina',      flag:'🇸🇮', family:'Slavic',         script:'Latin'      },
  hrv: { name:'Croatian',             native:'Hrvatski',         flag:'🇭🇷', family:'Slavic',         script:'Latin'      },
  srp: { name:'Serbian',              native:'Српски',           flag:'🇷🇸', family:'Slavic',         script:'Cyrillic'   },
  bul: { name:'Bulgarian',            native:'Български',        flag:'🇧🇬', family:'Slavic',         script:'Cyrillic'   },
  mkd: { name:'Macedonian',           native:'Македонски',       flag:'🇲🇰', family:'Slavic',         script:'Cyrillic'   },
  hin: { name:'Hindi',                native:'हिन्दी',           flag:'🇮🇳', family:'Indo-Iranian',   script:'Devanagari' },
  urd: { name:'Urdu',                 native:'اردو',             flag:'🇵🇰', family:'Indo-Iranian',   script:'Arabic'     },
  ben: { name:'Bengali',              native:'বাংলা',            flag:'🇧🇩', family:'Indo-Iranian',   script:'Bengali'    },
  mar: { name:'Marathi',              native:'मराठी',            flag:'🇮🇳', family:'Indo-Iranian',   script:'Devanagari' },
  nep: { name:'Nepali',               native:'नेपाली',           flag:'🇳🇵', family:'Indo-Iranian',   script:'Devanagari' },
  fas: { name:'Persian (Farsi)',       native:'فارسی',            flag:'🇮🇷', family:'Indo-Iranian',   script:'Arabic'     },
  tur: { name:'Turkish',              native:'Türkçe',           flag:'🇹🇷', family:'Turkic',         script:'Latin'      },
  uzb: { name:'Uzbek',                native:"O'zbek",           flag:'🇺🇿', family:'Turkic',         script:'Latin'      },
  kaz: { name:'Kazakh',               native:'Қазақша',          flag:'🇰🇿', family:'Turkic',         script:'Cyrillic'   },
  aze: { name:'Azerbaijani',          native:'Azərbaycan',       flag:'🇦🇿', family:'Turkic',         script:'Latin'      },
  zho: { name:'Chinese (Simplified)', native:'中文（简体）',       flag:'🇨🇳', family:'Sino-Tibetan',   script:'Han'        },
  cmn: { name:'Mandarin Chinese',     native:'普通话',            flag:'🇨🇳', family:'Sino-Tibetan',   script:'Han'        },
  jpn: { name:'Japanese',             native:'日本語',            flag:'🇯🇵', family:'Japonic',        script:'Japanese'   },
  kor: { name:'Korean',               native:'한국어',            flag:'🇰🇷', family:'Koreanic',       script:'Hangul'     },
  vie: { name:'Vietnamese',           native:'Tiếng Việt',       flag:'🇻🇳', family:'Austro-Asiatic', script:'Latin'      },
  ind: { name:'Indonesian',           native:'Bahasa Indonesia', flag:'🇮🇩', family:'Austronesian',   script:'Latin'      },
  msa: { name:'Malay',                native:'Bahasa Melayu',    flag:'🇲🇾', family:'Austronesian',   script:'Latin'      },
  tgl: { name:'Filipino (Tagalog)',   native:'Filipino',         flag:'🇵🇭', family:'Austronesian',   script:'Latin'      },
  tam: { name:'Tamil',                native:'தமிழ்',            flag:'🇮🇳', family:'Dravidian',      script:'Tamil'      },
  tel: { name:'Telugu',               native:'తెలుగు',           flag:'🇮🇳', family:'Dravidian',      script:'Telugu'     },
  kan: { name:'Kannada',              native:'ಕನ್ನಡ',            flag:'🇮🇳', family:'Dravidian',      script:'Kannada'    },
  mal: { name:'Malayalam',            native:'മലയാളം',           flag:'🇮🇳', family:'Dravidian',      script:'Malayalam'  },
  tha: { name:'Thai',                 native:'ภาษาไทย',          flag:'🇹🇭', family:'Tai-Kadai',      script:'Thai'       },
  swh: { name:'Swahili',              native:'Kiswahili',        flag:'🇰🇪', family:'Niger-Congo',    script:'Latin'      },
  ell: { name:'Greek',                native:'Ελληνικά',         flag:'🇬🇷', family:'Hellenic',       script:'Greek'      },
  fin: { name:'Finnish',              native:'Suomi',            flag:'🇫🇮', family:'Uralic',         script:'Latin'      },
  hun: { name:'Hungarian',            native:'Magyar',           flag:'🇭🇺', family:'Uralic',         script:'Latin'      },
  est: { name:'Estonian',             native:'Eesti',            flag:'🇪🇪', family:'Uralic',         script:'Latin'      },
  lit: { name:'Lithuanian',           native:'Lietuvių',         flag:'🇱🇹', family:'Baltic',         script:'Latin'      },
  lav: { name:'Latvian',              native:'Latviešu',         flag:'🇱🇻', family:'Baltic',         script:'Latin'      },
  kat: { name:'Georgian',             native:'ქართული',          flag:'🇬🇪', family:'Kartvelian',     script:'Georgian'   },
  hye: { name:'Armenian',             native:'Հայerén',          flag:'🇦🇲', family:'IE Isolate',     script:'Armenian'   },
  sqi: { name:'Albanian',             native:'Shqip',            flag:'🇦🇱', family:'IE Isolate',     script:'Latin'      },
  epo: { name:'Esperanto',            native:'Esperanto',        flag:'🌍',  family:'Constructed',    script:'Latin'      },
  lat: { name:'Latin',                native:'Latina',           flag:'🏛️',  family:'Italic',         script:'Latin'      },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length < 5) {
      return res.status(400).json({ error: 'Text too short' });
    }

    // Dynamic import handles ESM-only franc-min in Vercel's runtime
    const { franc } = await import('franc-min');
    const code = franc(text.trim(), { minLength: 5 });

    if (!code || code === 'und') {
      return res.status(200).json({ code: 'und' });
    }

    const info = ISO_MAP[code];
    if (!info) {
      return res.status(200).json({ code, name: code, native: '', flag: '🌐', family: 'Unknown', script: 'Unknown' });
    }

    return res.status(200).json({ code, name: info.name, native: info.native, flag: info.flag, family: info.family, script: info.script });

  } catch (err) {
    console.error('detect error:', err);
    return res.status(500).json({ error: String(err) });
  }
}


/* ── Full language metadata map ───────────────────────────── */
const ISO_MAP = {
  ara: { name:'Arabic',               native:'العربية',          flag:'🇸🇦', family:'Semitic',        script:'Arabic'      },
  arz: { name:'Egyptian Arabic',      native:'عربي مصري',        flag:'🇪🇬', family:'Semitic',        script:'Arabic'      },
  acm: { name:'Iraqi Arabic',         native:'عربي عراقي',       flag:'🇮🇶', family:'Semitic',        script:'Arabic'      },
  apc: { name:'Levantine Arabic',     native:'عربي شامي',        flag:'🇸🇾', family:'Semitic',        script:'Arabic'      },
  heb: { name:'Hebrew',               native:'עברית',            flag:'🇮🇱', family:'Semitic',        script:'Hebrew'      },
  amh: { name:'Amharic',              native:'አማርኛ',            flag:'🇪🇹', family:'Semitic',        script:'Ethiopic'    },
  mlt: { name:'Maltese',              native:'Malti',             flag:'🇲🇹', family:'Semitic',        script:'Latin'       },
  eng: { name:'English',              native:'English',           flag:'🇬🇧', family:'Germanic',       script:'Latin'       },
  fra: { name:'French',               native:'Français',          flag:'🇫🇷', family:'Romance',        script:'Latin'       },
  spa: { name:'Spanish',              native:'Español',           flag:'🇪🇸', family:'Romance',        script:'Latin'       },
  por: { name:'Portuguese',           native:'Português',         flag:'🇵🇹', family:'Romance',        script:'Latin'       },
  ita: { name:'Italian',              native:'Italiano',          flag:'🇮🇹', family:'Romance',        script:'Latin'       },
  ron: { name:'Romanian',             native:'Română',            flag:'🇷🇴', family:'Romance',        script:'Latin'       },
  cat: { name:'Catalan',              native:'Català',            flag:'🇪🇸', family:'Romance',        script:'Latin'       },
  deu: { name:'German',               native:'Deutsch',           flag:'🇩🇪', family:'Germanic',       script:'Latin'       },
  nld: { name:'Dutch',                native:'Nederlands',        flag:'🇳🇱', family:'Germanic',       script:'Latin'       },
  swe: { name:'Swedish',              native:'Svenska',           flag:'🇸🇪', family:'Germanic',       script:'Latin'       },
  dan: { name:'Danish',               native:'Dansk',             flag:'🇩🇰', family:'Germanic',       script:'Latin'       },
  nor: { name:'Norwegian',            native:'Norsk',             flag:'🇳🇴', family:'Germanic',       script:'Latin'       },
  nob: { name:'Norwegian Bokmål',     native:'Norsk Bokmål',      flag:'🇳🇴', family:'Germanic',       script:'Latin'       },
  isl: { name:'Icelandic',            native:'Íslenska',          flag:'🇮🇸', family:'Germanic',       script:'Latin'       },
  afr: { name:'Afrikaans',            native:'Afrikaans',         flag:'🇿🇦', family:'Germanic',       script:'Latin'       },
  rus: { name:'Russian',              native:'Русский',           flag:'🇷🇺', family:'Slavic',         script:'Cyrillic'    },
  ukr: { name:'Ukrainian',            native:'Українська',        flag:'🇺🇦', family:'Slavic',         script:'Cyrillic'    },
  bel: { name:'Belarusian',           native:'Беларуская',        flag:'🇧🇾', family:'Slavic',         script:'Cyrillic'    },
  pol: { name:'Polish',               native:'Polski',            flag:'🇵🇱', family:'Slavic',         script:'Latin'       },
  ces: { name:'Czech',                native:'Čeština',           flag:'🇨🇿', family:'Slavic',         script:'Latin'       },
  slk: { name:'Slovak',               native:'Slovenčina',        flag:'🇸🇰', family:'Slavic',         script:'Latin'       },
  slv: { name:'Slovenian',            native:'Slovenščina',       flag:'🇸🇮', family:'Slavic',         script:'Latin'       },
  hrv: { name:'Croatian',             native:'Hrvatski',          flag:'🇭🇷', family:'Slavic',         script:'Latin'       },
  srp: { name:'Serbian',              native:'Српски',            flag:'🇷🇸', family:'Slavic',         script:'Cyrillic'    },
  bul: { name:'Bulgarian',            native:'Български',         flag:'🇧🇬', family:'Slavic',         script:'Cyrillic'    },
  mkd: { name:'Macedonian',           native:'Македонски',        flag:'🇲🇰', family:'Slavic',         script:'Cyrillic'    },
  hin: { name:'Hindi',                native:'हिन्दी',            flag:'🇮🇳', family:'Indo-Iranian',   script:'Devanagari'  },
  urd: { name:'Urdu',                 native:'اردو',              flag:'🇵🇰', family:'Indo-Iranian',   script:'Arabic'      },
  ben: { name:'Bengali',              native:'বাংলা',             flag:'🇧🇩', family:'Indo-Iranian',   script:'Bengali'     },
  guj: { name:'Gujarati',             native:'ગુજરાતી',           flag:'🇮🇳', family:'Indo-Iranian',   script:'Gujarati'    },
  mar: { name:'Marathi',              native:'मराठी',             flag:'🇮🇳', family:'Indo-Iranian',   script:'Devanagari'  },
  nep: { name:'Nepali',               native:'नेपाली',            flag:'🇳🇵', family:'Indo-Iranian',   script:'Devanagari'  },
  fas: { name:'Persian (Farsi)',       native:'فارسی',             flag:'🇮🇷', family:'Indo-Iranian',   script:'Arabic'      },
  pus: { name:'Pashto',               native:'پښتو',              flag:'🇦🇫', family:'Indo-Iranian',   script:'Arabic'      },
  kur: { name:'Kurdish',              native:'Kurdî',             flag:'🇮🇶', family:'Indo-Iranian',   script:'Latin'       },
  lit: { name:'Lithuanian',           native:'Lietuvių',          flag:'🇱🇹', family:'Baltic',         script:'Latin'       },
  lav: { name:'Latvian',              native:'Latviešu',          flag:'🇱🇻', family:'Baltic',         script:'Latin'       },
  ell: { name:'Greek',                native:'Ελληνικά',          flag:'🇬🇷', family:'Hellenic',       script:'Greek'       },
  gle: { name:'Irish',                native:'Gaeilge',           flag:'🇮🇪', family:'Celtic',         script:'Latin'       },
  fin: { name:'Finnish',              native:'Suomi',             flag:'🇫🇮', family:'Uralic',         script:'Latin'       },
  hun: { name:'Hungarian',            native:'Magyar',            flag:'🇭🇺', family:'Uralic',         script:'Latin'       },
  est: { name:'Estonian',             native:'Eesti',             flag:'🇪🇪', family:'Uralic',         script:'Latin'       },
  tur: { name:'Turkish',              native:'Türkçe',            flag:'🇹🇷', family:'Turkic',         script:'Latin'       },
  uzb: { name:'Uzbek',                native:"O'zbek",            flag:'🇺🇿', family:'Turkic',         script:'Latin'       },
  kaz: { name:'Kazakh',               native:'Қазақша',           flag:'🇰🇿', family:'Turkic',         script:'Cyrillic'    },
  aze: { name:'Azerbaijani',          native:'Azərbaycan',        flag:'🇦🇿', family:'Turkic',         script:'Latin'       },
  zho: { name:'Chinese (Simplified)', native:'中文（简体）',        flag:'🇨🇳', family:'Sino-Tibetan',   script:'Han'         },
  cmn: { name:'Mandarin Chinese',     native:'普通话',             flag:'🇨🇳', family:'Sino-Tibetan',   script:'Han'         },
  yue: { name:'Cantonese',            native:'粵語',              flag:'🇭🇰', family:'Sino-Tibetan',   script:'Han'         },
  jpn: { name:'Japanese',             native:'日本語',             flag:'🇯🇵', family:'Japonic',        script:'Japanese'    },
  kor: { name:'Korean',               native:'한국어',             flag:'🇰🇷', family:'Koreanic',       script:'Hangul'      },
  vie: { name:'Vietnamese',           native:'Tiếng Việt',        flag:'🇻🇳', family:'Austro-Asiatic', script:'Latin'       },
  ind: { name:'Indonesian',           native:'Bahasa Indonesia',  flag:'🇮🇩', family:'Austronesian',   script:'Latin'       },
  msa: { name:'Malay',                native:'Bahasa Melayu',     flag:'🇲🇾', family:'Austronesian',   script:'Latin'       },
  tgl: { name:'Filipino (Tagalog)',   native:'Filipino',          flag:'🇵🇭', family:'Austronesian',   script:'Latin'       },
  tam: { name:'Tamil',                native:'தமிழ்',             flag:'🇮🇳', family:'Dravidian',      script:'Tamil'       },
  tel: { name:'Telugu',               native:'తెలుగు',            flag:'🇮🇳', family:'Dravidian',      script:'Telugu'      },
  kan: { name:'Kannada',              native:'ಕನ್ನಡ',             flag:'🇮🇳', family:'Dravidian',      script:'Kannada'     },
  mal: { name:'Malayalam',            native:'മലയാളം',            flag:'🇮🇳', family:'Dravidian',      script:'Malayalam'   },
  tha: { name:'Thai',                 native:'ภาษาไทย',           flag:'🇹🇭', family:'Tai-Kadai',      script:'Thai'        },
  swh: { name:'Swahili',              native:'Kiswahili',         flag:'🇰🇪', family:'Niger-Congo',    script:'Latin'       },
  hau: { name:'Hausa',                native:'Hausa',             flag:'🇳🇬', family:'Afro-Asiatic',   script:'Latin'       },
  yor: { name:'Yoruba',               native:'Yorùbá',            flag:'🇳🇬', family:'Niger-Congo',    script:'Latin'       },
  kat: { name:'Georgian',             native:'ქართული',           flag:'🇬🇪', family:'Kartvelian',     script:'Georgian'    },
  mon: { name:'Mongolian',            native:'Монгол',            flag:'🇲🇳', family:'Mongolic',       script:'Cyrillic'    },
  epo: { name:'Esperanto',            native:'Esperanto',         flag:'🌍',  family:'Constructed',    script:'Latin'       },
  lat: { name:'Latin',                native:'Latina',            flag:'🏛️',  family:'Italic',         script:'Latin'       },
  hye: { name:'Armenian',             native:'Հայerén',           flag:'🇦🇲', family:'IE Isolate',     script:'Armenian'    },
  sqi: { name:'Albanian',             native:'Shqip',             flag:'🇦🇱', family:'IE Isolate',     script:'Latin'       },
  eus: { name:'Basque',               native:'Euskara',           flag:'🏴',  family:'Isolate',        script:'Latin'       },
};

export default async function handler(req, res) {
  // CORS headers so the HTML page can call this from any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length < 5) {
      return res.status(400).json({ error: 'Text too short — need at least 5 characters' });
    }

    // franc returns ISO 639-3 code, or 'und' if undetermined
    const code = franc(text.trim(), { minLength: 5 });

    if (!code || code === 'und') {
      return res.status(200).json({ code: 'und' });
    }

    const info = ISO_MAP[code];
    if (!info) {
      // franc detected something we don't have metadata for — return raw code
      return res.status(200).json({ code, name: code, native: '', flag: '🌐', family: 'Unknown', script: 'Unknown' });
    }

    return res.status(200).json({
      code,
      name:   info.name,
      native: info.native,
      flag:   info.flag,
      family: info.family,
      script: info.script,
    });

  } catch (err) {
    console.error('detect error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
