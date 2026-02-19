import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'category',
      label: 'Intro',
      items: [
        'intro/overview',
        'intro/openings',
        'intro/techniques',
        'intro/interactive-instruction-board',
      ],
    },
    {
      type: 'category',
      label: 'Puzzles',
      items: [
        'puzzles/overview',
        'puzzles/puzzle-1-restraint',
        'puzzles/puzzle-2-cage-match',
        'puzzles/puzzle-3-bombproof',
        'puzzles/puzzle-4-split-formation',
      ],
    },
    {
      type: 'category',
      label: 'Resources',
      items: ['resources/overview', 'resources/gallery'],
    },
    {
      type: 'category',
      label: 'FAQ',
      items: ['faq/super-metal-mons-faq'],
    },
    {
      type: 'category',
      label: 'Legacy',
      items: ['legacy/index', 'legacy/raw-pages', 'legacy/styles-and-colors'],
    },
  ],
};

export default sidebars;
