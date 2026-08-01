export const TELEGRAM_URL = 'https://t.me/+NHwNCgpANBc4Y2E1'
export const URGENT_ALERT_URL = 'https://t.me/+Rojo9L3iKTpkMjhl'
export const KUKU_TV_URL = 'https://nextstudy-kukutv.faizan92048.workers.dev/'

export const BRAND = {
  name: 'Next Study',
  tagline: 'Next Study',
  credit: 'Made by \u2764\ufe0f Ahmad',
  copyright: '\u00a92026 Next Study by Ahmad',
}

export const ADMIN_BRAND = {
  name: 'NEXT STUDY ADMIN PANEL',
  credit: 'Made with \u2764\ufe0f by ZISHAN AHMAD',
}

// Top-level cards on the home page.
// kind: 'dashboard' -> internal link to a sub-platform list (real URLs never show)
// kind: 'link'      -> direct external link, opens in a new tab
//
// `locked` is now its own explicit field on every item (top-level AND every
// sub-platform below) - a card also shows as locked automatically if it's
// kind:'link' with an empty href, even if `locked` is false, so a freshly
// added platform with no URL yet is never accidentally clickable.
export const platforms = [
  {
    id: 'pw-ultimate',
    name: 'PW ULTIMATE',
    description: "India's most loved learning platform for NEET & JEE preparation",
    logo: '/logos/pw.png',
    kind: 'dashboard',
    to: '/pw',
    locked: false,
    colorRgb: '249 115 22',
  },
  {
    id: 'pw-pi-pro',
    name: 'PW PI PRO',
    description: "India's most loved learning platform for NEET & JEE preparation",
    logo: '/logos/pw-pi-pro.png',
    kind: 'link',
    href: 'https://next-study-pi.faizan92048.workers.dev/',
    locked: false,
    colorRgb: '249 115 22',
  },
  {
    id: 'next-topper-ultimate',
    name: 'NEXT TOPPER ULTIMATE',
    description: 'Accelerate your NEET & JEE exam preparation with expert guidance',
    logo: '/logos/next-topper.png',
    kind: 'dashboard',
    to: '/next-topper',
    locked: false,
    colorRgb: '249 115 22',
  },
  {
    id: 'vibrant-academy',
    name: 'Vibrant Academy',
    description: 'Believe in Excellence \u2014 focused coaching for competitive exam success',
    logo: '/logos/vibrant.png',
    kind: 'link',
    href: 'https://next-studyvibrant.faizan92048.workers.dev/',
    locked: false,
    colorRgb: '249 115 22',
  },
  {
    id: 'mission-jeet',
    name: 'Mission Jeet',
    description: 'Focused preparation to achieve your academic goals in competitive exams',
    logo: '/logos/mission-jeet.png',
    kind: 'link',
    href: '',
    locked: true,
    colorRgb: '249 115 22',
  },
]

// Sub-platforms inside the "PW ULTIMATE" dashboard (/pw). Each opens through an
// internal viewer route (/pw/$id) that embeds the real site in an iframe, so
// the actual proxy URL never shows in the browser's address bar.
export const pwPlatforms = [
  {
    id: 'pw-1',
    name: 'PW 1',
    description: "India's most loved learning platform for NEET & JEE preparation",
    logo: '/logos/pw.png',
    url: 'https://nextstudy-pw.faizan92048.workers.dev/',
    locked: false,
  },
  {
    id: 'pw-next-study',
    name: 'PW NEXT STUDY',
    description: "India's most loved learning platform for NEET & JEE preparation",
    logo: '/logos/pw.png',
    url: 'https://next-study-pw.faizan92048.workers.dev/study/batches',
    locked: false,
  },
  {
    id: 'pw-without-login',
    name: 'PW Without Login',
    description: "India's most loved learning platform for NEET & JEE preparation",
    logo: '/logos/pw.png',
    url: 'https://nextstudy-live.faizan92048.workers.dev/',
    locked: false,
  },
]

// Sub-platforms inside the "NEXT TOPPER ULTIMATE" dashboard (/next-topper).
export const nextTopperPlatforms = [
  {
    id: 'next-topper',
    name: 'Next Topper',
    description: 'Accelerate your NEET & JEE exam preparation with expert guidance',
    logo: '/logos/next-topper.png',
    url: 'https://next-topperbyvidya.faizan92048.workers.dev/',
    locked: false,
  },
  {
    id: 'next-topper-2',
    name: 'Next Topper 2',
    description: 'Accelerate your NEET & JEE exam preparation with expert guidance',
    logo: '/logos/next-topper.png',
    url: 'https://next-topper.faizan92048.workers.dev/',
    locked: false,
  },
  {
    id: 'next-topper-3',
    name: 'NEXT TOPPER 3',
    description: 'Accelerate your NEET & JEE exam preparation with expert guidance',
    logo: '/logos/next-topper.png',
    url: 'https://next-topper3.faizan92048.workers.dev/',
    locked: false,
  },
]
