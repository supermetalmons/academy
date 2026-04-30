import {useEffect, useMemo, useRef, useState} from 'react';
import type {CSSProperties, PointerEvent as ReactPointerEvent, ReactNode} from 'react';
import BlankSectionPage from '@site/src/components/BlankSectionPage';
import ResourcesSubnav from '@site/src/components/ResourcesSubnav';
import {otherPicsImages, selectedMemesImages} from '@site/src/data/resourcesGalleryImages';

const GALLERY_MIN_TILE_WIDTH_PX = 140;
const GALLERY_GRID_GAP_PX = 9;
const GALLERY_ROWS_PER_PAGE = 3;
const DEFAULT_GALLERY_COLUMNS = 4;
const GALLERY_IMAGE_ORDER_STORAGE_KEY = 'mons-academy-gallery-image-order-v1';
const GALLERY_EDGE_PAGE_FLIP_DELAY_MS = 1000;

const galleryWrapStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  padding: '15px 0',
};

const sectionStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const sectionTitleStyle: CSSProperties = {
  margin: 0,
};

const sectionToggleStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  border: 'none',
  backgroundColor: 'transparent',
  padding: 0,
  cursor: 'pointer',
  color: '#000',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  lineHeight: 'inherit',
  textAlign: 'left',
};

const sectionIconSlotStyle: CSSProperties = {
  width: '0.95em',
  height: '0.82em',
  display: 'inline-block',
  position: 'relative',
  transform: 'translateY(-0.02em)',
};

const sectionIconLayerStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  transition: 'opacity 180ms ease, transform 220ms ease',
};

const arrowIconStyle: CSSProperties = {
  fontSize: '0.98em',
  lineHeight: 1,
  display: 'block',
};

const folderIconStyle: CSSProperties = {
  width: '0.9em',
  height: '0.72em',
  display: 'block',
};

const sectionTitleTextStyle: CSSProperties = {
  fontSize: '1.05rem',
  lineHeight: 1.2,
  fontWeight: 700,
};

const imageGridStyle: CSSProperties = {
  display: 'grid',
  gap: `${GALLERY_GRID_GAP_PX}px`,
};

const imageLinkStyle: CSSProperties = {
  display: 'block',
  border: '1px solid #000',
  backgroundColor: '#fff',
  textDecoration: 'none',
  overflow: 'hidden',
  lineHeight: 0,
  padding: 0,
  cursor: 'pointer',
  transition: 'transform 190ms ease, box-shadow 190ms ease, filter 190ms ease',
  transform: 'scale(1)',
  transformOrigin: 'center',
  touchAction: 'none',
  userSelect: 'none',
};

const imageLinkHoverStyle: CSSProperties = {
  transform: 'scale(1.035)',
  filter: 'brightness(1.03)',
};

const imageLinkDraggingStyle: CSSProperties = {
  opacity: 0.46,
  transform: 'scale(0.96)',
  filter: 'brightness(0.98) saturate(0.86)',
};

const imageStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  aspectRatio: '1 / 1',
  objectFit: 'cover',
  objectPosition: 'center',
  imageRendering: 'auto',
  filter: 'saturate(1.02) contrast(0.99)',
  transform: 'translateZ(0)',
  backfaceVisibility: 'hidden',
  pointerEvents: 'none',
};

const dragPreviewStyle: CSSProperties = {
  position: 'fixed',
  left: 0,
  top: 0,
  zIndex: 13000,
  border: '1px solid #000',
  backgroundColor: '#fff',
  boxShadow: '0 14px 28px rgba(0, 0, 0, 0.24)',
  lineHeight: 0,
  pointerEvents: 'none',
  overflow: 'hidden',
  transform: 'translate(-50%, -50%) scale(1.035)',
  opacity: 0.92,
};

const imagePlaceholderStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  aspectRatio: '1 / 1',
  visibility: 'hidden',
  pointerEvents: 'none',
};

const paginationRowStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  marginTop: '0.52rem',
};

const paginationButtonStyle: CSSProperties = {
  border: 'none',
  backgroundColor: 'transparent',
  color: '#000',
  lineHeight: 1,
  fontSize: '1.22rem',
  cursor: 'pointer',
  padding: '0 0.12rem',
  width: '1.8rem',
  height: '1.8rem',
  borderRadius: '999px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background-color 140ms ease, transform 150ms ease, opacity 150ms ease',
};

const paginationButtonDisabledStyle: CSSProperties = {
  opacity: 0.42,
  cursor: 'default',
};

const paginationButtonHoverStyle: CSSProperties = {
  backgroundColor: 'rgba(0, 0, 0, 0.11)',
};

const paginationArrowGlyphStyle: CSSProperties = {
  display: 'inline-block',
  transform: 'translateY(-2px)',
};

const paginationLabelStyle: CSSProperties = {
  fontSize: '0.86rem',
  color: '#333',
  minWidth: '4.5rem',
  textAlign: 'center',
};

const previewOverlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.04)',
  backdropFilter: 'blur(7px)',
  WebkitBackdropFilter: 'blur(7px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2.2rem 1.4rem',
  zIndex: 12050,
};

const previewPanelShellStyle: CSSProperties = {
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transformStyle: 'preserve-3d',
  transition: 'transform 130ms ease-out',
  willChange: 'transform',
};

const previewTiltRegionStyle: CSSProperties = {
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '15px',
};

const previewPanelStyle: CSSProperties = {
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 'fit-content',
  height: 'fit-content',
  maxWidth: '92vw',
  maxHeight: '90vh',
  backgroundColor: 'rgba(255, 255, 255, 0.7)',
  border: '1px solid rgba(0, 0, 0, 0.18)',
  borderRadius: '14px',
  padding: '0.92rem',
  boxSizing: 'border-box',
  boxShadow: 'none',
  overflow: 'hidden',
};

const previewImageStyle: CSSProperties = {
  maxWidth: 'min(84vw, 1180px)',
  maxHeight: 'min(78vh, 780px)',
  width: 'auto',
  height: 'auto',
  objectFit: 'contain',
  objectPosition: 'center',
  imageRendering: 'auto',
  backgroundColor: 'transparent',
  borderRadius: '9px',
};

const previewArrowButtonStyle: CSSProperties = {
  position: 'fixed',
  top: '50%',
  zIndex: 1,
  width: 'clamp(2.35rem, 6vw, 3.35rem)',
  height: 'clamp(2.35rem, 6vw, 3.35rem)',
  border: 'none',
  borderRadius: '999px',
  backgroundColor: 'transparent',
  color: '#000',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: 1,
  padding: 0,
  transform: 'translateY(-50%)',
  userSelect: 'none',
};

const previewArrowVisualStyle: CSSProperties = {
  width: 'clamp(1.72rem, 4.6vw, 2.36rem)',
  height: 'clamp(1.72rem, 4.6vw, 2.36rem)',
  border: '1px solid rgba(0, 0, 0, 0.22)',
  borderRadius: '999px',
  backgroundColor: 'rgba(255, 255, 255, 0.78)',
  boxShadow: '0 5px 14px rgba(0, 0, 0, 0.11)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background-color 150ms ease, transform 150ms ease',
};

const previewArrowGlyphStyle: CSSProperties = {
  display: 'inline-block',
  fontSize: 'clamp(1.08rem, 3vw, 1.52rem)',
  lineHeight: 1,
  transform: 'translateY(-2px)',
};

const gallerySectionsBase = [
  {id: 'selected-memes', title: 'Selected memes/edits', images: selectedMemesImages},
  {id: 'other-pics', title: 'Other pics', images: otherPicsImages},
] as const;

type GalleryDragSession = {
  sectionId: string;
  src: string;
  startX: number;
  startY: number;
  tileWidth: number;
  tileHeight: number;
  hasDragged: boolean;
};

type GalleryDragPreview = {
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type GalleryOrderWindow = Window & {
  __monsAcademyGalleryImageOrder?: Record<string, string[]>;
  __monsAcademyGalleryImageOrderStorageKey?: string;
};

const galleryImageElementCache: Record<string, HTMLImageElement> = {};
const galleryImagePromiseCache = new Map<string, Promise<void>>();
const galleryImageLoadedCache = new Set<string>();

function getColumnCount(widthPx: number): number {
  const raw = Math.floor((widthPx + GALLERY_GRID_GAP_PX) / (GALLERY_MIN_TILE_WIDTH_PX + GALLERY_GRID_GAP_PX));
  return Math.max(2, raw);
}

function getDefaultGalleryImageOrder(): Record<string, string[]> {
  return Object.fromEntries(
    gallerySectionsBase.map((section) => [section.id, Array.from(section.images)]),
  );
}

function normalizeGalleryImageOrder(rawOrder: unknown): Record<string, string[]> {
  const orderRecord =
    rawOrder !== null && typeof rawOrder === 'object'
      ? (rawOrder as Record<string, unknown>)
      : {};
  const nextOrder: Record<string, string[]> = {};
  gallerySectionsBase.forEach((section) => {
    const defaultImages = Array.from(section.images);
    const defaultImageSet = new Set(defaultImages);
    const savedImages = Array.isArray(orderRecord[section.id])
      ? (orderRecord[section.id] as unknown[])
      : [];
    const seen = new Set<string>();
    const validSavedImages = savedImages.filter((image): image is string => {
      if (
        typeof image !== 'string' ||
        !defaultImageSet.has(image) ||
        seen.has(image)
      ) {
        return false;
      }
      seen.add(image);
      return true;
    });
    nextOrder[section.id] = [
      ...validSavedImages,
      ...defaultImages.filter((image) => !seen.has(image)),
    ];
  });
  return nextOrder;
}

function readGalleryImageOrderFromStorage(): Record<string, string[]> {
  if (typeof window === 'undefined') {
    return getDefaultGalleryImageOrder();
  }
  try {
    return normalizeGalleryImageOrder(
      JSON.parse(window.localStorage.getItem(GALLERY_IMAGE_ORDER_STORAGE_KEY) ?? 'null'),
    );
  } catch {
    return getDefaultGalleryImageOrder();
  }
}

function writeGalleryImageOrderToStorage(nextOrder: Record<string, string[]>): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(
      GALLERY_IMAGE_ORDER_STORAGE_KEY,
      JSON.stringify(normalizeGalleryImageOrder(nextOrder)),
    );
  } catch {
    // Ignore storage write issues.
  }
}

export default function ResourcesGalleryPage(): ReactNode {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [sectionColumnsById, setSectionColumnsById] = useState<Record<string, number>>({});
  const [sectionPageById, setSectionPageById] = useState<Record<string, number>>({});
  const [orderedImagesBySectionId, setOrderedImagesBySectionId] = useState<Record<string, string[]>>(
    () => getDefaultGalleryImageOrder(),
  );
  const [hoveredImageSrc, setHoveredImageSrc] = useState<string | null>(null);
  const [hoveredPaginationButton, setHoveredPaginationButton] = useState<string | null>(null);
  const [hoveredPreviewArrow, setHoveredPreviewArrow] = useState<'next' | 'previous' | null>(null);
  const [previewImageSrc, setPreviewImageSrc] = useState<string | null>(null);
  const [previewTilt, setPreviewTilt] = useState({rotateX: 0, rotateY: 0});
  const [dragPreview, setDragPreview] = useState<GalleryDragPreview | null>(null);
  const [draggedImageSrc, setDraggedImageSrc] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const pageGridRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const previousPageByIdRef = useRef<Record<string, number>>({});
  const requestedPageByIdRef = useRef<Record<string, number>>({});
  const orderedImagesBySectionIdRef = useRef(orderedImagesBySectionId);
  const sectionColumnsByIdRef = useRef(sectionColumnsById);
  const sectionPageByIdRef = useRef(sectionPageById);
  const dragSessionRef = useRef<GalleryDragSession | null>(null);
  const lastDragPointerRef = useRef<{x: number; y: number} | null>(null);
  const edgePageFlipTimeoutRef = useRef<number | null>(null);
  const edgePageFlipHoldRef = useRef<{sectionId: string; direction: -1 | 1} | null>(null);
  const suppressNextClickRef = useRef(false);

  const gallerySections = useMemo(
    () =>
      gallerySectionsBase.map((section) => ({
        ...section,
        images: orderedImagesBySectionId[section.id] ?? Array.from(section.images),
      })),
    [orderedImagesBySectionId],
  );

  const allGalleryImages = useMemo(
    () => gallerySections.flatMap((section) => section.images),
    [gallerySections],
  );

  const previewGalleryContext = useMemo(() => {
    if (!previewImageSrc) {
      return null;
    }
    for (const section of gallerySections) {
      const index = section.images.indexOf(previewImageSrc);
      if (index >= 0) {
        return {section, index};
      }
    }
    return null;
  }, [gallerySections, previewImageSrc]);

  const previewGalleryImageCount = previewGalleryContext?.section.images.length ?? 0;
  const previousPreviewImageSrc =
    previewGalleryContext && previewGalleryImageCount > 1
      ? previewGalleryContext.section.images[
          (previewGalleryContext.index - 1 + previewGalleryImageCount) % previewGalleryImageCount
        ] ?? null
      : null;
  const nextPreviewImageSrc =
    previewGalleryContext && previewGalleryImageCount > 1
      ? previewGalleryContext.section.images[
          (previewGalleryContext.index + 1) % previewGalleryImageCount
        ] ?? null
      : null;

  const showPreviewImage = (src: string): void => {
    setPreviewTilt({rotateX: 0, rotateY: 0});
    setPreviewImageSrc(src);
    void preloadImage(src, 'high');
  };

  const toggleSection = (sectionId: string): void => {
    setCollapsedSections((prev) => ({...prev, [sectionId]: !prev[sectionId]}));
  };

  const getSectionImages = (sectionId: string): string[] => {
    const savedImages = orderedImagesBySectionIdRef.current[sectionId];
    if (savedImages) {
      return savedImages;
    }
    const baseSection = gallerySectionsBase.find((section) => section.id === sectionId);
    return baseSection ? Array.from(baseSection.images) : [];
  };

  const getSectionPageSize = (sectionId: string): number => {
    const columns = sectionColumnsByIdRef.current[sectionId] ?? DEFAULT_GALLERY_COLUMNS;
    return Math.max(1, columns * GALLERY_ROWS_PER_PAGE);
  };

  const clearEdgePageFlipTimer = (): void => {
    if (edgePageFlipTimeoutRef.current !== null && typeof window !== 'undefined') {
      window.clearTimeout(edgePageFlipTimeoutRef.current);
    }
    edgePageFlipTimeoutRef.current = null;
    edgePageFlipHoldRef.current = null;
  };

  const getDropIndexForPointer = (sectionId: string, x: number, y: number): number | null => {
    const grid = pageGridRefs.current[sectionId];
    if (!grid) {
      return null;
    }
    const rect = grid.getBoundingClientRect();
    const verticalAllowance = Math.max(36, rect.height * 0.18);
    if (y < rect.top - verticalAllowance || y > rect.bottom + verticalAllowance) {
      return null;
    }

    const images = getSectionImages(sectionId);
    const pageSize = getSectionPageSize(sectionId);
    const totalPages = Math.max(1, Math.ceil(images.length / pageSize));
    const currentPage = Math.min(sectionPageByIdRef.current[sectionId] ?? 0, totalPages - 1);
    const startIndex = currentPage * pageSize;
    const pageEndIndex = Math.min(images.length, startIndex + pageSize);
    if (x < rect.left) {
      return startIndex;
    }
    if (x > rect.right) {
      return pageEndIndex;
    }

    const columns = sectionColumnsByIdRef.current[sectionId] ?? DEFAULT_GALLERY_COLUMNS;
    const columnWidth = Math.max(1, (rect.width - GALLERY_GRID_GAP_PX * (columns - 1)) / columns);
    const rowHeight = Math.max(1, (rect.height - GALLERY_GRID_GAP_PX * (GALLERY_ROWS_PER_PAGE - 1)) / GALLERY_ROWS_PER_PAGE);
    const relativeX = Math.min(Math.max(x - rect.left, 0), Math.max(0, rect.width - 1));
    const relativeY = Math.min(Math.max(y - rect.top, 0), Math.max(0, rect.height - 1));
    const columnPitch = columnWidth + GALLERY_GRID_GAP_PX;
    const rowPitch = rowHeight + GALLERY_GRID_GAP_PX;
    const column = Math.min(columns - 1, Math.max(0, Math.floor(relativeX / columnPitch)));
    const row = Math.min(GALLERY_ROWS_PER_PAGE - 1, Math.max(0, Math.floor(relativeY / rowPitch)));
    const withinColumnX = relativeX - column * columnPitch;
    const shouldInsertAfterCell = withinColumnX > columnWidth / 2;
    const pageIndex = Math.min(pageSize, row * columns + column + (shouldInsertAfterCell ? 1 : 0));
    return Math.min(images.length, startIndex + pageIndex);
  };

  const moveImageInSection = (sectionId: string, src: string, targetIndex: number): void => {
    const currentOrder = orderedImagesBySectionIdRef.current;
    const currentImages = currentOrder[sectionId] ?? getSectionImages(sectionId);
    const sourceIndex = currentImages.indexOf(src);
    if (sourceIndex < 0) {
      return;
    }
    const withoutDraggedImage = currentImages.filter((image) => image !== src);
    const adjustedTargetIndex = Math.min(
      withoutDraggedImage.length,
      Math.max(0, sourceIndex < targetIndex ? targetIndex - 1 : targetIndex),
    );
    if (sourceIndex === adjustedTargetIndex) {
      return;
    }
    const nextImages = Array.from(withoutDraggedImage);
    nextImages.splice(adjustedTargetIndex, 0, src);
    const nextOrder = normalizeGalleryImageOrder({
      ...currentOrder,
      [sectionId]: nextImages,
    });
    orderedImagesBySectionIdRef.current = nextOrder;
    writeGalleryImageOrderToStorage(nextOrder);
    setOrderedImagesBySectionId(nextOrder);
  };

  const scheduleEdgePageFlip = (sectionId: string, direction: -1 | 1): void => {
    const currentHold = edgePageFlipHoldRef.current;
    if (
      edgePageFlipTimeoutRef.current !== null &&
      currentHold?.sectionId === sectionId &&
      currentHold.direction === direction
    ) {
      return;
    }
    clearEdgePageFlipTimer();
    edgePageFlipHoldRef.current = {sectionId, direction};
    edgePageFlipTimeoutRef.current = window.setTimeout(() => {
      edgePageFlipTimeoutRef.current = null;
      edgePageFlipHoldRef.current = null;
      const session = dragSessionRef.current;
      const pointer = lastDragPointerRef.current;
      if (!session || session.sectionId !== sectionId || !pointer) {
        return;
      }
      const images = getSectionImages(sectionId);
      const pageSize = getSectionPageSize(sectionId);
      const totalPages = Math.max(1, Math.ceil(images.length / pageSize));
      const currentPage = Math.min(sectionPageByIdRef.current[sectionId] ?? 0, totalPages - 1);
      const targetPage = currentPage + direction;
      if (targetPage < 0 || targetPage >= totalPages) {
        return;
      }
      handlePageChange(sectionId, targetPage, getImagesForPage(images, targetPage, pageSize));
      const targetStartIndex = targetPage * pageSize;
      const targetEndIndex = Math.min(images.length, targetStartIndex + pageSize);
      moveImageInSection(
        sectionId,
        session.src,
        direction < 0 ? targetStartIndex : targetEndIndex,
      );
      updateEdgePageFlipHold(sectionId, pointer.x, pointer.y);
    }, GALLERY_EDGE_PAGE_FLIP_DELAY_MS);
  };

  const updateEdgePageFlipHold = (sectionId: string, x: number, y: number): void => {
    const grid = pageGridRefs.current[sectionId];
    if (!grid) {
      clearEdgePageFlipTimer();
      return;
    }
    const rect = grid.getBoundingClientRect();
    const verticalAllowance = Math.max(36, rect.height * 0.18);
    if (y < rect.top - verticalAllowance || y > rect.bottom + verticalAllowance) {
      clearEdgePageFlipTimer();
      return;
    }
    const direction = x < rect.left ? -1 : x > rect.right ? 1 : null;
    if (!direction) {
      clearEdgePageFlipTimer();
      return;
    }
    const images = getSectionImages(sectionId);
    const pageSize = getSectionPageSize(sectionId);
    const totalPages = Math.max(1, Math.ceil(images.length / pageSize));
    const currentPage = Math.min(sectionPageByIdRef.current[sectionId] ?? 0, totalPages - 1);
    const targetPage = currentPage + direction;
    if (targetPage < 0 || targetPage >= totalPages) {
      clearEdgePageFlipTimer();
      return;
    }
    scheduleEdgePageFlip(sectionId, direction);
  };

  const handleImagePointerDown = (
    event: ReactPointerEvent<HTMLButtonElement>,
    sectionId: string,
    src: string,
  ): void => {
    if (event.button !== 0 || previewImageSrc) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    dragSessionRef.current = {
      sectionId,
      src,
      startX: event.clientX,
      startY: event.clientY,
      tileWidth: rect.width,
      tileHeight: rect.height,
      hasDragged: false,
    };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture can fail if the browser already released the pointer.
    }
  };

  useEffect(() => {
    const savedOrder = readGalleryImageOrderFromStorage();
    orderedImagesBySectionIdRef.current = savedOrder;
    setOrderedImagesBySectionId(savedOrder);
  }, []);

  useEffect(() => {
    orderedImagesBySectionIdRef.current = orderedImagesBySectionId;
    if (typeof window !== 'undefined') {
      const galleryWindow = window as GalleryOrderWindow;
      galleryWindow.__monsAcademyGalleryImageOrder = orderedImagesBySectionId;
      galleryWindow.__monsAcademyGalleryImageOrderStorageKey = GALLERY_IMAGE_ORDER_STORAGE_KEY;
    }
  }, [orderedImagesBySectionId]);

  useEffect(() => {
    sectionColumnsByIdRef.current = sectionColumnsById;
  }, [sectionColumnsById]);

  useEffect(() => {
    sectionPageByIdRef.current = sectionPageById;
  }, [sectionPageById]);

  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const observer = new ResizeObserver((entries) => {
      setSectionColumnsById((prev) => {
        let didChange = false;
        let next = prev;
        entries.forEach((entry) => {
          const sectionId = (entry.target as HTMLElement).dataset.sectionId;
          if (!sectionId) {
            return;
          }
          const nextColumns = getColumnCount(entry.contentRect.width);
          if (prev[sectionId] !== nextColumns) {
            if (!didChange) {
              next = {...prev};
            }
            next[sectionId] = nextColumns;
            didChange = true;
          }
        });
        return didChange ? next : prev;
      });
    });
    gallerySectionsBase.forEach((section) => {
      const node = sectionRefs.current[section.id];
      if (node) {
        observer.observe(node);
      }
    });
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    setSectionPageById((prev) => {
      let didChange = false;
      let next = prev;
      gallerySections.forEach((section) => {
        const columns = sectionColumnsById[section.id] ?? DEFAULT_GALLERY_COLUMNS;
        const pageSize = Math.max(1, columns * GALLERY_ROWS_PER_PAGE);
        const totalPages = Math.max(1, Math.ceil(section.images.length / pageSize));
        const currentPage = prev[section.id] ?? 0;
        const clampedPage = Math.min(currentPage, totalPages - 1);
        if (clampedPage !== currentPage) {
          if (!didChange) {
            next = {...prev};
          }
          next[section.id] = clampedPage;
          didChange = true;
        }
      });
      return didChange ? next : prev;
    });
  }, [gallerySections, sectionColumnsById]);

  const preloadImage = (src: string, priority: 'high' | 'auto' | 'low' = 'auto'): Promise<void> => {
    if (galleryImageLoadedCache.has(src)) {
      return Promise.resolve();
    }
    const existing = galleryImagePromiseCache.get(src);
    if (existing) {
      return existing;
    }
    const image = galleryImageElementCache[src] ?? new Image();
    galleryImageElementCache[src] = image;
    image.decoding = 'async';
    image.loading = 'eager';
    (image as HTMLImageElement & {fetchPriority?: 'high' | 'low' | 'auto'}).fetchPriority = priority;
    const promise = new Promise<void>((resolve) => {
      image.onload = () => {
        galleryImageLoadedCache.add(src);
        resolve();
      };
      image.onerror = () => {
        resolve();
      };
      image.src = src;
      if (image.complete) {
        galleryImageLoadedCache.add(src);
        resolve();
      }
    }).finally(() => {
      if (galleryImageLoadedCache.has(src)) {
        galleryImagePromiseCache.delete(src);
      }
    });
    galleryImagePromiseCache.set(src, promise);
    return promise;
  };

  const preloadImages = (images: readonly string[], priority: 'high' | 'auto' | 'low' = 'auto'): Promise<void> => {
    const uniqueImages = [...new Set(images)];
    if (!uniqueImages.length) {
      return Promise.resolve();
    }
    const concurrency = Math.min(8, uniqueImages.length);
    let index = 0;
    const workers = Array.from({length: concurrency}, async () => {
      while (index < uniqueImages.length) {
        const currentIndex = index;
        index += 1;
        const src = uniqueImages[currentIndex];
        if (src) {
          await preloadImage(src, priority);
        }
      }
    });
    return Promise.all(workers).then(() => undefined);
  };

  const getImagesForPage = (
    images: readonly string[],
    page: number,
    pageSize: number,
  ): readonly string[] => {
    const start = page * pageSize;
    return images.slice(start, start + pageSize);
  };

  const handlePageChange = (sectionId: string, targetPage: number, targetImages: readonly string[]): void => {
    requestedPageByIdRef.current[sectionId] = targetPage;
    void preloadImages(targetImages, 'high').then(() => {
      if (requestedPageByIdRef.current[sectionId] !== targetPage) {
        return;
      }
      setSectionPageById((prev) => {
        const currentPage = prev[sectionId] ?? 0;
        if (currentPage === targetPage) {
          return prev;
        }
        const next = {...prev, [sectionId]: targetPage};
        sectionPageByIdRef.current = next;
        return next;
      });
    });
  };

  useEffect(() => {
    const initialPageSize = DEFAULT_GALLERY_COLUMNS * GALLERY_ROWS_PER_PAGE;
    const initialVisibleImages = gallerySections.flatMap((section) => section.images.slice(0, initialPageSize));
    void preloadImages(initialVisibleImages, 'high').then(() => {
      void preloadImages(allGalleryImages, 'low');
    });
  }, [allGalleryImages, gallerySections]);

  useEffect(() => {
    const adjacentPreviewImages = [previousPreviewImageSrc, nextPreviewImageSrc].filter(
      (src): src is string => Boolean(src),
    );
    if (adjacentPreviewImages.length > 0) {
      void preloadImages(adjacentPreviewImages, 'high');
    }
  }, [nextPreviewImageSrc, previousPreviewImageSrc]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent): void => {
      const session = dragSessionRef.current;
      if (!session) {
        return;
      }
      const movedDistance = Math.hypot(event.clientX - session.startX, event.clientY - session.startY);
      if (!session.hasDragged && movedDistance < 6) {
        return;
      }
      event.preventDefault();
      lastDragPointerRef.current = {x: event.clientX, y: event.clientY};
      if (!session.hasDragged) {
        session.hasDragged = true;
        suppressNextClickRef.current = true;
        setDraggedImageSrc(session.src);
      }
      setDragPreview({
        src: session.src,
        x: event.clientX,
        y: event.clientY,
        width: session.tileWidth,
        height: session.tileHeight,
      });
      const dropIndex = getDropIndexForPointer(session.sectionId, event.clientX, event.clientY);
      if (dropIndex !== null) {
        moveImageInSection(session.sectionId, session.src, dropIndex);
      }
      updateEdgePageFlipHold(session.sectionId, event.clientX, event.clientY);
    };

    const handlePointerEnd = (event: PointerEvent): void => {
      const session = dragSessionRef.current;
      if (!session) {
        return;
      }
      if (session.hasDragged) {
        event.preventDefault();
        const dropIndex = getDropIndexForPointer(session.sectionId, event.clientX, event.clientY);
        if (dropIndex !== null) {
          moveImageInSection(session.sectionId, session.src, dropIndex);
        }
        suppressNextClickRef.current = true;
        window.setTimeout(() => {
          suppressNextClickRef.current = false;
        }, 80);
      }
      clearEdgePageFlipTimer();
      dragSessionRef.current = null;
      lastDragPointerRef.current = null;
      setDragPreview(null);
      setDraggedImageSrc(null);
    };

    window.addEventListener('pointermove', handlePointerMove, {passive: false});
    window.addEventListener('pointerup', handlePointerEnd, {passive: false});
    window.addEventListener('pointercancel', handlePointerEnd, {passive: false});
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerEnd);
      window.removeEventListener('pointercancel', handlePointerEnd);
      clearEdgePageFlipTimer();
    };
  }, []);

  useEffect(() => {
    if (!previewImageSrc) {
      setPreviewTilt({rotateX: 0, rotateY: 0});
      return undefined;
    }
    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setPreviewImageSrc(null);
        return;
      }
      if (event.key === 'ArrowLeft' && previousPreviewImageSrc) {
        event.preventDefault();
        showPreviewImage(previousPreviewImageSrc);
        return;
      }
      if (event.key === 'ArrowRight' && nextPreviewImageSrc) {
        event.preventDefault();
        showPreviewImage(nextPreviewImageSrc);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [nextPreviewImageSrc, previewImageSrc, previousPreviewImageSrc]);

  useEffect(() => {
    gallerySections.forEach((section) => {
      const currentPage = sectionPageById[section.id] ?? 0;
      const previousPage = previousPageByIdRef.current[section.id] ?? 0;
      if (currentPage === previousPage) {
        return;
      }
      const direction = currentPage > previousPage ? 1 : -1;
      const node = pageGridRefs.current[section.id];
      if (node && typeof node.animate === 'function') {
        node.animate(
          [
            {
              opacity: 0.78,
              transform: `translateX(${direction * 16}px)`,
            },
            {
              opacity: 1,
              transform: 'translateX(0)',
            },
          ],
          {
            duration: 210,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          },
        );
      }
      previousPageByIdRef.current[section.id] = currentPage;
    });
  }, [sectionPageById]);

  return (
    <BlankSectionPage title="Resources">
      <ResourcesSubnav active="gallery" />
      <div style={galleryWrapStyle}>
        {gallerySections.map((section) => {
          const isCollapsed = Boolean(collapsedSections[section.id]);
          const columns = sectionColumnsById[section.id] ?? DEFAULT_GALLERY_COLUMNS;
          const pageSize = Math.max(1, columns * GALLERY_ROWS_PER_PAGE);
          const totalPages = Math.max(1, Math.ceil(section.images.length / pageSize));
          const currentPage = Math.min(sectionPageById[section.id] ?? 0, totalPages - 1);
          const startIndex = currentPage * pageSize;
          const pageImages = section.images.slice(startIndex, startIndex + pageSize);
          const placeholderCount = Math.max(0, pageSize - pageImages.length);
          const canGoPrevious = currentPage > 0;
          const canGoNext = currentPage < totalPages - 1;
          const previousPageImages = canGoPrevious
            ? getImagesForPage(section.images, currentPage - 1, pageSize)
            : [];
          const nextPageImages = canGoNext
            ? getImagesForPage(section.images, currentPage + 1, pageSize)
            : [];
          const previousButtonKey = `${section.id}-prev`;
          const nextButtonKey = `${section.id}-next`;
          return (
            <section
              key={section.title}
              style={sectionStyle}
              data-section-id={section.id}
              ref={(node) => {
                sectionRefs.current[section.id] = node;
              }}>
            <h3 style={sectionTitleStyle}>
              <button type="button" onClick={() => toggleSection(section.id)} style={sectionToggleStyle}>
                <span style={sectionIconSlotStyle} aria-hidden="true">
                  <span
                    style={{
                      ...sectionIconLayerStyle,
                      opacity: isCollapsed ? 0 : 1,
                      transform: isCollapsed ? 'scale(0.72) translateY(-0.12em)' : 'scale(1) translateY(0)',
                    }}>
                    <span style={arrowIconStyle}>▾</span>
                  </span>
                  <span
                    style={{
                      ...sectionIconLayerStyle,
                      opacity: isCollapsed ? 1 : 0,
                      transform: isCollapsed ? 'scale(1) translateY(0)' : 'scale(0.74) translateY(0.12em)',
                    }}>
                    <svg viewBox="0 0 24 18" style={folderIconStyle} fill="currentColor">
                      <path d="M1 3.5C1 2.12 2.12 1 3.5 1h5.3l1.8 2.2H20.5C21.88 3.2 23 4.32 23 5.7v8.8c0 1.38-1.12 2.5-2.5 2.5h-17C2.12 17 1 15.88 1 14.5V3.5Z" />
                    </svg>
                  </span>
                </span>
                <span style={sectionTitleTextStyle}>{section.title}:</span>
              </button>
            </h3>
            {!isCollapsed ? (
              <>
                <div
                  ref={(node) => {
                    pageGridRefs.current[section.id] = node;
                  }}
                  style={{
                    ...imageGridStyle,
                    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                  }}>
                {pageImages.map((src, index) => (
                  <button
                    key={src}
                    type="button"
                    style={{
                      ...imageLinkStyle,
                      ...(hoveredImageSrc === src ? imageLinkHoverStyle : undefined),
                      ...(draggedImageSrc === src ? imageLinkDraggingStyle : undefined),
                    }}
                    aria-label={`${section.title} image ${startIndex + index + 1}`}
                    onMouseEnter={() => setHoveredImageSrc(src)}
                    onMouseLeave={() => setHoveredImageSrc((prev) => (prev === src ? null : prev))}
                    onFocus={() => setHoveredImageSrc(src)}
                    onBlur={() => setHoveredImageSrc((prev) => (prev === src ? null : prev))}
                    onPointerDown={(event) => handleImagePointerDown(event, section.id, src)}
                    onClick={() => {
                      if (suppressNextClickRef.current) {
                        suppressNextClickRef.current = false;
                        return;
                      }
                      showPreviewImage(src);
                    }}>
                    <img
                      src={src}
                      alt={`${section.title} image ${startIndex + index + 1}`}
                      loading="eager"
                      decoding="async"
                      fetchPriority="high"
                      style={imageStyle}
                      draggable={false}
                    />
                  </button>
                ))}
                {Array.from({length: placeholderCount}).map((_, placeholderIndex) => (
                  <span
                    key={`placeholder-${section.id}-${currentPage}-${placeholderIndex}`}
                    style={imagePlaceholderStyle}
                    aria-hidden="true"
                  />
                ))}
                </div>
                {totalPages > 1 ? (
                  <div style={paginationRowStyle}>
                    <button
                      type="button"
                      onClick={() => handlePageChange(section.id, currentPage - 1, previousPageImages)}
                      disabled={!canGoPrevious}
                      aria-label={`Previous ${section.title} page`}
                      onMouseEnter={() => setHoveredPaginationButton(previousButtonKey)}
                      onMouseLeave={() => setHoveredPaginationButton((prev) => (prev === previousButtonKey ? null : prev))}
                      onFocus={() => setHoveredPaginationButton(previousButtonKey)}
                      onBlur={() => setHoveredPaginationButton((prev) => (prev === previousButtonKey ? null : prev))}
                      style={{
                        ...paginationButtonStyle,
                        ...(canGoPrevious && hoveredPaginationButton === previousButtonKey ? paginationButtonHoverStyle : undefined),
                        ...(canGoPrevious ? undefined : paginationButtonDisabledStyle),
                      }}>
                      <span style={paginationArrowGlyphStyle}>←</span>
                    </button>
                    <span style={paginationLabelStyle}>
                      {currentPage + 1} / {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => handlePageChange(section.id, currentPage + 1, nextPageImages)}
                      disabled={!canGoNext}
                      aria-label={`Next ${section.title} page`}
                      onMouseEnter={() => setHoveredPaginationButton(nextButtonKey)}
                      onMouseLeave={() => setHoveredPaginationButton((prev) => (prev === nextButtonKey ? null : prev))}
                      onFocus={() => setHoveredPaginationButton(nextButtonKey)}
                      onBlur={() => setHoveredPaginationButton((prev) => (prev === nextButtonKey ? null : prev))}
                      style={{
                        ...paginationButtonStyle,
                        ...(canGoNext && hoveredPaginationButton === nextButtonKey ? paginationButtonHoverStyle : undefined),
                        ...(canGoNext ? undefined : paginationButtonDisabledStyle),
                      }}>
                      <span style={paginationArrowGlyphStyle}>→</span>
                    </button>
                  </div>
                ) : null}
              </>
            ) : null}
            </section>
          );
        })}
      </div>
      {dragPreview ? (
        <span
          style={{
            ...dragPreviewStyle,
            width: dragPreview.width,
            height: dragPreview.height,
            transform: `translate(${dragPreview.x}px, ${dragPreview.y}px) translate(-50%, -50%) scale(1.035)`,
          }}
          aria-hidden="true">
          <img src={dragPreview.src} alt="" style={imageStyle} draggable={false} />
        </span>
      ) : null}
      {previewImageSrc ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Gallery image preview"
          style={previewOverlayStyle}
          onClick={() => setPreviewImageSrc(null)}>
          {previousPreviewImageSrc ? (
            <button
              type="button"
              aria-label={`Previous ${previewGalleryContext?.section.title ?? 'gallery'} image`}
              style={{...previewArrowButtonStyle, left: 'clamp(0.7rem, 4vw, 3rem)'}}
              onMouseEnter={() => setHoveredPreviewArrow('previous')}
              onMouseLeave={() => setHoveredPreviewArrow((current) => (current === 'previous' ? null : current))}
              onFocus={() => setHoveredPreviewArrow('previous')}
              onBlur={() => setHoveredPreviewArrow((current) => (current === 'previous' ? null : current))}
              onClick={(event) => {
                event.stopPropagation();
                showPreviewImage(previousPreviewImageSrc);
              }}>
              <span
                style={{
                  ...previewArrowVisualStyle,
                  transform: hoveredPreviewArrow === 'previous' ? 'scale(1.16)' : 'scale(1)',
                }}>
                <span style={previewArrowGlyphStyle}>←</span>
              </span>
            </button>
          ) : null}
          <div
            style={previewTiltRegionStyle}
            onClick={(event) => event.stopPropagation()}
            onMouseMove={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              if (rect.width <= 0 || rect.height <= 0) {
                return;
              }
              const x = (event.clientX - rect.left) / rect.width - 0.5;
              const y = (event.clientY - rect.top) / rect.height - 0.5;
              setPreviewTilt({
                rotateX: Number((-y * 8.6).toFixed(2)),
                rotateY: Number((x * 10.5).toFixed(2)),
              });
            }}
            onMouseLeave={() => setPreviewTilt({rotateX: 0, rotateY: 0})}>
            <div
              style={{
                ...previewPanelShellStyle,
                transform: `perspective(1500px) rotateX(${previewTilt.rotateX}deg) rotateY(${previewTilt.rotateY}deg)`,
              }}>
              <div style={previewPanelStyle}>
                <img src={previewImageSrc} alt="Gallery preview" style={previewImageStyle} />
              </div>
            </div>
          </div>
          {nextPreviewImageSrc ? (
            <button
              type="button"
              aria-label={`Next ${previewGalleryContext?.section.title ?? 'gallery'} image`}
              style={{...previewArrowButtonStyle, right: 'clamp(0.7rem, 4vw, 3rem)'}}
              onMouseEnter={() => setHoveredPreviewArrow('next')}
              onMouseLeave={() => setHoveredPreviewArrow((current) => (current === 'next' ? null : current))}
              onFocus={() => setHoveredPreviewArrow('next')}
              onBlur={() => setHoveredPreviewArrow((current) => (current === 'next' ? null : current))}
              onClick={(event) => {
                event.stopPropagation();
                showPreviewImage(nextPreviewImageSrc);
              }}>
              <span
                style={{
                  ...previewArrowVisualStyle,
                  transform: hoveredPreviewArrow === 'next' ? 'scale(1.16)' : 'scale(1)',
                }}>
                <span style={previewArrowGlyphStyle}>→</span>
              </span>
            </button>
          ) : null}
        </div>
      ) : null}
    </BlankSectionPage>
  );
}
