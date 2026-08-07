import type { Config } from 'tailwindcss';

/**
 * NexKeys Agency — Design System
 * ─────────────────────────────────────────────────────────
 * Ported 1:1 from the legacy assets/css/styles.css :root block (L9–67),
 * then extended with the MIDNIGHT GOLD family.
 *
 * THE TWO GOLDS:
 *   · Brand Gold    #C9A227 — the primary. Buttons, links, accents, focus.
 *   · Midnight Gold #7A5F1E → deep, desaturated, "gold seen at night".
 *     Used for atmosphere: section grounds, deep surfaces, quiet borders,
 *     the footer storm. It gives the black warmth without competing with
 *     the primary. Where the old site had flat black, midnight gold breathes.
 *
 * The legacy #f8c03e (admin + internship) is ELIMINATED — see plan §4.3.
 */

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      /* Gutter is fluid at the bottom end. A flat 1rem costs 32px of a 128px
         viewport — a quarter of the screen — so it tapers to 0.625rem there
         and only reaches the full 1rem once there is room to spend it. */
      padding: {
        DEFAULT: 'clamp(0.625rem, 3.5vw, 1rem)',
        sm: '1.5rem',
        lg: '2rem',
      },
      screens: { '2xl': '1280px' },
    },
    extend: {
      screens: {
        /* 128px is the supported floor — below `xxs` everything is single
           column, fluid, and free of fixed widths. */
        xxs: '320px',
        xs: '400px',
      },

      colors: {
        /* ── Grounds ─────────────────────────────── */
        bg: {
          DEFAULT: '#050508',
          2: '#0c0c0e',
          3: '#111108',
        },

        /* ── Brand Gold ──────────────────────────── */
        gold: {
          DEFAULT: '#C9A227',
          light: '#E8BC2C',
          bright: '#F0CC50',
          dark: '#8B6914',
          deeper: '#5A4209',
        },

        /* ── MIDNIGHT GOLD ───────────────────────── */
        midnight: {
          DEFAULT: '#0A0906', // near-black, warm undertone
          deep: '#080709',    // coolest ground
          gold: '#1A1509',    // section ground — black with gold in it
          2: '#241C0E',       // elevated midnight surface
          3: '#332815',       // raised / hover midnight surface
          edge: '#4A3A18',    // midnight border
          lit: '#7A5F1E',     // midnight gold accent — text/icon on midnight
        },

        /* ── shadcn semantic roles ───────────────── */
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },

        /* ── Status (ported from legacy) ─────────── */
        status: {
          live: '#10B981',
          success: '#4ADE80',
          danger: '#EF4444',
          info: '#C084FC',
        },
      },

      /* White-alpha scale — legacy --w-80 … --w-08 */
      textColor: {
        fg: {
          DEFAULT: '#ffffff',
          80: 'rgba(255,255,255,0.80)',
          60: 'rgba(255,255,255,0.60)',
          40: 'rgba(255,255,255,0.40)',
          20: 'rgba(255,255,255,0.20)',
        },
      },

      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        head: ['var(--font-head)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },

      /* Fluid type scale — ported from legacy .d-xl … .label.
       *
       * THE 128px FLOOR.
       * A plain `clamp(72px, 12vw, 180px)` never goes below 72px, so on a
       * 128px viewport it renders 72px type into a ~108px column and blows
       * the layout sideways. Nesting `min()` in the lower bound makes the
       * FLOOR ITSELF viewport-relative:
       *
       *     clamp( min(72px, 20vw), 12vw, 180px )
       *              └── the escape hatch ──┘
       *
       * · ≥360px  → min() resolves to the px value, so the scale is byte-for
       *             -byte identical to before. Phone and desktop design is
       *             completely untouched.
       * · <360px  → min() resolves to the vw value and the type keeps
       *             shrinking with the viewport instead of hitting a wall.
       *
       * At 128px the display headline lands at ~26px inside a ~108px column,
       * which fits. Nothing overflows, at any width, ever.
       */
      fontSize: {
        'display-xl': ['clamp(min(72px,20vw),12vw,180px)', { lineHeight: '0.92', letterSpacing: '0.03em' }],
        'display-lg': ['clamp(min(52px,16vw),9vw,120px)', { lineHeight: '0.93', letterSpacing: '0.03em' }],
        'display-md': ['clamp(min(38px,13vw),6vw,80px)', { lineHeight: '0.95', letterSpacing: '0.02em' }],
        h1: ['clamp(min(34px,11vw),5vw,64px)', { lineHeight: '1.05', letterSpacing: '-0.01em' }],
        h2: ['clamp(min(27px,9vw),4vw,48px)', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        h3: ['clamp(min(18px,6vw),2.5vw,26px)', { lineHeight: '1.25' }],
        /* Body copy keeps a hard floor — legibility beats fitting more in. */
        'body-lg': ['clamp(16px,1.1vw,18px)', { lineHeight: '1.75' }],
        'body-sm': ['14px', { lineHeight: '1.65' }],
        label: ['clamp(10px,2.6vw,11px)', { lineHeight: '1.4', letterSpacing: '0.2em' }],
      },

      /* Generous whitespace scale — the findrealestate.com lesson.
         Sections breathe roughly 40% more than the legacy site. */
      spacing: {
        nav: '72px',
        'section-sm': 'clamp(56px,8vw,88px)',
        section: 'clamp(80px,12vw,160px)',
        'section-lg': 'clamp(104px,16vw,220px)',
      },

      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 6px)',
        card: '16px',
        pill: '100px',
      },

      transitionTimingFunction: {
        luxe: 'cubic-bezier(0.16,1,0.3,1)',
        curtain: 'cubic-bezier(0.87,0,0.13,1)',
        calm: 'cubic-bezier(0.25,0.46,0.45,0.94)',
      },

      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg,#E8BC2C 0%,#C9A227 42%,#9A7318 100%)',
        'gradient-gold-text': 'linear-gradient(90deg,#F0CC50 0%,#C9A227 50%,#9A7318 100%)',
        'gradient-midnight': 'linear-gradient(160deg,#0A0906 0%,#1A1509 55%,#050508 100%)',
        'gradient-midnight-gold': 'linear-gradient(135deg,#1A1509 0%,#332815 50%,#0A0906 100%)',
      },

      boxShadow: {
        gold: '0 0 32px rgba(201,162,39,0.28)',
        'gold-lg': '0 0 56px rgba(201,162,39,0.48)',
        midnight: '0 24px 60px rgba(0,0,0,0.6)',
        'midnight-gold': '0 24px 60px rgba(122,95,30,0.12)',
        lift: '0 24px 60px rgba(201,162,39,0.07)',
      },

      keyframes: {
        'ring-spin': { to: { transform: 'rotate(360deg)' } },
        'glow-breathe': {
          '0%,100%': { opacity: '0.15', transform: 'scale(0.95)' },
          '50%': { opacity: '0.28', transform: 'scale(1.06)' },
        },
        'float-a': {
          '0%,100%': { transform: 'translateY(0) rotate(-1deg)' },
          '50%': { transform: 'translateY(-12px) rotate(1deg)' },
        },
        'float-b': {
          '0%,100%': { transform: 'translateY(0) rotate(1deg)' },
          '50%': { transform: 'translateY(10px) rotate(-1deg)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'scroll-pulse': {
          '0%,100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        'pulse-dot': {
          '0%,100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.8)' },
        },
        'live-pulse': {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(16,185,129,0.75)' },
          '55%': { boxShadow: '0 0 0 6px rgba(16,185,129,0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },

      animation: {
        'ring-spin': 'ring-spin 22s linear infinite',
        'ring-spin-slow': 'ring-spin 32s linear infinite reverse',
        'glow-breathe': 'glow-breathe 4s ease-in-out infinite',
        'float-a': 'float-a 6s ease-in-out infinite',
        'float-b': 'float-b 7s ease-in-out infinite',
        marquee: 'marquee 38s linear infinite',
        'scroll-pulse': 'scroll-pulse 2s ease-in-out infinite',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        'live-pulse': 'live-pulse 2.2s ease-in-out infinite',
        shimmer: 'shimmer 4s ease-in-out infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
