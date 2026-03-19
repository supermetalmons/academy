import type {CSSProperties, ReactNode} from 'react';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import BlankSectionPage from '@site/src/components/BlankSectionPage';
import InstructionSubnav from '@site/src/components/InstructionSubnav';

type PdfDocumentProxy = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<any>;
  destroy?: () => Promise<void> | void;
};

const manualViewerStyle: CSSProperties = {
  width: '100%',
  minHeight: '620px',
  backgroundColor: '#fff',
  border: '1px solid #000',
  borderRadius: '10px',
  overflow: 'visible',
};

const controlsStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr auto 1fr',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.7rem 0.8rem',
  borderTop: '1px solid #000',
  backgroundColor: '#f8f8f8',
};

const controlsEdgeStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
};

const controlsEdgeRightStyle: CSSProperties = {
  ...controlsEdgeStyle,
  justifyContent: 'flex-end',
};

const controlsCenterStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '25px',
};

const arrowButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '108px',
  height: '2rem',
  padding: '0 0.65rem',
  border: '1px solid #000',
  borderRadius: '999px',
  backgroundColor: '#fff',
  color: '#000',
  fontSize: '0.95rem',
  fontWeight: 700,
  cursor: 'pointer',
};

const disabledArrowButtonStyle: CSSProperties = {
  ...arrowButtonStyle,
  opacity: 0.45,
  cursor: 'not-allowed',
};

const pageInfoStyle: CSSProperties = {
  margin: 0,
  color: '#000',
  fontSize: '0.95rem',
  fontWeight: 600,
  textAlign: 'center',
};

const magnifierButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2rem',
  height: '2rem',
  border: '1px solid #000',
  borderRadius: '999px',
  backgroundColor: '#fff',
  color: '#000',
  fontSize: '1.05rem',
  lineHeight: 1,
  cursor: 'pointer',
  userSelect: 'none',
};

const magnifierButtonActiveStyle: CSSProperties = {
  ...magnifierButtonStyle,
  backgroundColor: '#000',
  color: '#fff',
};

const magnifierIconStyle: CSSProperties = {
  width: '1.1rem',
  height: '1.1rem',
  display: 'block',
};

const canvasAreaStyle: CSSProperties = {
  position: 'relative',
  padding: '1rem',
  minHeight: '560px',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  background: 'linear-gradient(180deg, #fefefe 0%, #f3f3f3 100%)',
};

const canvasRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  gap: '1rem',
  width: '100%',
};

const canvasStyle: CSSProperties = {
  width: '100%',
  maxWidth: '100%',
  height: 'auto',
  border: '1px solid #222',
  borderRadius: '6px',
  backgroundColor: '#fff',
  boxShadow: '0 10px 22px rgba(0, 0, 0, 0.16)',
};

const hiddenCanvasStyle: CSSProperties = {
  ...canvasStyle,
  display: 'none',
};

const magnifierLensStyle: CSSProperties = {
  position: 'absolute',
  width: '440px',
  height: '300px',
  border: '2px solid #000',
  borderRadius: '0',
  overflow: 'hidden',
  pointerEvents: 'none',
  transform: 'translate(-50%, -50%)',
  boxShadow: '0 10px 24px rgba(0, 0, 0, 0.28)',
  backgroundColor: '#fff',
  zIndex: 25,
  display: 'none',
};

const magnifierLensCanvasStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'block',
};

const statusTextStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: 0,
  fontSize: '1rem',
  fontWeight: 600,
  color: '#333',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
};

const errorTextStyle: CSSProperties = {
  margin: 0,
  padding: '1rem',
  fontSize: '1rem',
  color: '#000',
};

const fallbackStyle: CSSProperties = {
  margin: 0,
  padding: '1rem 0.25rem 0',
  fontSize: '0.95rem',
  color: '#000',
};

const MAGNIFIER_WIDTH = 440;
const MAGNIFIER_HEIGHT = 300;
const MAGNIFIER_ZOOM = 2.75;
const PDF_RENDER_SUPERSAMPLE = 2;

function getVisiblePages(spreadStart: number, numPages: number): number[] {
  if (spreadStart <= 1 || numPages <= 1) {
    return [1];
  }

  const secondPage = spreadStart + 1;
  if (secondPage <= numPages) {
    return [spreadStart, secondPage];
  }

  return [spreadStart];
}

function getNextSpreadStart(spreadStart: number, numPages: number): number {
  if (spreadStart <= 1) {
    return numPages > 1 ? 2 : 1;
  }

  const next = spreadStart + 2;
  return next <= numPages ? next : spreadStart;
}

function getPrevSpreadStart(spreadStart: number): number {
  if (spreadStart <= 1) {
    return 1;
  }

  const prev = spreadStart - 2;
  return prev <= 1 ? 1 : prev;
}

async function renderPageToCanvas(
  doc: PdfDocumentProxy,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  targetWidth: number
): Promise<void> {
  const page = await doc.getPage(pageNumber);
  const baseViewport = page.getViewport({scale: 1});
  const cssScale = targetWidth / baseViewport.width;
  const renderScale = cssScale * PDF_RENDER_SUPERSAMPLE;
  const cssViewport = page.getViewport({scale: cssScale});
  const renderViewport = page.getViewport({scale: renderScale});
  const devicePixelRatio = window.devicePixelRatio || 1;
  const context = canvas.getContext('2d');

  if (!context) {
    return;
  }

  canvas.width = Math.max(1, Math.floor(renderViewport.width * devicePixelRatio));
  canvas.height = Math.max(1, Math.floor(renderViewport.height * devicePixelRatio));
  canvas.style.width = `${Math.floor(cssViewport.width)}px`;
  canvas.style.height = `${Math.floor(cssViewport.height)}px`;

  const renderContext: {
    canvasContext: CanvasRenderingContext2D;
    viewport: any;
    transform?: [number, number, number, number, number, number];
  } = {
    canvasContext: context,
    viewport: renderViewport,
  };

  if (devicePixelRatio !== 1) {
    renderContext.transform = [devicePixelRatio, 0, 0, devicePixelRatio, 0, 0];
  }

  await page.render(renderContext).promise;
}

function ManualPdfViewer(): ReactNode {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [spreadStart, setSpreadStart] = useState<number>(1);
  const [viewerWidth, setViewerWidth] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isMagnifierEnabled, setIsMagnifierEnabled] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const leftCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lensRef = useRef<HTMLDivElement | null>(null);
  const lensCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pdfDocRef = useRef<PdfDocumentProxy | null>(null);
  const renderCycleRef = useRef<number>(0);

  const hideMagnifier = useCallback((): void => {
    const lens = lensRef.current;
    if (lens) {
      lens.style.display = 'none';
    }
  }, []);

  const renderMagnifier = useCallback(
    (canvas: HTMLCanvasElement, clientX: number, clientY: number): void => {
      if (!isMagnifierEnabled) {
        return;
      }

      const container = containerRef.current;
      const lens = lensRef.current;
      const lensCanvas = lensCanvasRef.current;
      if (!container || !lens || !lensCanvas) {
        return;
      }

      const canvasRect = canvas.getBoundingClientRect();
      const xCss = clientX - canvasRect.left;
      const yCss = clientY - canvasRect.top;
      if (xCss < 0 || yCss < 0 || xCss > canvasRect.width || yCss > canvasRect.height) {
        hideMagnifier();
        return;
      }

      const containerRect = container.getBoundingClientRect();
      lens.style.left = `${clientX - containerRect.left}px`;
      lens.style.top = `${clientY - containerRect.top}px`;
      lens.style.display = 'block';

      const dpr = window.devicePixelRatio || 1;
      const lensPixelWidth = Math.floor(MAGNIFIER_WIDTH * dpr);
      const lensPixelHeight = Math.floor(MAGNIFIER_HEIGHT * dpr);
      if (lensCanvas.width !== lensPixelWidth || lensCanvas.height !== lensPixelHeight) {
        lensCanvas.width = lensPixelWidth;
        lensCanvas.height = lensPixelHeight;
      }

      const ratioX = canvas.width / canvasRect.width;
      const ratioY = canvas.height / canvasRect.height;
      const srcWidth = (MAGNIFIER_WIDTH / MAGNIFIER_ZOOM) * ratioX;
      const srcHeight = (MAGNIFIER_HEIGHT / MAGNIFIER_ZOOM) * ratioY;
      const srcX = xCss * ratioX - srcWidth / 2;
      const srcY = yCss * ratioY - srcHeight / 2;
      const srcLeft = Math.max(0, srcX);
      const srcTop = Math.max(0, srcY);
      const srcRight = Math.min(canvas.width, srcX + srcWidth);
      const srcBottom = Math.min(canvas.height, srcY + srcHeight);
      const srcIntersectWidth = srcRight - srcLeft;
      const srcIntersectHeight = srcBottom - srcTop;

      const context = lensCanvas.getContext('2d');
      if (!context) {
        return;
      }

      context.clearRect(0, 0, lensCanvas.width, lensCanvas.height);
      context.fillStyle = '#fff';
      context.fillRect(0, 0, lensCanvas.width, lensCanvas.height);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      if (srcIntersectWidth <= 0 || srcIntersectHeight <= 0) {
        return;
      }

      const destX = ((srcLeft - srcX) / srcWidth) * lensCanvas.width;
      const destY = ((srcTop - srcY) / srcHeight) * lensCanvas.height;
      const destWidth = (srcIntersectWidth / srcWidth) * lensCanvas.width;
      const destHeight = (srcIntersectHeight / srcHeight) * lensCanvas.height;

      context.drawImage(
        canvas,
        srcLeft,
        srcTop,
        srcIntersectWidth,
        srcIntersectHeight,
        destX,
        destY,
        destWidth,
        destHeight
      );
    },
    [hideMagnifier, isMagnifierEnabled]
  );

  const handleCanvasMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>): void => {
      renderMagnifier(event.currentTarget, event.clientX, event.clientY);
    },
    [renderMagnifier]
  );

  const handleCanvasMouseEnter = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>): void => {
      renderMagnifier(event.currentTarget, event.clientX, event.clientY);
    },
    [renderMagnifier]
  );

  useEffect(() => {
    let cancelled = false;
    let loadingTask: {promise: Promise<PdfDocumentProxy>; destroy?: () => void} | null = null;

    const loadManual = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setLoadError(null);

        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.mjs';

        loadingTask = pdfjs.getDocument('/assets/manual.pdf');
        const documentProxy = await loadingTask.promise;

        if (cancelled) {
          await documentProxy.destroy?.();
          return;
        }

        pdfDocRef.current = documentProxy;
        setNumPages(documentProxy.numPages);
        setSpreadStart(1);
      } catch (error) {
        if (!cancelled) {
          setLoadError('Unable to load manual PDF.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadManual();

    return () => {
      cancelled = true;
      loadingTask?.destroy?.();
      const existingDoc = pdfDocRef.current;
      pdfDocRef.current = null;
      if (existingDoc?.destroy) {
        void existingDoc.destroy();
      }
    };
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }

    const updateWidth = (): void => {
      setViewerWidth(node.clientWidth);
    };

    updateWidth();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateWidth);
      return () => window.removeEventListener('resize', updateWidth);
    }

    const observer = new ResizeObserver(updateWidth);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const visiblePages = useMemo(() => {
    if (!numPages) {
      return [1];
    }

    return getVisiblePages(spreadStart, numPages);
  }, [numPages, spreadStart]);

  const pageLabel = useMemo(() => {
    if (!numPages) {
      return 'Loading pages...';
    }

    if (visiblePages.length === 1) {
      return `Page ${visiblePages[0]} of ${numPages}`;
    }

    return `Pages ${visiblePages[0]}-${visiblePages[1]} of ${numPages}`;
  }, [numPages, visiblePages]);

  const canGoPrev = spreadStart > 1;
  const canGoNext =
    numPages !== null && (spreadStart <= 1 ? numPages > 1 : spreadStart + 2 <= numPages);

  useEffect(() => {
    if (!isMagnifierEnabled) {
      hideMagnifier();
    }
  }, [hideMagnifier, isMagnifierEnabled]);

  useEffect(() => {
    hideMagnifier();
  }, [hideMagnifier, spreadStart]);

  useEffect(() => {
    const doc = pdfDocRef.current;
    const leftCanvas = leftCanvasRef.current;
    const rightCanvas = rightCanvasRef.current;

    if (!doc || !numPages || !leftCanvas || viewerWidth <= 0) {
      return;
    }

    let cancelled = false;
    const renderCycle = renderCycleRef.current + 1;
    renderCycleRef.current = renderCycle;

    const renderSpread = async (): Promise<void> => {
      try {
        setIsRendering(true);
        setLoadError(null);

        const spreadGap = 16;
        const padding = 32;
        const availableWidth = Math.max(220, viewerWidth - padding);
        const targetWidth = Math.max(150, (availableWidth - spreadGap) / 2);

        await renderPageToCanvas(doc, visiblePages[0], leftCanvas, targetWidth);

        if (cancelled || renderCycleRef.current !== renderCycle) {
          return;
        }

        if (visiblePages[1] && rightCanvas) {
          await renderPageToCanvas(doc, visiblePages[1], rightCanvas, targetWidth);
        } else if (rightCanvas) {
          rightCanvas.width = 1;
          rightCanvas.height = 1;
        }
      } catch (error) {
        if (!cancelled && renderCycleRef.current === renderCycle) {
          setLoadError('Unable to render manual pages.');
        }
      } finally {
        if (!cancelled && renderCycleRef.current === renderCycle) {
          setIsRendering(false);
        }
      }
    };

    void renderSpread();

    return () => {
      cancelled = true;
    };
  }, [numPages, visiblePages, viewerWidth]);

  return (
    <div style={manualViewerStyle}>
      <div ref={containerRef} style={canvasAreaStyle} onMouseLeave={hideMagnifier}>
        <div style={canvasRowStyle}>
          <canvas
            ref={leftCanvasRef}
            style={{...canvasStyle, cursor: isMagnifierEnabled ? 'none' : 'default'}}
            onMouseEnter={handleCanvasMouseEnter}
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={hideMagnifier}
          />
          <canvas
            ref={rightCanvasRef}
            style={
              visiblePages[1]
                ? {...canvasStyle, cursor: isMagnifierEnabled ? 'none' : 'default'}
                : hiddenCanvasStyle
            }
            onMouseEnter={handleCanvasMouseEnter}
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={hideMagnifier}
          />
        </div>

        <div ref={lensRef} style={magnifierLensStyle} aria-hidden="true">
          <canvas ref={lensCanvasRef} style={magnifierLensCanvasStyle} />
        </div>

        {(isLoading || isRendering) && !loadError ? (
          <p style={statusTextStyle}>{isLoading ? 'Loading manual...' : 'Rendering pages...'}</p>
        ) : null}

        {loadError ? (
          <p style={errorTextStyle}>
            {loadError} Open the PDF directly here:{' '}
            <a href="/assets/manual.pdf" target="_blank" rel="noreferrer">
              manual.pdf
            </a>
            .
          </p>
        ) : null}
      </div>

      <div style={controlsStyle}>
        <div style={controlsEdgeStyle}>
          <button
            type="button"
            style={canGoPrev ? arrowButtonStyle : disabledArrowButtonStyle}
            onClick={() => setSpreadStart((current) => getPrevSpreadStart(current))}
            disabled={!canGoPrev}>
            ← Previous
          </button>
        </div>

        <div style={controlsCenterStyle}>
          <p style={pageInfoStyle}>{pageLabel}</p>
          <button
            type="button"
            style={isMagnifierEnabled ? magnifierButtonActiveStyle : magnifierButtonStyle}
            onClick={() => setIsMagnifierEnabled((current) => !current)}
            aria-label={isMagnifierEnabled ? 'Disable magnifier' : 'Enable magnifier'}
            aria-pressed={isMagnifierEnabled}>
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
              style={magnifierIconStyle}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <circle cx="10.5" cy="10.5" r="5.5" />
              <line x1="14.7" y1="14.7" x2="20" y2="20" />
            </svg>
          </button>
        </div>

        <div style={controlsEdgeRightStyle}>
          <button
            type="button"
            style={canGoNext ? arrowButtonStyle : disabledArrowButtonStyle}
            onClick={() =>
              setSpreadStart((current) => (numPages ? getNextSpreadStart(current, numPages) : current))
            }
            disabled={!canGoNext}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InstructionManualPage(): ReactNode {
  return (
    <BlankSectionPage title="Instruction">
      <InstructionSubnav active="manual" />
      <ManualPdfViewer />
      <p style={fallbackStyle}>
        open the PDF directly here:{' '}
        <a href="/assets/manual.pdf" target="_blank" rel="noreferrer">
          manual.pdf
        </a>
        .
      </p>
      <noscript>
        <p style={fallbackStyle}>
          JavaScript is required for the in-page manual viewer. Open the manual here:{' '}
          <a href="/assets/manual.pdf" target="_blank" rel="noreferrer">
            manual.pdf
          </a>
          .
        </p>
      </noscript>
    </BlankSectionPage>
  );
}
