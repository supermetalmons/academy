import type {CSSProperties, ReactNode} from 'react';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import BlankSectionPage from '@site/src/components/BlankSectionPage';
import InstructionSubnav from '@site/src/components/InstructionSubnav';

type PdfDocumentProxy = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<any>;
  destroy?: () => Promise<void> | void;
};

type PdfJsLikeModule = {
  Util?: {
    transform?: (first: number[], second: number[]) => number[];
  };
  GlobalWorkerOptions?: {
    workerSrc: string;
  };
  getDocument: (src: string) => {promise: Promise<PdfDocumentProxy>; destroy?: () => void};
};

const CANVAS_AREA_INITIAL_MIN_HEIGHT = 560;
const CANVAS_AREA_INITIAL_MIN_HEIGHT_COMPACT = 300;
const CANVAS_AREA_VERTICAL_PADDING = 16;
const CANVAS_AREA_VERTICAL_PADDING_COMPACT = 12;

const manualViewerStyle: CSSProperties = {
  width: '100%',
  minHeight: '620px',
  backgroundColor: '#fff',
  border: '1px solid #000',
  borderRadius: '0',
  overflow: 'visible',
  display: 'flex',
  flexDirection: 'column',
};

const manualViewerCompactStyle: CSSProperties = {
  ...manualViewerStyle,
  minHeight: 0,
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

const controlsCompactStyle: CSSProperties = {
  ...controlsStyle,
  gridTemplateColumns: 'auto minmax(0, 1fr) auto',
  alignItems: 'center',
  gap: '0.55rem',
  padding: '0.58rem 0.58rem 0.62rem',
};

const controlsEdgeStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
};

const controlsEdgeCompactStyle: CSSProperties = {
  ...controlsEdgeStyle,
  justifyContent: 'flex-start',
};

const controlsEdgeRightStyle: CSSProperties = {
  ...controlsEdgeStyle,
  justifyContent: 'flex-end',
};

const controlsEdgeRightCompactStyle: CSSProperties = {
  ...controlsEdgeCompactStyle,
};

const controlsCenterStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '25px',
};

const controlsCenterCompactStyle: CSSProperties = {
  ...controlsCenterStyle,
  width: '100%',
  gap: '10px',
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

const arrowButtonCompactStyle: CSSProperties = {
  ...arrowButtonStyle,
  width: '1.35rem',
  minWidth: '1.35rem',
  height: '1.35rem',
  fontSize: '1rem',
  fontWeight: 700,
  lineHeight: 1,
  padding: 0,
  border: 'none',
  borderRadius: 0,
  backgroundColor: 'transparent',
};

const disabledArrowButtonCompactStyle: CSSProperties = {
  ...arrowButtonCompactStyle,
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

const pageInfoCompactStyle: CSSProperties = {
  ...pageInfoStyle,
  fontSize: '0.82rem',
  minWidth: '0',
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

const magnifierButtonCompactStyle: CSSProperties = {
  ...magnifierButtonStyle,
  width: '1.35rem',
  height: '1.35rem',
  border: 'none',
  borderRadius: 0,
  backgroundColor: 'transparent',
  padding: 0,
};

const magnifierButtonActiveCompactStyle: CSSProperties = {
  ...magnifierButtonCompactStyle,
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
  minHeight: `${CANVAS_AREA_INITIAL_MIN_HEIGHT}px`,
  display: 'flex',
  flex: '1 1 auto',
  alignItems: 'flex-start',
  justifyContent: 'center',
  background: 'linear-gradient(180deg, #fefefe 0%, #f3f3f3 100%)',
};

const canvasAreaCompactStyle: CSSProperties = {
  ...canvasAreaStyle,
  minHeight: `${CANVAS_AREA_INITIAL_MIN_HEIGHT_COMPACT}px`,
  padding: '0.75rem 0.6rem',
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
  position: 'absolute',
  inset: 0,
  margin: 0,
  padding: '1rem 1.25rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  fontSize: '1rem',
  fontWeight: 600,
  lineHeight: 1.4,
  color: '#000',
  backgroundColor: 'rgba(255, 255, 255, 0.86)',
  zIndex: 6,
};

const fullscreenOverlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 13000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  backgroundColor: 'rgba(255, 255, 255, 0.93)',
  backdropFilter: 'blur(2px)',
  WebkitBackdropFilter: 'blur(2px)',
};

const fullscreenFrameShellStyle: CSSProperties = {
  width: 'calc(100vw - 40px)',
  height: 'calc(100vh - 40px)',
  maxWidth: '1200px',
  position: 'relative',
  border: '1px solid #111',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: '#fff',
  boxShadow: '0 14px 30px rgba(0, 0, 0, 0.28)',
};

const fullscreenFrameStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  position: 'relative',
  overflow: 'auto',
  padding: '18px',
  boxSizing: 'border-box',
  backgroundColor: '#f2f2f2',
};

const fullscreenPageSurfaceStyle: CSSProperties = {
  position: 'relative',
  margin: '0 auto',
  backgroundColor: '#fff',
  boxShadow: '0 10px 24px rgba(0, 0, 0, 0.2)',
  userSelect: 'text',
  WebkitUserSelect: 'text',
  transition: 'width 150ms ease-out, height 150ms ease-out',
};

const fullscreenCanvasStyle: CSSProperties = {
  position: 'relative',
  zIndex: 0,
  display: 'block',
  width: '100%',
  height: 'auto',
  pointerEvents: 'none',
  imageRendering: 'auto',
  transition: 'width 150ms ease-out, height 150ms ease-out',
};

const fullscreenTextLayerStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  zIndex: 1,
  overflow: 'hidden',
  userSelect: 'text',
  WebkitUserSelect: 'text',
  pointerEvents: 'auto',
  color: '#000',
  lineHeight: 1,
  cursor: 'default',
};

const fullscreenTextSpanBaseStyle: CSSProperties = {
  position: 'absolute',
  whiteSpace: 'pre',
  transformOrigin: '0 0',
  color: '#000',
  opacity: 0.01,
  pointerEvents: 'auto',
  cursor: 'text',
};

const fullscreenStatusStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1rem',
  fontWeight: 600,
  color: '#222',
  pointerEvents: 'none',
};

const fullscreenLoadingStyle: CSSProperties = {
  ...fullscreenStatusStyle,
  backgroundColor: 'rgba(255, 255, 255, 0.62)',
};

const fullscreenErrorStyle: CSSProperties = {
  ...fullscreenStatusStyle,
  color: '#000',
  backgroundColor: 'rgba(255, 255, 255, 0.84)',
  zIndex: 1,
};

const fullscreenCloseButtonStyle: CSSProperties = {
  position: 'absolute',
  top: '14px',
  right: '14px',
  width: '34px',
  height: '34px',
  borderRadius: '999px',
  border: '1px solid #000',
  backgroundColor: '#fff',
  color: '#000',
  fontSize: '1.2rem',
  lineHeight: 1,
  fontWeight: 700,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  zIndex: 2,
};

const fullscreenZoomDockStyle: CSSProperties = {
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
  bottom: '14px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.55rem',
  border: '1px solid #000',
  borderRadius: '999px',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  padding: '0.42rem 0.62rem',
  zIndex: 2,
};

const fullscreenZoomLabelStyle: CSSProperties = {
  margin: 0,
  fontSize: '0.8rem',
  fontWeight: 700,
  color: '#000',
  lineHeight: 1,
};

const fullscreenZoomSliderStyle: CSSProperties = {
  width: '150px',
  margin: 0,
  accentColor: '#000',
};

const fullscreenZoomValueStyle: CSSProperties = {
  margin: 0,
  minWidth: '42px',
  textAlign: 'right',
  fontSize: '0.78rem',
  fontWeight: 700,
  lineHeight: 1,
  color: '#000',
};

const fullscreenNavButtonStyle: CSSProperties = {
  width: '1.85rem',
  height: '1.85rem',
  border: 'none',
  backgroundColor: 'transparent',
  color: '#000',
  fontSize: '0.95rem',
  lineHeight: 1,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  padding: 0,
};

const fullscreenNavButtonDisabledStyle: CSSProperties = {
  ...fullscreenNavButtonStyle,
  opacity: 0.4,
  cursor: 'not-allowed',
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
const FULLSCREEN_RENDER_SUPERSAMPLE = 2.8;
const FULLSCREEN_MAX_CANVAS_DIMENSION_PX = 8192;
const FULLSCREEN_MAX_CANVAS_AREA_PX = 24_000_000;
const FULLSCREEN_OFFSCREEN_CANVAS_AREA_THRESHOLD_PX = 18_000_000;
const MANUAL_CANVAS_WIDTH_GUARD_PX = 6;
const FULLSCREEN_WIDTH_GUARD_PX = 8;

function parseCssPixelValue(value: string | null | undefined): number {
  if (!value) {
    return 0;
  }
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

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

function getNextSinglePage(currentPage: number, numPages: number): number {
  const next = currentPage + 1;
  return next <= numPages ? next : currentPage;
}

function getPrevSinglePage(currentPage: number): number {
  const prev = currentPage - 1;
  return prev >= 1 ? prev : 1;
}

function normalizeSpreadStartForDualMode(currentPage: number): number {
  if (currentPage <= 1) {
    return 1;
  }
  return currentPage % 2 === 0 ? currentPage : currentPage - 1;
}

function isExpectedRenderInterruption(error: unknown): boolean {
  const name =
    typeof error === 'object' && error !== null && 'name' in error
      ? String((error as {name?: unknown}).name ?? '')
      : '';
  const message =
    typeof error === 'string'
      ? error
      : error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null && 'message' in error
      ? String((error as {message?: unknown}).message ?? '')
      : '';
  const normalized = `${name} ${message}`.toLowerCase();
  return (
    normalized.includes('cancel') ||
    normalized.includes('aborted') ||
    normalized.includes('canvas is already in use')
  );
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
  const [viewerWidth, setViewerWidth] = useState<number>(() =>
    typeof window === 'undefined' ? 0 : window.innerWidth,
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [hasRenderedAtLeastOnce, setHasRenderedAtLeastOnce] = useState<boolean>(false);
  const [renderedCanvasHeight, setRenderedCanvasHeight] = useState<number>(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isMagnifierEnabled, setIsMagnifierEnabled] = useState<boolean>(false);
  const [isNavBelowRowMode, setIsNavBelowRowMode] = useState<boolean>(false);
  const [fullscreenPageNumber, setFullscreenPageNumber] = useState<number | null>(null);
  const [fullscreenZoomPercent, setFullscreenZoomPercent] = useState<number>(100);
  const [fullscreenSurfaceSize, setFullscreenSurfaceSize] = useState<{width: number; height: number}>({
    width: 0,
    height: 0,
  });
  const [fullscreenRenderError, setFullscreenRenderError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRowRef = useRef<HTMLDivElement | null>(null);
  const leftCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lensRef = useRef<HTMLDivElement | null>(null);
  const lensCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fullscreenViewportRef = useRef<HTMLDivElement | null>(null);
  const fullscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fullscreenTextLayerRef = useRef<HTMLDivElement | null>(null);
  const pdfjsRef = useRef<PdfJsLikeModule | null>(null);
  const pdfDocRef = useRef<PdfDocumentProxy | null>(null);
  const renderCycleRef = useRef<number>(0);
  const fullscreenRenderCycleRef = useRef<number>(0);
  const navLockRef = useRef<boolean>(false);

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
        setHasRenderedAtLeastOnce(false);
        setRenderedCanvasHeight(0);

        const pdfjs = (await import('pdfjs-dist')) as unknown as PdfJsLikeModule;
        pdfjsRef.current = pdfjs;
        if (pdfjs.GlobalWorkerOptions) {
          pdfjs.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.mjs';
        }

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
      pdfjsRef.current = null;
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

    let resizeFrame = 0;
    const updateWidth = (): void => {
      const nextWidth = Math.round(node.clientWidth);
      setViewerWidth((current) => {
        if (Math.abs(current - nextWidth) < 2) {
          return current;
        }
        return nextWidth;
      });
    };

    const scheduleWidthUpdate = (): void => {
      if (resizeFrame !== 0) {
        window.cancelAnimationFrame(resizeFrame);
      }
      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = 0;
        updateWidth();
      });
    };

    scheduleWidthUpdate();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', scheduleWidthUpdate);
      return () => {
        window.removeEventListener('resize', scheduleWidthUpdate);
        if (resizeFrame !== 0) {
          window.cancelAnimationFrame(resizeFrame);
        }
      };
    }

    const observer = new ResizeObserver(() => {
      scheduleWidthUpdate();
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
      if (resizeFrame !== 0) {
        window.cancelAnimationFrame(resizeFrame);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let frameId = 0;
    let observer: MutationObserver | null = null;

    const updateNavBelowRowMode = (): void => {
      const shellNode = window.document.querySelector('.mons-shell');
      const nextMode =
        shellNode instanceof HTMLElement &&
        shellNode.classList.contains('mons-shell--nav-below');
      setIsNavBelowRowMode((current) => (current === nextMode ? current : nextMode));
    };

    const scheduleUpdate = (): void => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        updateNavBelowRowMode();
      });
    };

    scheduleUpdate();
    window.addEventListener('resize', scheduleUpdate);

    const shellNode = window.document.querySelector('.mons-shell');
    if (shellNode instanceof HTMLElement && typeof MutationObserver !== 'undefined') {
      observer = new MutationObserver(() => {
        scheduleUpdate();
      });
      observer.observe(shellNode, {
        attributes: true,
        attributeFilter: ['class'],
      });
    }

    return () => {
      window.removeEventListener('resize', scheduleUpdate);
      observer?.disconnect();
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  const isSinglePageMode = isNavBelowRowMode;

  useEffect(() => {
    if (isSinglePageMode) {
      return;
    }
    setSpreadStart((current) => {
      const next = normalizeSpreadStartForDualMode(current);
      return next === current ? current : next;
    });
  }, [isSinglePageMode]);

  const visiblePages = useMemo(() => {
    if (!numPages) {
      return [1];
    }

    if (isSinglePageMode) {
      const clamped = Math.min(Math.max(spreadStart, 1), numPages);
      return [clamped];
    }

    return getVisiblePages(spreadStart, numPages);
  }, [isSinglePageMode, numPages, spreadStart]);

  const isCompactViewer = viewerWidth > 0 && viewerWidth <= 620;

  const resolvedCanvasAreaStyle = useMemo<CSSProperties>(() => {
    const baseStyle = isCompactViewer ? canvasAreaCompactStyle : canvasAreaStyle;
    const initialMinHeight = isCompactViewer
      ? CANVAS_AREA_INITIAL_MIN_HEIGHT_COMPACT
      : CANVAS_AREA_INITIAL_MIN_HEIGHT;
    const verticalPadding = isCompactViewer
      ? CANVAS_AREA_VERTICAL_PADDING_COMPACT
      : CANVAS_AREA_VERTICAL_PADDING;

    const measuredMinHeight =
      hasRenderedAtLeastOnce && renderedCanvasHeight > 0
        ? Math.ceil(renderedCanvasHeight + verticalPadding * 2)
        : initialMinHeight;

    return {
      ...baseStyle,
      minHeight: `${measuredMinHeight}px`,
    };
  }, [hasRenderedAtLeastOnce, isCompactViewer, renderedCanvasHeight]);

  const pageLabel = useMemo(() => {
    if (!numPages) {
      return 'Loading pages...';
    }

    if (visiblePages.length === 1) {
      return `Page ${visiblePages[0]} of ${numPages}`;
    }

    return `Pages ${visiblePages[0]}-${visiblePages[1]} of ${numPages}`;
  }, [numPages, visiblePages]);

  const compactPageLabel = useMemo(() => {
    if (!numPages) {
      return '...';
    }

    if (visiblePages.length === 1) {
      return `${visiblePages[0]} / ${numPages}`;
    }

    return `${visiblePages[0]}-${visiblePages[1]} / ${numPages}`;
  }, [numPages, visiblePages]);

  const clampedFullscreenZoomPercent = useMemo(
    () => Math.min(300, Math.max(75, Math.round(fullscreenZoomPercent))),
    [fullscreenZoomPercent],
  );

  const canGoPrev = spreadStart > 1;
  const canGoNext =
    numPages !== null &&
    (isSinglePageMode
      ? spreadStart < numPages
      : spreadStart <= 1
      ? numPages > 1
      : spreadStart + 2 <= numPages);
  const canNavigate = !isLoading && !isRendering && !loadError;
  const canFullscreenPrev =
    fullscreenPageNumber !== null && fullscreenPageNumber > 1;
  const canFullscreenNext =
    fullscreenPageNumber !== null &&
    numPages !== null &&
    fullscreenPageNumber < numPages;

  const closeFullscreen = useCallback((): void => {
    setFullscreenPageNumber(null);
    setFullscreenSurfaceSize({width: 0, height: 0});
    setFullscreenRenderError(null);
  }, []);

  const openFullscreenPage = useCallback(
    (pageNumber: number): void => {
      if (!numPages) {
        return;
      }
      const clampedPage = Math.min(Math.max(pageNumber, 1), numPages);
      hideMagnifier();
      setIsMagnifierEnabled(false);
      setFullscreenZoomPercent(100);
      setFullscreenSurfaceSize({width: 0, height: 0});
      setFullscreenRenderError(null);
      setFullscreenPageNumber(clampedPage);
    },
    [hideMagnifier, numPages]
  );

  const handleFullscreenPrev = useCallback((): void => {
    setFullscreenPageNumber((current) => {
      if (current === null || current <= 1) {
        return current;
      }
      return current - 1;
    });
  }, []);

  const handleFullscreenNext = useCallback((): void => {
    if (!numPages) {
      return;
    }
    setFullscreenPageNumber((current) => {
      if (current === null || current >= numPages) {
        return current;
      }
      return current + 1;
    });
  }, [numPages]);

  const handlePrevClick = useCallback((): void => {
    if (!canGoPrev || !canNavigate || navLockRef.current) {
      return;
    }
    navLockRef.current = true;
    setSpreadStart((current) =>
      isSinglePageMode ? getPrevSinglePage(current) : getPrevSpreadStart(current),
    );
  }, [canGoPrev, canNavigate, isSinglePageMode]);

  const handleNextClick = useCallback((): void => {
    if (!numPages || !canGoNext || !canNavigate || navLockRef.current) {
      return;
    }
    navLockRef.current = true;
    setSpreadStart((current) =>
      isSinglePageMode
        ? getNextSinglePage(current, numPages)
        : getNextSpreadStart(current, numPages),
    );
  }, [canGoNext, canNavigate, isSinglePageMode, numPages]);

  useEffect(() => {
    if (!isMagnifierEnabled) {
      hideMagnifier();
    }
  }, [hideMagnifier, isMagnifierEnabled]);

  useEffect(() => {
    hideMagnifier();
  }, [hideMagnifier, spreadStart]);

  useEffect(() => {
    if (!fullscreenPageNumber) {
      return;
    }

    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        closeFullscreen();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [closeFullscreen, fullscreenPageNumber]);

  useEffect(() => {
    const doc = pdfDocRef.current;
    const pdfjsApi = pdfjsRef.current;
    const viewportNode = fullscreenViewportRef.current;
    const canvasNode = fullscreenCanvasRef.current;
    const textLayerNode = fullscreenTextLayerRef.current;
    if (!fullscreenPageNumber || !doc || !viewportNode || !canvasNode || !textLayerNode) {
      return;
    }

    let cancelled = false;
    let resizeFrame = 0;
    const renderCycle = fullscreenRenderCycleRef.current + 1;
    fullscreenRenderCycleRef.current = renderCycle;

    const renderFullscreenPage = async (): Promise<void> => {
      try {
        setFullscreenRenderError(null);

        const page = await doc.getPage(fullscreenPageNumber);
        if (cancelled || fullscreenRenderCycleRef.current !== renderCycle) {
          return;
        }

        const viewportRect = viewportNode.getBoundingClientRect();
        const viewportStyles = window.getComputedStyle(viewportNode);
        const viewportPaddingX =
          parseCssPixelValue(viewportStyles.paddingLeft) +
          parseCssPixelValue(viewportStyles.paddingRight);
        const availableWidth = Math.max(
          220,
          viewportRect.width - viewportPaddingX - FULLSCREEN_WIDTH_GUARD_PX,
        );
        const baseViewport = page.getViewport({scale: 1});
        const fitScale = availableWidth / Math.max(1, baseViewport.width);
        const cssScale = Math.max(0.08, fitScale * (clampedFullscreenZoomPercent / 100));
        const devicePixelRatio = window.devicePixelRatio || 1;
        const zoomFactor = Math.max(1, clampedFullscreenZoomPercent / 100);
        const dynamicFullscreenSupersample = Math.max(
          1,
          FULLSCREEN_RENDER_SUPERSAMPLE / zoomFactor,
        );
        let renderScale = cssScale * dynamicFullscreenSupersample;
        const getCanvasMetricsForScale = (scale: number) => {
          const width = Math.max(
            1,
            Math.floor(baseViewport.width * scale * devicePixelRatio),
          );
          const height = Math.max(
            1,
            Math.floor(baseViewport.height * scale * devicePixelRatio),
          );
          return {
            width,
            height,
            area: width * height,
          };
        };
        const currentMetrics = getCanvasMetricsForScale(renderScale);
        let renderScaleClampFactor = 1;
        if (currentMetrics.width > FULLSCREEN_MAX_CANVAS_DIMENSION_PX) {
          renderScaleClampFactor = Math.min(
            renderScaleClampFactor,
            FULLSCREEN_MAX_CANVAS_DIMENSION_PX / currentMetrics.width,
          );
        }
        if (currentMetrics.height > FULLSCREEN_MAX_CANVAS_DIMENSION_PX) {
          renderScaleClampFactor = Math.min(
            renderScaleClampFactor,
            FULLSCREEN_MAX_CANVAS_DIMENSION_PX / currentMetrics.height,
          );
        }
        if (currentMetrics.area > FULLSCREEN_MAX_CANVAS_AREA_PX) {
          renderScaleClampFactor = Math.min(
            renderScaleClampFactor,
            Math.sqrt(FULLSCREEN_MAX_CANVAS_AREA_PX / currentMetrics.area),
          );
        }
        if (renderScaleClampFactor < 1) {
          renderScale = Math.max(cssScale, renderScale * renderScaleClampFactor);
        }
        const cssViewport = page.getViewport({scale: cssScale});
        const renderViewport = page.getViewport({scale: renderScale});
        const cssWidth = Math.max(1, Math.floor(cssViewport.width));
        const cssHeight = Math.max(1, Math.floor(cssViewport.height));
        canvasNode.style.width = `${cssWidth}px`;
        canvasNode.style.height = `${cssHeight}px`;
        setFullscreenSurfaceSize((current) =>
          current.width === cssWidth && current.height === cssHeight
            ? current
            : {width: cssWidth, height: cssHeight},
        );

        const renderPixelWidth = Math.max(
          1,
          Math.floor(renderViewport.width * devicePixelRatio),
        );
        const renderPixelHeight = Math.max(
          1,
          Math.floor(renderViewport.height * devicePixelRatio),
        );
        const renderPixelArea = renderPixelWidth * renderPixelHeight;
        const useOffscreenBuffer =
          renderPixelArea <= FULLSCREEN_OFFSCREEN_CANVAS_AREA_THRESHOLD_PX;
        const context = canvasNode.getContext('2d');
        if (!context) {
          return;
        }
        if (
          canvasNode.width !== renderPixelWidth ||
          canvasNode.height !== renderPixelHeight
        ) {
          canvasNode.width = renderPixelWidth;
          canvasNode.height = renderPixelHeight;
        }
        canvasNode.style.width = `${cssWidth}px`;
        canvasNode.style.height = `${cssHeight}px`;
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        if (useOffscreenBuffer) {
          const offscreenCanvas = window.document.createElement('canvas');
          offscreenCanvas.width = renderPixelWidth;
          offscreenCanvas.height = renderPixelHeight;
          const offscreenContext = offscreenCanvas.getContext('2d');
          if (!offscreenContext) {
            return;
          }
          offscreenContext.imageSmoothingEnabled = true;
          offscreenContext.imageSmoothingQuality = 'high';
          const offscreenRenderContext: {
            canvasContext: CanvasRenderingContext2D;
            viewport: any;
            transform?: [number, number, number, number, number, number];
          } = {
            canvasContext: offscreenContext,
            viewport: renderViewport,
          };
          if (devicePixelRatio !== 1) {
            offscreenRenderContext.transform = [devicePixelRatio, 0, 0, devicePixelRatio, 0, 0];
          }
          await page.render(offscreenRenderContext).promise;
          if (cancelled || fullscreenRenderCycleRef.current !== renderCycle) {
            return;
          }
          context.clearRect(0, 0, canvasNode.width, canvasNode.height);
          context.drawImage(offscreenCanvas, 0, 0);
        } else {
          context.clearRect(0, 0, canvasNode.width, canvasNode.height);
          const directRenderContext: {
            canvasContext: CanvasRenderingContext2D;
            viewport: any;
            transform?: [number, number, number, number, number, number];
          } = {
            canvasContext: context,
            viewport: renderViewport,
          };
          if (devicePixelRatio !== 1) {
            directRenderContext.transform = [devicePixelRatio, 0, 0, devicePixelRatio, 0, 0];
          }
          await page.render(directRenderContext).promise;
          if (cancelled || fullscreenRenderCycleRef.current !== renderCycle) {
            return;
          }
        }

        const textContent = await page.getTextContent();
        if (cancelled || fullscreenRenderCycleRef.current !== renderCycle) {
          return;
        }

        textLayerNode.innerHTML = '';
        textLayerNode.style.userSelect = 'text';
        textLayerNode.style.webkitUserSelect = 'text';
        textLayerNode.style.pointerEvents = 'auto';
        textLayerNode.style.cursor = 'default';

        const applyTextSelectionAttrs = (): void => {
          const spans = textLayerNode.querySelectorAll('span');
          spans.forEach((spanNode) => {
            if (!(spanNode instanceof HTMLSpanElement)) {
              return;
            }
            spanNode.classList.add('manual-fullscreen-text-span');
            spanNode.style.userSelect = 'text';
            spanNode.style.webkitUserSelect = 'text';
            spanNode.style.pointerEvents = 'auto';
            spanNode.style.cursor = 'text';
            spanNode.style.color = '#000';
            spanNode.style.opacity = '0.01';
            (
              spanNode.style as CSSStyleDeclaration & {webkitTextFillColor?: string}
            ).webkitTextFillColor = '#000';
          });
        };

        const textStyles = (textContent as {styles?: Record<string, {fontFamily?: string; ascent?: number; descent?: number}>}).styles ?? {};
        const transformFn = pdfjsApi?.Util?.transform;
        const measureCanvas = window.document.createElement('canvas');
        const measureContext = measureCanvas.getContext('2d');

        for (const rawItem of textContent.items as Array<any>) {
          if (!rawItem || typeof rawItem.str !== 'string' || !Array.isArray(rawItem.transform)) {
            continue;
          }
          if (!rawItem.str.trim()) {
            continue;
          }
          const firstTransform = typeof transformFn === 'function'
            ? transformFn(cssViewport.transform as number[], rawItem.transform as number[])
            : (rawItem.transform as number[]);
          const tx = typeof transformFn === 'function'
            ? transformFn(firstTransform as number[], [1, 0, 0, -1, 0, 0])
            : firstTransform;
          if (!Array.isArray(tx) || tx.length < 6) {
            continue;
          }

          const textStyle = textStyles[String(rawItem.fontName)] ?? {};
          const fontHeight =
            Math.hypot(Number(tx[2] ?? 0), Number(tx[3] ?? 0)) ||
            Math.max(1, Number(rawItem.height ?? 0) * cssScale);
          const ascent = typeof textStyle.ascent === 'number'
            ? textStyle.ascent * fontHeight
            : typeof textStyle.descent === 'number'
            ? (1 + textStyle.descent) * fontHeight
            : fontHeight;

          let scaleX = 1;
          if (measureContext) {
            const fontFamily = textStyle.fontFamily ?? 'sans-serif';
            measureContext.font = `${fontHeight}px ${fontFamily}`;
            const measuredWidth = measureContext.measureText(rawItem.str).width;
            const expectedWidth = Math.abs(Number(rawItem.width ?? 0)) * cssScale;
            if (measuredWidth > 0 && expectedWidth > 0) {
              scaleX = expectedWidth / measuredWidth;
            }
          }

          const span = window.document.createElement('span');
          span.className = 'manual-fullscreen-text-span';
          span.textContent = rawItem.str;
          span.style.position = String(fullscreenTextSpanBaseStyle.position);
          span.style.whiteSpace = String(fullscreenTextSpanBaseStyle.whiteSpace);
          span.style.transformOrigin = String(fullscreenTextSpanBaseStyle.transformOrigin);
          span.style.color = String(fullscreenTextSpanBaseStyle.color);
          span.style.opacity = String(fullscreenTextSpanBaseStyle.opacity);
          span.style.pointerEvents = String(fullscreenTextSpanBaseStyle.pointerEvents);
          span.style.cursor = String(fullscreenTextSpanBaseStyle.cursor);
          span.style.left = `${Number(tx[4] ?? 0)}px`;
          span.style.top = `${Number(tx[5] ?? 0) - ascent}px`;
          span.style.fontSize = `${fontHeight}px`;
          span.style.fontFamily = textStyle.fontFamily ?? 'sans-serif';
          span.style.transform = `scaleX(${Number.isFinite(scaleX) ? scaleX : 1})`;
          textLayerNode.appendChild(span);
        }

        applyTextSelectionAttrs();

      } catch (error) {
        if (!cancelled && fullscreenRenderCycleRef.current === renderCycle) {
          if (!isExpectedRenderInterruption(error)) {
            setFullscreenRenderError('Unable to render fullscreen page.');
          }
        }
      }
    };

    const scheduleRender = (): void => {
      if (resizeFrame !== 0) {
        window.cancelAnimationFrame(resizeFrame);
      }
      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = 0;
        void renderFullscreenPage();
      });
    };

    scheduleRender();
    window.addEventListener('resize', scheduleRender);

    return () => {
      cancelled = true;
      window.removeEventListener('resize', scheduleRender);
      if (resizeFrame !== 0) {
        window.cancelAnimationFrame(resizeFrame);
      }
    };
  }, [clampedFullscreenZoomPercent, fullscreenPageNumber]);

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
        const measuredRowWidth = canvasRowRef.current?.getBoundingClientRect().width ?? viewerWidth;
        const availableWidth = Math.max(220, measuredRowWidth - MANUAL_CANVAS_WIDTH_GUARD_PX);
        const targetWidth = isSinglePageMode
          ? Math.max(150, availableWidth - 2)
          : Math.max(150, (availableWidth - spreadGap - 4) / 2);

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

        if (!cancelled && renderCycleRef.current === renderCycle) {
          const leftHeight = Number.parseFloat(leftCanvas.style.height || '0') || 0;
          const rightHeight =
            visiblePages[1] && rightCanvas
              ? Number.parseFloat(rightCanvas.style.height || '0') || 0
              : 0;
          const nextRenderedHeight = Math.max(leftHeight, rightHeight);
          setRenderedCanvasHeight((current) => {
            if (Math.abs(current - nextRenderedHeight) < 1) {
              return current;
            }
            return nextRenderedHeight;
          });
          setHasRenderedAtLeastOnce(true);
        }
      } catch (error) {
        if (!cancelled && renderCycleRef.current === renderCycle) {
          if (!isExpectedRenderInterruption(error)) {
            setLoadError('Unable to render manual pages.');
          }
        }
      } finally {
        if (!cancelled && renderCycleRef.current === renderCycle) {
          setIsRendering(false);
          navLockRef.current = false;
        }
      }
    };

    void renderSpread();

    return () => {
      cancelled = true;
    };
  }, [isSinglePageMode, numPages, visiblePages, viewerWidth]);

  return (
    <div style={isCompactViewer ? manualViewerCompactStyle : manualViewerStyle}>
      <div
        ref={containerRef}
        style={resolvedCanvasAreaStyle}
        onMouseLeave={hideMagnifier}>
        <div ref={canvasRowRef} style={canvasRowStyle}>
          <canvas
            ref={leftCanvasRef}
            style={{...canvasStyle, cursor: isMagnifierEnabled ? 'none' : 'zoom-in'}}
            onMouseEnter={handleCanvasMouseEnter}
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={hideMagnifier}
            onClick={() => openFullscreenPage(visiblePages[0])}
          />
          <canvas
            ref={rightCanvasRef}
            style={
              visiblePages[1]
                ? {...canvasStyle, cursor: isMagnifierEnabled ? 'none' : 'zoom-in'}
                : hiddenCanvasStyle
            }
            onMouseEnter={handleCanvasMouseEnter}
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={hideMagnifier}
            onClick={
              visiblePages[1] ? () => openFullscreenPage(visiblePages[1] as number) : undefined
            }
          />
        </div>

        <div ref={lensRef} style={magnifierLensStyle} aria-hidden="true">
          <canvas ref={lensCanvasRef} style={magnifierLensCanvasStyle} />
        </div>

        {(isLoading || (isRendering && !hasRenderedAtLeastOnce)) && !loadError ? (
          <p style={statusTextStyle}>{isLoading ? 'Loading manual...' : 'Rendering pages...'}</p>
        ) : null}

        {loadError ? (
          <p style={errorTextStyle}>{loadError}</p>
        ) : null}
      </div>

      <div style={isCompactViewer ? controlsCompactStyle : controlsStyle}>
        <div style={isCompactViewer ? controlsEdgeCompactStyle : controlsEdgeStyle}>
          <button
            type="button"
            style={
              canGoPrev && canNavigate
                ? (isCompactViewer ? arrowButtonCompactStyle : arrowButtonStyle)
                : (isCompactViewer ? disabledArrowButtonCompactStyle : disabledArrowButtonStyle)
            }
            onClick={handlePrevClick}
            disabled={!canGoPrev || !canNavigate}>
            {isCompactViewer ? '←' : '← Previous'}
          </button>
        </div>

        <div style={isCompactViewer ? controlsCenterCompactStyle : controlsCenterStyle}>
          <p style={isCompactViewer ? pageInfoCompactStyle : pageInfoStyle}>
            {isCompactViewer ? compactPageLabel : pageLabel}
          </p>
          <button
            type="button"
            style={
              isMagnifierEnabled
                ? (isCompactViewer ? magnifierButtonActiveCompactStyle : magnifierButtonActiveStyle)
                : (isCompactViewer ? magnifierButtonCompactStyle : magnifierButtonStyle)
            }
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

        <div style={isCompactViewer ? controlsEdgeRightCompactStyle : controlsEdgeRightStyle}>
          <button
            type="button"
            style={
              canGoNext && canNavigate
                ? (isCompactViewer ? arrowButtonCompactStyle : arrowButtonStyle)
                : (isCompactViewer ? disabledArrowButtonCompactStyle : disabledArrowButtonStyle)
            }
            onClick={handleNextClick}
            disabled={!canGoNext || !canNavigate}>
            {isCompactViewer ? '→' : 'Next →'}
          </button>
        </div>
      </div>
      {fullscreenPageNumber ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Manual page ${fullscreenPageNumber} fullscreen view`}
          style={fullscreenOverlayStyle}>
          <div style={fullscreenFrameShellStyle}>
            <div ref={fullscreenViewportRef} style={fullscreenFrameStyle}>
              <div
                style={{
                  ...fullscreenPageSurfaceStyle,
                  width: `${Math.max(0, fullscreenSurfaceSize.width)}px`,
                  height: `${Math.max(0, fullscreenSurfaceSize.height)}px`,
                }}>
                <canvas ref={fullscreenCanvasRef} style={fullscreenCanvasStyle} />
                <div
                  ref={fullscreenTextLayerRef}
                  className="manual-fullscreen-text-layer"
                  style={fullscreenTextLayerStyle}
                />
              </div>
            </div>
            {fullscreenRenderError ? (
              <p style={fullscreenErrorStyle} aria-live="polite">
                {fullscreenRenderError}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={closeFullscreen}
            aria-label="Close fullscreen manual view"
            style={fullscreenCloseButtonStyle}>
            ×
          </button>
          <div style={fullscreenZoomDockStyle} aria-label="Fullscreen zoom controls">
            <button
              type="button"
              onClick={handleFullscreenPrev}
              disabled={!canFullscreenPrev}
              aria-label="Previous fullscreen manual page"
              className="fullscreen-manual-nav-btn"
              style={canFullscreenPrev ? fullscreenNavButtonStyle : fullscreenNavButtonDisabledStyle}>
              ←
            </button>
            <p style={fullscreenZoomLabelStyle}>Zoom</p>
            <input
              type="range"
              min={75}
              max={300}
              step={5}
              value={clampedFullscreenZoomPercent}
              onChange={(event) => {
                const nextZoom = Number.parseInt(event.currentTarget.value, 10);
                if (Number.isNaN(nextZoom)) {
                  return;
                }
                setFullscreenZoomPercent(nextZoom);
              }}
              style={fullscreenZoomSliderStyle}
            />
            <p style={fullscreenZoomValueStyle}>{clampedFullscreenZoomPercent}%</p>
            <button
              type="button"
              onClick={handleFullscreenNext}
              disabled={!canFullscreenNext}
              aria-label="Next fullscreen manual page"
              className="fullscreen-manual-nav-btn"
              style={canFullscreenNext ? fullscreenNavButtonStyle : fullscreenNavButtonDisabledStyle}>
              →
            </button>
          </div>
        </div>
      ) : null}
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
