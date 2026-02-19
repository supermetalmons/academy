import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Mons Academy',
  tagline: 'Strategy lessons, puzzles, and resources for Super Metal Mons.',
  favicon: 'img/favicon.ico',

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
        {to: '/docs/legacy/', label: 'Legacy', position: 'left'},
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Learn',
          items: [
            {label: 'Intro', to: '/docs/intro/overview'},
            {label: 'Puzzles', to: '/docs/puzzles/overview'},
            {label: 'Resources', to: '/docs/resources/overview'},
          ],
        },
        {
          title: 'Community',
          items: [
            {label: 'Telegram', href: 'https://t.me/supermetalmons'},
            {label: 'Discord', href: 'https://discord.gg/hDKhu9yX8d'},
            {label: 'X', href: 'https://x.com/supermetalmons'},
          ],
        },
        {
          title: 'Play',
          items: [
            {label: 'mons.link', href: 'https://mons.link/'},
            {label: 'Official Guide', href: 'https://guide.mons.link'},
            {label: 'Legacy Archive', to: '/docs/legacy/'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Mons Academy.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
