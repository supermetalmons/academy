import clsx from 'clsx';

type LegacyTheme = 'grass' | 'library';

type LegacyContentFrameProps = {
  theme: LegacyTheme;
  heading: string;
  html: string;
  showTicker?: boolean;
};

export default function LegacyContentFrame({
  theme,
  heading,
  html,
  showTicker = false,
}: LegacyContentFrameProps) {
  return (
    <section
      className={clsx('legacy-frame', {
        'legacy-frame--grass': theme === 'grass',
        'legacy-frame--library': theme === 'library',
      })}>
      <div className="legacy-frame__heading-box">
        <h1>{heading}</h1>
      </div>

      <div
        className="legacy-frame__content"
        // Source content is pulled from the archived legacy snapshot.
        dangerouslySetInnerHTML={{__html: html}}
      />

      {showTicker && (
        <p className="legacy-frame__ticker">SWAG IS ETERNAL</p>
      )}
    </section>
  );
}
