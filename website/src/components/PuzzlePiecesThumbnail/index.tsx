import {useMemo, type CSSProperties, type ReactNode} from 'react';
import {
  boardAssets,
  buildBoardEntitiesFromPreset,
  type SuperMetalMonsBoardPreset,
} from '@site/src/components/SuperMetalMonsBoard';

type PuzzlePiecesThumbnailProps = {
  boardPreset: SuperMetalMonsBoardPreset;
  label: string;
};

const wrapStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'block',
  background: 'transparent',
};

const svgStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'block',
  imageRendering: 'auto',
  transform: 'translateX(30px)',
};

const pieceImageStyle: CSSProperties = {
  imageRendering: 'auto',
  pointerEvents: 'none',
};

const blackSpawnTileByType: Record<'angel' | 'demon' | 'drainer' | 'spirit' | 'mystic', {col: number; row: number}> = {
  mystic: {col: 3, row: 0},
  spirit: {col: 4, row: 0},
  drainer: {col: 5, row: 0},
  angel: {col: 6, row: 0},
  demon: {col: 7, row: 0},
};

function isBlackMonOnOwnSpawn(mon: {
  side?: 'black' | 'white';
  monType?: 'angel' | 'demon' | 'drainer' | 'spirit' | 'mystic';
  col: number;
  row: number;
}): boolean {
  if (mon.side !== 'black' || mon.monType === undefined) {
    return false;
  }
  const spawn = blackSpawnTileByType[mon.monType];
  return mon.col === spawn.col && mon.row === spawn.row;
}

export default function PuzzlePiecesThumbnail({
  boardPreset,
  label,
}: PuzzlePiecesThumbnailProps): ReactNode {
  const entities = useMemo(() => buildBoardEntitiesFromPreset(boardPreset), [boardPreset]);

  const visibleEntities = useMemo(
    () => entities.filter((entity) => entity.carriedByDrainerId === undefined && !entity.isScored),
    [entities],
  );

  const monEntities = visibleEntities.filter((entity) => entity.kind === 'mon');
  const nonMonEntities = visibleEntities
    .filter((entity) => entity.kind !== 'mon')
    .sort((a, b) => {
      const rank = (kind: string) => {
        if (kind === 'item') {
          return 0;
        }
        if (kind === 'whiteMana' || kind === 'blackMana') {
          return 1;
        }
        if (kind === 'superMana') {
          return 2;
        }
        return 3;
      };
      return rank(a.kind) - rank(b.kind);
    });

  return (
    <span style={wrapStyle}>
      <svg viewBox="0 0 11 11" style={svgStyle} aria-label={label} role="img" preserveAspectRatio="xMidYMid meet">
        {nonMonEntities.map((entity) => (
          <image
            key={entity.id}
            href={entity.href}
            x={entity.col}
            y={entity.row}
            width={1}
            height={1}
            style={pieceImageStyle}
          />
        ))}

        {monEntities.map((entity) => {
          const rotationCenterX = entity.col + 0.5;
          const rotationCenterY = entity.row + 0.5;
          const heldMana = entities.find(
            (candidate) =>
              !candidate.isScored &&
              (candidate.kind === 'whiteMana' ||
                candidate.kind === 'blackMana' ||
                candidate.kind === 'superMana') &&
              candidate.carriedByDrainerId === entity.id,
          );
          const heldPieceHref =
            heldMana?.kind === 'superMana'
              ? boardAssets.supermanaSimple
              : heldMana?.href ?? (entity.heldItemKind === 'bomb' ? boardAssets.bomb : undefined);
          const heldPieceSize =
            heldMana?.kind === 'superMana'
              ? 0.52
              : entity.heldItemKind === 'bomb'
                ? 0.5
                : heldPieceHref !== undefined
                  ? 0.66
                  : 0;
          const heldPieceX =
            heldMana?.kind === 'superMana'
              ? entity.col + 0.2
              : entity.heldItemKind === 'bomb'
                ? entity.col + 0.52
                : entity.col + 0.46;
          const heldPieceY =
            heldMana?.kind === 'superMana'
              ? entity.row + 0.08
              : entity.heldItemKind === 'bomb'
                ? entity.row + 0.43
                : entity.row + 0.39;

          return (
            <g key={entity.id}>
              <image
                href={entity.href}
                x={entity.col}
                y={entity.row}
                width={1}
                height={1}
                transform={
                  isBlackMonOnOwnSpawn({
                    side: entity.side,
                    monType: entity.monType,
                    col: entity.col,
                    row: entity.row,
                  })
                    ? `rotate(90 ${rotationCenterX} ${rotationCenterY})`
                    : undefined
                }
                style={pieceImageStyle}
              />
              {heldPieceHref !== undefined ? (
                <image
                  href={heldPieceHref}
                  x={heldPieceX}
                  y={heldPieceY}
                  width={heldPieceSize}
                  height={heldPieceSize}
                  style={pieceImageStyle}
                />
              ) : null}
            </g>
          );
        })}
      </svg>
    </span>
  );
}
