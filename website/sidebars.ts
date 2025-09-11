import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {type: 'doc', id: 'index', label: 'Home'},
    {
      type: 'category',
      label: 'Mons Academy',
      collapsible: true,
      items: [
        {type: 'doc', id: 'academy', label: 'Overview'},
        {type: 'doc', id: 'openings', label: '3 White Openings'},
        {type: 'doc', id: 'techniques', label: '3 Strong Techniques'},
      ],
    },
    {
      type: 'category',
      label: 'Puzzles',
      collapsible: true,
      items: [
        {type: 'doc', id: 'puzzles', label: 'All Puzzles'},
        {type: 'doc', id: 'puzzle1', label: 'Puzzle #1: Restraint'},
        {type: 'doc', id: 'puzzle2', label: 'Puzzle #2: Cage Match'},
        {type: 'doc', id: 'puzzle3', label: 'Puzzle #3: Bombproof'},
        {type: 'doc', id: 'puzzle4', label: 'Puzzle #4: Split Formation'},
      ],
    },
    {
      type: 'category',
      label: 'Resources',
      collapsible: true,
      items: [
        {type: 'doc', id: 'resources', label: 'Links & Downloads'},
        {type: 'doc', id: 'faq', label: 'FAQ'},
      ],
    },
  ],
};

export default sidebars;
