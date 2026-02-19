import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import LegacyContentFrame from '@site/src/components/LegacyContentFrame';
import {legacyContent} from '@site/src/data/legacyContent';

import styles from './index.module.css';

const quickLinks = [
  {
    title: 'Intro',
    to: '/docs/intro/overview',
    description: 'Core lessons, openings, techniques, and interactive instruction board.',
  },
  {
    title: 'Puzzles',
    to: '/docs/puzzles/overview',
    description: 'Position challenges designed to sharpen decision making and tactics.',
  },
  {
    title: 'Resources',
    to: '/docs/resources/overview',
    description: 'Official guide, links, gallery, and external Super Metal Mons resources.',
  },
  {
    title: 'FAQ',
    to: '/docs/faq/super-metal-mons-faq',
    description: 'Frequently asked questions about the game and its ecosystem.',
  },
  {
    title: 'Legacy',
    to: '/docs/legacy/',
    description: 'Raw historical pages, styles, and migration preservation notes.',
  },
];

export default function Home(): ReactNode {
  return (
    <Layout
      title="Mons Academy"
      description="Mons Academy is a comprehensive Super Metal Mons learning and strategy resource.">
      <header className={styles.hero}>
        <div className="container">
          <p className={styles.kicker}>Rebuilt from ultrametal.neocities.org</p>
          <h1 className={styles.title}>Mons Academy</h1>
          <p className={styles.subtitle}>
            The complete home for Super Metal Mons lessons, puzzles, resources, and preserved legacy material.
          </p>
        </div>
      </header>

      <main className="container">
        <section className={styles.grid}>
          {quickLinks.map((item) => (
            <Link key={item.title} className={styles.card} to={item.to}>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
            </Link>
          ))}
        </section>

        <section className={styles.welcomeSection}>
          <LegacyContentFrame
            theme="grass"
            heading="⋆✰ Mons Academy ✰⋆"
            html={legacyContent.index}
            showTicker
          />
        </section>
      </main>
    </Layout>
  );
}
