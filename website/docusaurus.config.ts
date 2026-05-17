import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Mons Academy',
  tagline: 'Strategy lessons, puzzles, and resources for Super Metal Mons.',
  favicon: 'img/favicon.png',

  future: {
    v4: true,
  },

  url: 'https://mons.academy',
  baseUrl: '/',

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/legacy/images/logoimage.jpg',
    colorMode: {
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'Mons Academy',
      logo: {
        alt: 'Mons Academy Logo',
        src: 'img/legacy/images/logoimage.jpg',
      },
      items: [
        {to: '/', label: 'Home', position: 'left'},
        {to: '/docs/intro/overview', label: 'Intro', position: 'left'},
        {to: '/docs/puzzles/overview', label: 'Puzzles', position: 'left'},
        {to: '/docs/resources/overview', label: 'Resources', position: 'left'},
        {
          to: '/docs/faq/super-metal-mons-faq',
          label: 'FAQ',
          position: 'left',
        },

      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: ' ',
          items: [
            {label: 'mons.link', href: 'https://mons.link/'},
            {label: 'X', href: 'https://x.com/supermetalmons'},
            {label: 'Telegram', href: 'https://t.me/supermetalmons'},
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Mons Academy`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
