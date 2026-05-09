import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';

const TOP_BAR_HEIGHT_PX = 30;

type ShopDropTrack = {
  id: number;
  title: string;
  audioSrc: string;
};

type ShopDropCase = {
  id: number;
  coverSrc: string;
  tracks: [ShopDropTrack, ShopDropTrack];
};

const SHOP_DROP_CASES: ShopDropCase[] = [
  {
    id: 1,
    coverSrc: '/assets/supermons-tracks/shop-drop/cover1.png',
    tracks: [
      {
        id: 1,
        title: 'triumphal',
        audioSrc: '/assets/supermons-tracks/shop-drop/1-triumphal.mp3',
      },
      {
        id: 2,
        title: 'clear view',
        audioSrc: '/assets/supermons-tracks/shop-drop/2-clear-view.mp3',
      },
    ],
  },
  {
    id: 3,
    coverSrc: '/assets/supermons-tracks/shop-drop/cover2.png',
    tracks: [
      {
        id: 4,
        title: 'flightless pond',
        audioSrc: '/assets/supermons-tracks/shop-drop/4-flightless-pond.mp3',
      },
      {
        id: 3,
        title: 'sanpling',
        audioSrc: '/assets/supermons-tracks/shop-drop/3-sanpling.mp3',
      },
    ],
  },
  {
    id: 5,
    coverSrc: '/assets/supermons-tracks/shop-drop/cover3.png',
    tracks: [
      {
        id: 5,
        title: 'solace',
        audioSrc: '/assets/supermons-tracks/shop-drop/5-solace.mp3',
      },
      {
        id: 6,
        title: 'realm reciever',
        audioSrc: '/assets/supermons-tracks/shop-drop/6-receiver.m4a',
      },
    ],
  },
  {
    id: 7,
    coverSrc: '/assets/supermons-tracks/shop-drop/cover4.png',
    tracks: [
      {
        id: 7,
        title: 'beetlehunt',
        audioSrc: '/assets/supermons-tracks/shop-drop/7-beetlehunt.mp3',
      },
      {
        id: 8,
        title: 'mytho suburban sky',
        audioSrc: '/assets/supermons-tracks/shop-drop/8-mytho-suburban-sky.m4a',
      },
    ],
  },
  {
    id: 9,
    coverSrc: '/assets/supermons-tracks/shop-drop/cover5.png',
    tracks: [
      {
        id: 9,
        title: 'dark bends',
        audioSrc: '/assets/supermons-tracks/shop-drop/9-dark-bends.mp3',
      },
      {
        id: 10,
        title: 'bit ambitious',
        audioSrc: '/assets/supermons-tracks/shop-drop/10-bit-ambitious.mp3',
      },
    ],
  },
];

const NATURAL_VISUALIZER_TRACK_IDS = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
const LOW_END_VISUALIZER_BOOST_TRACK_IDS = new Set([2, 3, 4, 5, 7, 8, 9, 10]);
const SHOP_DROP_DOWNLOAD_SRC = '/assets/supermons-tracks/shop-drop/mons-shop-drop-tracks.zip';

function getShopDropCoverForTrack(trackId: number | null): string | null {
  if (trackId === null) {
    return null;
  }
  return SHOP_DROP_CASES.find((item) => item.tracks.some((track) => track.id === trackId))?.coverSrc ?? null;
}

const pageStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  margin: 0,
  backgroundColor: '#fff',
  overflow: 'hidden',
  userSelect: 'none',
  WebkitUserSelect: 'none',
  color: '#111',
};

const topBarStyle: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: TOP_BAR_HEIGHT_PX,
  padding: '0 10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '#fff',
  borderBottom: '1px solid #e5e5e5',
  zIndex: 20,
};

const topBarTitleStyle: CSSProperties = {
  fontSize: 12,
  lineHeight: 1,
  color: '#111',
  letterSpacing: 0.1,
  whiteSpace: 'nowrap',
};

const topBarButtonsStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};

const topBarButtonStyle: CSSProperties = {
  height: 22,
  border: '1px solid #111',
  backgroundColor: '#fff',
  color: '#111',
  fontSize: 12,
  lineHeight: '20px',
  padding: '0 9px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

const topBarButtonActiveStyle: CSSProperties = {
  ...topBarButtonStyle,
  backgroundColor: '#111',
  color: '#fff',
};

const galleryStyle: CSSProperties = {
  position: 'absolute',
  top: TOP_BAR_HEIGHT_PX,
  left: 0,
  right: 0,
  bottom: 76,
  display: 'grid',
  gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
  gridTemplateRows: 'minmax(0, 1fr)',
  gap: '4px 14px',
  padding: '10px 20px 0',
  boxSizing: 'border-box',
  alignItems: 'center',
};

const caseCardStyle: CSSProperties = {
  position: 'relative',
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  gridTemplateRows: 'auto auto',
  alignContent: 'center',
  alignItems: 'center',
  justifyItems: 'center',
  gap: 2,
  transform: 'translateY(90px)',
};

const canvasShellStyle: CSSProperties = {
  width: '100%',
  height: 'clamp(210px, 38vh, 270px)',
  minHeight: 210,
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
  borderRadius: 6,
  backgroundColor: '#fff',
  boxShadow: 'none',
  overflow: 'hidden',
};

const canvasShellScaleStyle: CSSProperties = {
  transform: 'scale(1.065)',
  transformOrigin: '50% 76%',
  transition: 'transform 150ms ease',
  willChange: 'transform',
};

const canvasStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  height: '100%',
  maxWidth: 270,
  maxHeight: 256,
  minHeight: 145,
  cursor: 'grab',
  touchAction: 'none',
};

const controlsStyle: CSSProperties = {
  width: 'min(100%, 230px)',
  display: 'grid',
  gridTemplateColumns: '32px minmax(0, 1fr)',
  gridTemplateRows: 'auto auto',
  columnGap: 8,
  rowGap: 1,
  alignItems: 'center',
  color: '#111',
};

const caseControlsStackStyle: CSSProperties = {
  width: 'min(100%, 230px)',
  display: 'grid',
  gap: 6,
};

const trackTitleStyle: CSSProperties = {
  minWidth: 0,
  margin: 0,
  fontSize: 10,
  lineHeight: 1.05,
  textAlign: 'left',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const trackTitlePrefixStyle: CSSProperties = {
  color: '#9a9a9a',
};

const trackStackStyle: CSSProperties = {
  display: 'grid',
  gap: 1,
  alignItems: 'center',
};

const playButtonStyle: CSSProperties = {
  width: 30,
  height: 30,
  border: '1px solid #111',
  borderRadius: '9999px',
  backgroundColor: '#fff',
  color: '#111',
  padding: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

const sliderWrapStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) 34px',
  gap: 4,
  alignItems: 'center',
};

const trackSliderStyle: CSSProperties = {
  width: '100%',
  cursor: 'pointer',
};

const timeLabelStyle: CSSProperties = {
  fontSize: 10,
  lineHeight: 1,
  textAlign: 'left',
  fontVariantNumeric: 'tabular-nums',
  opacity: 0.72,
};

const visualizerLayerStyle: CSSProperties = {
  position: 'absolute',
  top: 66,
  left: '50%',
  width: 'min(920px, calc(100vw - 24px))',
  height: 360,
  transform: 'translateX(-50%)',
  pointerEvents: 'none',
  zIndex: 4,
};

const visualizerCanvasStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  height: '100%',
};

const visualizerCoverStyle: CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: 58,
  height: 58,
  borderRadius: '9999px',
  objectFit: 'cover',
  pointerEvents: 'none',
  boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.18)',
};

const bottomControlsStyle: CSSProperties = {
  position: 'absolute',
  left: '50%',
  bottom: 14,
  width: 'min(320px, calc(100vw - 48px))',
  transform: 'translateX(-50%)',
  display: 'grid',
  justifyItems: 'center',
  gap: 8,
  zIndex: 8,
};

const downloadButtonStyle: CSSProperties = {
  minWidth: 112,
  height: 28,
  border: '1px solid #111',
  backgroundColor: '#fff',
  color: '#111',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  padding: '0 12px',
  fontSize: 12,
  lineHeight: 1,
  textDecoration: 'none',
  cursor: 'pointer',
};

const volumeControlStyle: CSSProperties = {
  width: '100%',
  display: 'grid',
  gridTemplateColumns: '32px minmax(0, 1fr)',
  alignItems: 'center',
  gap: 8,
};

const volumeLabelStyle: CSSProperties = {
  color: '#111',
  display: 'inline-flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  height: 20,
};

const newMusicSliderStyles = `
.new-music-track-slider {
  appearance: none;
  -webkit-appearance: none;
  height: 16px;
  background: transparent;
}
.new-music-track-slider::-webkit-slider-runnable-track {
  height: 3px;
  background: #cfd3d8;
  border: 0;
}
.new-music-track-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 7px;
  height: 15px;
  margin-top: -6px;
  border: 0;
  border-radius: 1px;
  background: #000;
}
.new-music-track-slider::-moz-range-track {
  height: 3px;
  background: #cfd3d8;
  border: 0;
}
.new-music-track-slider::-moz-range-thumb {
  width: 7px;
  height: 15px;
  border: 0;
  border-radius: 1px;
  background: #000;
}
@keyframes new-music-cover-spin {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}
.new-music-visualizer-cover {
  animation: new-music-cover-spin 5.5s linear infinite;
}
`;

function formatTrackTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '0:00';
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function VolumeWaveIcon({volume}: {volume: number}): ReactNode {
  const waveStyle = (isVisible: boolean): CSSProperties => ({
    opacity: isVisible ? 1 : 0,
    transition: 'opacity 120ms ease',
  });

  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        d="M4.5 9.2H8L12.2 5.7V18.3L8 14.8H4.5V9.2Z"
        fill="currentColor"
      />
      <path
        d="M14.6 9.4C15.25 10.08 15.58 10.94 15.58 12C15.58 13.06 15.25 13.92 14.6 14.6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.7"
        style={waveStyle(volume > 0)}
      />
      <path
        d="M16.8 7.5C17.95 8.72 18.52 10.22 18.52 12C18.52 13.78 17.95 15.28 16.8 16.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.7"
        style={waveStyle(volume >= 0.34)}
      />
      <path
        d="M19 5.55C20.63 7.28 21.45 9.43 21.45 12C21.45 14.57 20.63 16.72 19 18.45"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.7"
        style={waveStyle(volume >= 0.67)}
      />
    </svg>
  );
}

type BrowserWindowWithAudioContext = Window & {
  webkitAudioContext?: typeof AudioContext;
};

let shopDropAudioContext: AudioContext | null = null;
const shopDropAudioSourceByElement = new WeakMap<
  HTMLAudioElement,
  MediaElementAudioSourceNode
>();

function getShopDropAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const AudioContextConstructor =
    window.AudioContext ??
    (window as BrowserWindowWithAudioContext).webkitAudioContext;
  if (!AudioContextConstructor) {
    return null;
  }
  if (shopDropAudioContext === null) {
    shopDropAudioContext = new AudioContextConstructor();
  }
  return shopDropAudioContext;
}

function disposeMaterial(material: THREE.Material | THREE.Material[]): void {
  if (Array.isArray(material)) {
    material.forEach((entry) => entry.dispose());
    return;
  }
  material.dispose();
}

function createRoundedBoxMesh(
  width: number,
  height: number,
  depth: number,
  radius: number,
  material: THREE.Material,
): THREE.Mesh {
  return new THREE.Mesh(new RoundedBoxGeometry(width, height, depth, 5, radius), material);
}

function addRoundedBox(
  group: THREE.Group,
  material: THREE.Material,
  width: number,
  height: number,
  depth: number,
  position: THREE.Vector3Tuple,
  radius = 0.012,
): THREE.Mesh {
  const mesh = createRoundedBoxMesh(width, height, depth, radius, material);
  mesh.position.set(...position);
  group.add(mesh);
  return mesh;
}

const lidSheenVertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const lidSheenFragmentShader = `
precision highp float;

varying vec2 vUv;
uniform float uAngle;
uniform float uShift;
uniform float uIntensity;
uniform float uSpread;

float band(float value, float center, float width) {
  return 1.0 - smoothstep(0.0, width, abs(value - center));
}

void main() {
  vec2 uv = vUv - 0.5;
  float c = cos(uAngle);
  float s = sin(uAngle);
  vec2 rotated = vec2(uv.x * c - uv.y * s, uv.x * s + uv.y * c);
  float mainBand = band(rotated.x, uShift, 0.075 + uSpread * 0.035);
  float softBand = band(rotated.x, uShift - 0.22, 0.19 + uSpread * 0.08);
  float rimBand = band(rotated.y, 0.44, 0.05);
  float edgeFade =
    smoothstep(-0.49, -0.37, uv.x) *
    (1.0 - smoothstep(0.38, 0.5, uv.x)) *
    smoothstep(-0.49, -0.38, uv.y) *
    (1.0 - smoothstep(0.39, 0.5, uv.y));
  float alpha = (mainBand * 0.12 + softBand * 0.035 + rimBand * 0.026) * uIntensity * edgeFade;
  vec3 color = mix(vec3(0.82, 0.94, 1.0), vec3(1.0), mainBand * 0.75);
  gl_FragColor = vec4(color, alpha);
}
`;

const cdHologramVertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const cdHologramFragmentShader = `
precision highp float;

varying vec2 vUv;
uniform float uHueShift;
uniform float uIntensity;

vec3 spectral(float value) {
  return 0.5 + 0.5 * cos(6.2831853 * (vec3(0.0, 0.33, 0.67) + value));
}

void main() {
  vec2 uv = vUv - 0.5;
  float radius = length(uv);
  float angle = atan(uv.y, uv.x);
  float discMask = smoothstep(0.5, 0.47, radius) * (1.0 - smoothstep(0.105, 0.13, radius));
  float grooves = 0.5 + 0.5 * sin(radius * 220.0 + angle * 3.0 + uHueShift * 6.0);
  float fineGrooves = 0.5 + 0.5 * sin(radius * 720.0 + uHueShift * 2.0);
  float radialSweep = 0.5 + 0.5 * sin(angle * 5.0 + uHueShift * 7.0);
  float sector = 0.5 + 0.5 * sin(angle * 11.0 - radius * 9.0 + uHueShift * 5.0);
  vec3 holo = spectral(radius * 2.1 + radialSweep * 0.28 + sector * 0.12 + uHueShift);
  vec3 silver = vec3(0.72, 0.78, 0.82) + vec3(fineGrooves * 0.08);
  vec3 base = mix(silver, holo, 0.48 + grooves * 0.34);
  float alpha = discMask * (0.74 + grooves * 0.16) * uIntensity;
  gl_FragColor = vec4(base, alpha);
}
`;

function CdCaseCanvas({
  coverSrc,
  initialRotationY,
  onDragEnd,
  onDragStart,
}: {
  coverSrc: string;
  initialRotationY: number;
  onDragEnd: () => void;
  onDragStart: () => void;
}): ReactNode {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onDragEndRef = useRef(onDragEnd);
  const onDragStartRef = useRef(onDragStart);
  const rotationRef = useRef({x: -0.2, y: initialRotationY});

  useEffect(() => {
    onDragEndRef.current = onDragEnd;
    onDragStartRef.current = onDragStart;
  }, [onDragEnd, onDragStart]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) {
      return undefined;
    }

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;

    const scene = new THREE.Scene();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const environmentTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = environmentTexture;

    const camera = new THREE.PerspectiveCamera(27, 1, 0.1, 40);
    camera.position.set(0, 0, 8.75);

    const group = new THREE.Group();
    group.rotation.x = rotationRef.current.x;
    group.rotation.y = rotationRef.current.y;
    group.rotation.z = -0.045;
    group.scale.setScalar(0.92);
    scene.add(group);

    const lidMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf4fbff,
      transparent: true,
      opacity: 0.055,
      roughness: 0.025,
      metalness: 0,
      transmission: 0.82,
      thickness: 0.34,
      ior: 1.48,
      reflectivity: 0.88,
      clearcoat: 1,
      clearcoatRoughness: 0.018,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const trayMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf7fbff,
      transparent: true,
      opacity: 0.28,
      roughness: 0.055,
      metalness: 0,
      transmission: 0.36,
      thickness: 0.26,
      ior: 1.48,
      reflectivity: 0.72,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const moldedMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xeef7ff,
      transparent: true,
      opacity: 0.38,
      roughness: 0.04,
      metalness: 0,
      transmission: 0.24,
      thickness: 0.18,
      clearcoat: 1,
      clearcoatRoughness: 0.025,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.88,
    });
    const darkEdgeMaterial = new THREE.LineBasicMaterial({
      color: 0x9aa3ad,
      transparent: true,
      opacity: 0.24,
    });
    const paperMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    const glareMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const hingeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xe8f4ff,
      transparent: true,
      opacity: 0.42,
      roughness: 0.035,
      metalness: 0,
      transmission: 0.3,
      thickness: 0.24,
      clearcoat: 1,
      clearcoatRoughness: 0.018,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const caseWidth = 3.18;
    const caseHeight = 3.02;
    const caseDepth = 0.26;

    const backShell = addRoundedBox(
      group,
      trayMaterial,
      caseWidth,
      caseHeight,
      caseDepth,
      [0, 0, -0.055],
      0.045,
    );
    const frontLid = addRoundedBox(
      group,
      lidMaterial,
      caseWidth,
      caseHeight,
      0.088,
      [0, 0, 0.155],
      0.055,
    );

    const backEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(backShell.geometry),
      edgeMaterial,
    );
    backEdges.position.copy(backShell.position);
    group.add(backEdges);
    const lidEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(frontLid.geometry),
      edgeMaterial,
    );
    lidEdges.position.copy(frontLid.position);
    group.add(lidEdges);

    addRoundedBox(group, moldedMaterial, 2.82, 0.035, 0.06, [0.08, 1.35, 0.225]);
    addRoundedBox(group, moldedMaterial, 2.82, 0.035, 0.06, [0.08, -1.35, 0.225]);
    addRoundedBox(group, moldedMaterial, 0.035, 2.68, 0.06, [1.39, 0, 0.225]);
    addRoundedBox(group, moldedMaterial, 0.035, 2.68, 0.055, [-1.08, 0, 0.225]);
    addRoundedBox(group, moldedMaterial, 2.48, 0.018, 0.035, [0.23, 1.205, 0.245], 0.006);
    addRoundedBox(group, moldedMaterial, 2.48, 0.018, 0.035, [0.23, -1.205, 0.245], 0.006);

    const hingeMesh = addRoundedBox(
      group,
      hingeMaterial,
      0.32,
      2.9,
      0.33,
      [-1.43, 0, 0.02],
      0.04,
    );
    const hingeEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(hingeMesh.geometry),
      darkEdgeMaterial,
    );
    hingeEdges.position.copy(hingeMesh.position);
    group.add(hingeEdges);

    [-1.08, 1.08].forEach((yPosition) => {
      addRoundedBox(group, hingeMaterial, 0.2, 0.085, 0.065, [1.36, yPosition, 0.245], 0.012);
    });
    [-1.08, 1.08].forEach((yPosition) => {
      addRoundedBox(group, hingeMaterial, 0.07, 0.3, 0.04, [-1.02, yPosition, 0.205], 0.012);
    });
    [-1.18, -0.86, 0.86, 1.18].forEach((yPosition) => {
      addRoundedBox(group, moldedMaterial, 0.13, 0.014, 0.035, [-1.4, yPosition, 0.19], 0.004);
    });

    const trayRingMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf6fbff,
      transparent: true,
      opacity: 0.18,
      roughness: 0.035,
      metalness: 0,
      transmission: 0.36,
      thickness: 0.1,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const cdCenterX = 0.18;
    const cdCenterY = -0.04;
    const cdInnerRadius = 0.21;
    const cdOuterRadius = 1.24;
    const trayRing = new THREE.Mesh(new THREE.TorusGeometry(1.28, 0.014, 18, 160), trayRingMaterial);
    trayRing.position.set(cdCenterX, cdCenterY, 0.052);
    group.add(trayRing);
    const hubOuter = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.018, 16, 80), trayRingMaterial.clone());
    hubOuter.position.set(cdCenterX, cdCenterY, 0.057);
    group.add(hubOuter);
    for (let index = 0; index < 12; index += 1) {
      const tooth = addRoundedBox(group, trayRingMaterial, 0.035, 0.12, 0.035, [cdCenterX, cdCenterY, 0.071], 0.006);
      tooth.rotation.z = (Math.PI * 2 * index) / 12;
      tooth.position.x += Math.cos(tooth.rotation.z) * 0.18;
      tooth.position.y += Math.sin(tooth.rotation.z) * 0.18;
    }

    const cdSilverMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xd8e0e8,
      transparent: true,
      opacity: 0.78,
      roughness: 0.12,
      metalness: 0.58,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const cdSolidSurface = new THREE.Mesh(new THREE.RingGeometry(cdInnerRadius, cdOuterRadius, 192), cdSilverMaterial);
    cdSolidSurface.position.set(cdCenterX, cdCenterY, 0.066);
    group.add(cdSolidSurface);

    const cdWhiteMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.46,
      roughness: 0.18,
      metalness: 0.08,
      clearcoat: 0.7,
      clearcoatRoughness: 0.08,
      side: THREE.FrontSide,
      depthWrite: false,
    });
    const cdWhiteFace = new THREE.Mesh(new THREE.RingGeometry(cdInnerRadius, cdOuterRadius, 192), cdWhiteMaterial);
    cdWhiteFace.position.set(cdCenterX, cdCenterY, 0.086);
    group.add(cdWhiteFace);

    const cdHologramMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uHueShift: {value: 0.1},
        uIntensity: {value: 0.72},
      },
      vertexShader: cdHologramVertexShader,
      fragmentShader: cdHologramFragmentShader,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const cdHologramBack = new THREE.Mesh(new THREE.RingGeometry(cdInnerRadius, cdOuterRadius, 192), cdHologramMaterial);
    cdHologramBack.position.set(cdCenterX, cdCenterY, 0.058);
    group.add(cdHologramBack);

    const cdEdgeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xdde4ea,
      transparent: true,
      opacity: 0.62,
      roughness: 0.1,
      metalness: 0.58,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const cdOuterEdge = new THREE.Mesh(new THREE.TorusGeometry(cdOuterRadius, 0.014, 14, 192), cdEdgeMaterial);
    cdOuterEdge.position.set(cdCenterX, cdCenterY, 0.072);
    group.add(cdOuterEdge);
    const cdInnerEdge = new THREE.Mesh(new THREE.TorusGeometry(cdInnerRadius, 0.012, 14, 96), cdEdgeMaterial.clone());
    cdInnerEdge.position.set(cdCenterX, cdCenterY, 0.073);
    group.add(cdInnerEdge);

    const coverBacker = new THREE.Mesh(
      new THREE.PlaneGeometry(2.78, 2.88),
      new THREE.MeshBasicMaterial({
        color: 0xf7f7f2,
        side: THREE.DoubleSide,
      }),
    );
    coverBacker.position.set(0.16, 0, 0.198);
    group.add(coverBacker);

    const coverGeometry = new THREE.PlaneGeometry(2.82, 2.86);
    const coverMesh = new THREE.Mesh(coverGeometry, paperMaterial);
    coverMesh.position.set(0.16, 0, 0.221);
    group.add(coverMesh);
    addRoundedBox(group, moldedMaterial, 2.92, 0.018, 0.035, [0.16, 1.425, 0.218], 0.006);
    addRoundedBox(group, moldedMaterial, 2.92, 0.018, 0.035, [0.16, -1.425, 0.218], 0.006);
    addRoundedBox(group, moldedMaterial, 0.018, 2.72, 0.035, [1.47, 0, 0.218], 0.006);

    const frontPlate = new THREE.Mesh(
      new THREE.PlaneGeometry(2.94, 2.82),
      new THREE.MeshPhysicalMaterial({
        color: 0xf2f8ff,
        transparent: true,
        opacity: 0.035,
        roughness: 0.018,
        metalness: 0,
        transmission: 0.82,
        thickness: 0.18,
        ior: 1.48,
        clearcoat: 1,
        clearcoatRoughness: 0.01,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    frontPlate.position.set(0.02, 0, 0.282);
    group.add(frontPlate);

    const lidSheenMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uAngle: {value: -0.72},
        uShift: {value: 0},
        uIntensity: {value: 0.28},
        uSpread: {value: 0.3},
      },
      vertexShader: lidSheenVertexShader,
      fragmentShader: lidSheenFragmentShader,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const lidSheen = new THREE.Mesh(new THREE.PlaneGeometry(2.98, 2.86), lidSheenMaterial);
    lidSheen.position.set(0.02, 0, 0.318);
    group.add(lidSheen);

    const hingeGlare = new THREE.Mesh(new THREE.PlaneGeometry(0.055, 2.55), glareMaterial.clone());
    hingeGlare.position.set(-1.39, 0, 0.315);
    (hingeGlare.material as THREE.MeshBasicMaterial).opacity = 0.2;
    group.add(hingeGlare);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.28);
    scene.add(ambientLight);
    const keyLight = new THREE.RectAreaLight(0xffffff, 5.4, 5.8, 3.2);
    keyLight.position.set(-2.6, 3.2, 4.6);
    keyLight.lookAt(0, 0, 0);
    scene.add(keyLight);
    const rimLight = new THREE.RectAreaLight(0xd7ecff, 3.2, 3.6, 2.4);
    rimLight.position.set(3.4, 0.8, 3.2);
    rimLight.lookAt(0, 0, 0);
    scene.add(rimLight);

    let coverTexture: THREE.Texture | null = null;
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(coverSrc, (texture) => {
      coverTexture = texture;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      paperMaterial.map = texture;
      paperMaterial.needsUpdate = true;
      render();
    });

    const updateDynamicHighlights = (): void => {
      const {x, y} = rotationRef.current;
      const normal = new THREE.Vector3(0, 0, 1).applyEuler(group.rotation).normalize();
      const lightDirection = new THREE.Vector3(-0.38, 0.62, 0.69).normalize();
      const viewDirection = new THREE.Vector3(0, 0, 1);
      const specularAim = Math.max(0, normal.dot(lightDirection) * 0.58 + normal.dot(viewDirection) * 0.42);
      const specular = Math.pow(specularAim, 2.4);
      const sideLight = Math.min(1, Math.max(0, normal.x * 0.7 + 0.5));
      const tiltLight = Math.min(1, Math.max(0, normal.y * -0.55 + 0.62));
      const diagonalGlint = Math.min(1, Math.max(0, specular * 1.15 + tiltLight * 0.2));
      const opposingGlint = Math.min(1, Math.max(0, (1 - sideLight) * specular));

      lidSheenMaterial.uniforms.uShift.value = -0.36 + sideLight * 0.72 + Math.sin(y * 0.8 - x * 0.35) * 0.04;
      lidSheenMaterial.uniforms.uAngle.value = -0.86 + y * 0.18 - x * 0.12;
      lidSheenMaterial.uniforms.uIntensity.value = 0.09 + diagonalGlint * 0.34;
      lidSheenMaterial.uniforms.uSpread.value = 0.1 + Math.abs(normal.x) * 0.9;
      cdHologramMaterial.uniforms.uHueShift.value = y * 0.22 - x * 0.1 + normal.x * 0.42;
      cdHologramMaterial.uniforms.uIntensity.value = 0.58 + (1 - Math.abs(normal.z)) * 0.34 + diagonalGlint * 0.2;
      keyLight.intensity = 4.7 + diagonalGlint * 1.1;
      rimLight.intensity = 2.65 + opposingGlint * 0.9;
    };

    const render = (): void => {
      updateDynamicHighlights();
      renderer.render(scene, camera);
    };

    const resizeRenderer = (): void => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      render();
    };

    let isDragging = false;
    let lastPointerX = 0;
    let lastPointerY = 0;

    const handlePointerDown = (event: PointerEvent): void => {
      if (event.button !== 0) {
        return;
      }
      isDragging = true;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = 'grabbing';
      onDragStartRef.current();
    };

    const handlePointerMove = (event: PointerEvent): void => {
      if (!isDragging) {
        return;
      }
      const deltaX = event.clientX - lastPointerX;
      const deltaY = event.clientY - lastPointerY;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      rotationRef.current = {
        x: Math.max(-0.72, Math.min(0.42, rotationRef.current.x + deltaY * 0.008)),
        y: rotationRef.current.y + deltaX * 0.011,
      };
      group.rotation.x = rotationRef.current.x;
      group.rotation.y = rotationRef.current.y;
      render();
    };

    const handlePointerUp = (event: PointerEvent): void => {
      if (!isDragging) {
        return;
      }
      isDragging = false;
      canvas.releasePointerCapture(event.pointerId);
      canvas.style.cursor = 'grab';
      onDragEndRef.current();
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);

    const resizeObserver = new ResizeObserver(resizeRenderer);
    resizeObserver.observe(canvas);
    resizeRenderer();

    return () => {
      resizeObserver.disconnect();
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
      coverTexture?.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
          object.geometry.dispose();
          disposeMaterial(object.material);
        }
      });
      renderer.dispose();
      if (isDragging) {
        onDragEndRef.current();
      }
    };
  }, [coverSrc, initialRotationY]);

  return <canvas ref={canvasRef} style={canvasStyle} aria-label="Rotatable jewel case" />;
}

function AudioRadialVisualizer({
  activeCoverSrc,
  activeTrackId,
  audioElement,
}: {
  activeCoverSrc: string | null;
  activeTrackId: number | null;
  audioElement: HTMLAudioElement | null;
}): ReactNode {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (audioElement === null || canvas === null || typeof window === 'undefined') {
      return undefined;
    }

    const audioContext = getShopDropAudioContext();
    if (audioContext === null) {
      return undefined;
    }

    let source = shopDropAudioSourceByElement.get(audioElement);
    if (source === undefined) {
      source = audioContext.createMediaElementSource(audioElement);
      shopDropAudioSourceByElement.set(audioElement, source);
    } else {
      try {
        source.disconnect();
      } catch {
        // The source may already be disconnected after a previous pause.
      }
    }

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.78;
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    if (audioContext.state === 'suspended') {
      void audioContext.resume();
    }

    const frequencyData = new Uint8Array(analyser.frequencyBinCount);
    let frameId: number | null = null;

    const resizeCanvas = (): void => {
      const pixelRatio = Math.min(2, window.devicePixelRatio || 1);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * pixelRatio));
      canvas.height = Math.max(1, Math.round(rect.height * pixelRatio));
    };

    const draw = (): void => {
      analyser.getByteFrequencyData(frequencyData);
      const context = canvas.getContext('2d');
      if (context === null) {
        return;
      }

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width * 0.5;
      const centerY = height * 0.5;
      const size = Math.min(width, height);
      const baseRadius = size * 0.19;
      const barCount = 152;
      const shouldEvenlyDistribute =
        activeTrackId !== null && !NATURAL_VISUALIZER_TRACK_IDS.has(activeTrackId);
      const shouldLiftLowEnd =
        activeTrackId !== null && LOW_END_VISUALIZER_BOOST_TRACK_IDS.has(activeTrackId);
      const currentTime = audioElement.currentTime || 0;
      const quietArcCenter = -Math.PI * 0.38 + Math.sin(currentTime * 0.18) * 0.13;
      const quietArcWidth = 0.52;

      context.clearRect(0, 0, width, height);

      let bass = 0;
      let mid = 0;
      let treble = 0;
      for (let index = 1; index < 22; index += 1) {
        bass += frequencyData[index] ?? 0;
      }
      for (let index = 22; index < 138; index += 1) {
        mid += frequencyData[index] ?? 0;
      }
      for (let index = 138; index < 420; index += 1) {
        treble += frequencyData[index] ?? 0;
      }
      bass /= 21 * 255;
      mid /= 116 * 255;
      treble /= 282 * 255;

      const pulseRadius = baseRadius + bass * size * 0.065;
      context.beginPath();
      context.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
      context.strokeStyle = `rgba(0, 0, 0, ${0.08 + bass * 0.18})`;
      context.lineWidth = Math.max(1, size * 0.012);
      context.stroke();

      const readBin = (binIndex: number): number =>
        (frequencyData[Math.min(frequencyData.length - 1, Math.max(1, binIndex))] ?? 0) / 255;
      const getAngularDistance = (angleA: number, angleB: number): number =>
        Math.abs(Math.atan2(Math.sin(angleA - angleB), Math.cos(angleA - angleB)));

      for (let index = 0; index < barCount; index += 1) {
        const angle = (index / barCount) * Math.PI * 2 - Math.PI / 2;
        const normalizedIndex = index / (barCount - 1);
        let lineEnergy = treble;
        let harmonic = 0;

        if (shouldEvenlyDistribute) {
          const timeOffset = Math.floor(currentTime * 13);
          const lowSample = readBin(3 + ((index * 7 + timeOffset) % 46));
          const lowMirror = readBin(10 + (((barCount - index) * 5 + timeOffset) % 72));
          const midSample = readBin(46 + ((index * 19 + timeOffset * 2) % 230));
          const highSample = readBin(170 + ((index * 29 + timeOffset * 3) % 540));
          const alternatingBand = index % 3 === 0 ? lowMirror : index % 3 === 1 ? midSample : highSample;
          const circularMotion =
            0.78 +
            ((Math.sin(angle * 5 + currentTime * 1.8) + 1) / 2) * 0.2 +
            ((Math.sin(angle * 9 - currentTime * 2.3) + 1) / 2) * 0.1;

          harmonic =
            (lowSample * 0.16 +
              lowMirror * 0.12 +
              midSample * 0.31 +
              highSample * 0.24 +
              alternatingBand * 0.2 +
              bass * 0.08 +
              mid * 0.1 +
              treble * 0.07) *
            circularMotion;
          const quietPocket = Math.max(0, 1 - getAngularDistance(angle, quietArcCenter) / quietArcWidth);
          const quietEase = quietPocket * quietPocket * (3 - quietPocket * 2);
          harmonic *= 1 - quietEase * 0.26;
          lineEnergy = Math.max(midSample, highSample, treble * 0.9);
        } else {
          const binIndex = Math.min(
            frequencyData.length - 1,
            Math.max(1, Math.round(Math.pow(normalizedIndex, 1.55) * 520)),
          );
          const magnitude = (frequencyData[binIndex] ?? 0) / 255;
          harmonic =
            magnitude * 0.72 +
            bass * (1 - normalizedIndex) * 0.18 +
            mid * Math.sin(normalizedIndex * Math.PI) * 0.16 +
            treble * normalizedIndex * 0.18;

          if (shouldLiftLowEnd) {
            const leftArc = Math.max(0, 1 - getAngularDistance(angle, Math.PI) / 1.35);
            const leftEase = leftArc * leftArc * (3 - leftArc * 2);
            const lowEndStrength = Math.max(
              bass,
              readBin(5) * 0.46 + readBin(15) * 0.34 + readBin(34) * 0.2,
            );
            harmonic += leftEase * (0.045 + lowEndStrength * 0.2 + mid * 0.055);
          }
        }

        const cappedHarmonic = Math.min(1, Math.max(0, harmonic));
        const barLength = size * (0.028 + Math.pow(cappedHarmonic, 1.2) * 0.25);
        const innerRadius = baseRadius + size * 0.018;
        const outerRadius = innerRadius + barLength;
        const x1 = centerX + Math.cos(angle) * innerRadius;
        const y1 = centerY + Math.sin(angle) * innerRadius;
        const x2 = centerX + Math.cos(angle) * outerRadius;
        const y2 = centerY + Math.sin(angle) * outerRadius;
        const alpha = 0.12 + Math.min(0.68, cappedHarmonic * 0.78);

        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
        context.lineWidth = Math.max(1, size * (0.004 + lineEnergy * 0.004));
        context.lineCap = 'round';
        context.stroke();
      }

      context.beginPath();
      context.arc(centerX, centerY, baseRadius * 0.45 + mid * size * 0.035, 0, Math.PI * 2);
      context.fillStyle = `rgba(0, 0, 0, ${0.04 + mid * 0.1})`;
      context.fill();

      frameId = window.requestAnimationFrame(draw);
    };

    resizeCanvas();
    draw();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
      try {
        source.disconnect();
      } catch {
        // Ignore disconnect races during page changes.
      }
      analyser.disconnect();
    };
  }, [activeTrackId, audioElement]);

  return (
    <div
      aria-hidden="true"
      style={{
        ...visualizerLayerStyle,
        opacity: audioElement === null ? 0 : 1,
      }}>
      <canvas ref={canvasRef} style={visualizerCanvasStyle} />
      {activeCoverSrc !== null ? (
        <img
          src={activeCoverSrc}
          alt=""
          className="new-music-visualizer-cover"
          style={{
            ...visualizerCoverStyle,
            animationPlayState: audioElement === null ? 'paused' : 'running',
          }}
        />
      ) : null}
    </div>
  );
}

type TrackControlProps = {
  activeTrackId: number | null;
  label: 'A' | 'B';
  setActiveAudioElement: Dispatch<SetStateAction<HTMLAudioElement | null>>;
  setActiveTrackId: Dispatch<SetStateAction<number | null>>;
  track: ShopDropTrack;
  volume: number;
};

function ShopDropTrackControl({
  activeTrackId,
  label,
  setActiveAudioElement,
  setActiveTrackId,
  track,
  volume,
}: TrackControlProps): ReactNode {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const isPlaying = activeTrackId === track.id;

  useEffect(() => {
    if (audioRef.current !== null) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio === null) {
      return;
    }
    audio.volume = volume;
    if (!isPlaying) {
      audio.pause();
      setActiveAudioElement((current) => (current === audio ? null : current));
      return;
    }
    setActiveAudioElement(audio);
    void audio.play().catch(() => {
      setActiveTrackId(null);
    });
    return () => {
      setActiveAudioElement((current) => (current === audio ? null : current));
    };
  }, [isPlaying, setActiveAudioElement, setActiveTrackId]);

  return (
    <div style={controlsStyle}>
      <button
        type="button"
        aria-label={isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
        className="new-music-play-button"
        style={playButtonStyle}
        onClick={() => {
          setActiveTrackId((current) => (current === track.id ? null : track.id));
        }}>
        {isPlaying ? (
          <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true" fill="currentColor">
            <path d="M7 5H10V19H7V5ZM14 5H17V19H14V5Z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="currentColor">
            <path d="M8 5V19L19 12L8 5Z" />
          </svg>
        )}
      </button>
      <span style={trackStackStyle}>
        <span style={sliderWrapStyle}>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.01}
            value={Math.min(currentTime, duration || currentTime)}
            aria-label={`Seek ${track.title}`}
            style={trackSliderStyle}
            className="new-music-track-slider"
            onChange={(event) => {
              const nextTime = Number(event.currentTarget.value);
              setCurrentTime(nextTime);
              if (audioRef.current !== null) {
                audioRef.current.currentTime = nextTime;
              }
            }}
          />
          <span style={timeLabelStyle}>
            {formatTrackTime(isPlaying ? currentTime : duration)}
          </span>
        </span>
        <p style={trackTitleStyle}>
          <span style={trackTitlePrefixStyle}>{label} - </span>
          {track.title}
        </p>
      </span>
      <audio
        ref={audioRef}
        src={track.audioSrc}
        preload="metadata"
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration || 0);
        }}
        onTimeUpdate={(event) => {
          setCurrentTime(event.currentTarget.currentTime);
        }}
        onEnded={() => {
          setActiveTrackId(null);
          setCurrentTime(0);
        }}
      />
    </div>
  );
}

type CaseCardProps = {
  activeTrackId: number | null;
  caseIndex: number;
  draggingCaseId: number | null;
  hoveredCaseId: number | null;
  item: ShopDropCase;
  setDraggingCaseId: Dispatch<SetStateAction<number | null>>;
  setActiveAudioElement: Dispatch<SetStateAction<HTMLAudioElement | null>>;
  setActiveTrackId: Dispatch<SetStateAction<number | null>>;
  setHoveredCaseId: Dispatch<SetStateAction<number | null>>;
  volume: number;
};

function ShopDropCaseCard({
  activeTrackId,
  caseIndex,
  draggingCaseId,
  hoveredCaseId,
  item,
  setDraggingCaseId,
  setActiveAudioElement,
  setActiveTrackId,
  setHoveredCaseId,
  volume,
}: CaseCardProps): ReactNode {
  const initialRotationYByIndex = [0.48, 0.24, 0, -0.24, -0.39];
  const initialRotationY = initialRotationYByIndex[caseIndex] ?? 0;
  const isPointerOverCaseRef = useRef(false);
  const isCaseScaled = draggingCaseId === item.id || (draggingCaseId === null && hoveredCaseId === item.id);

  return (
    <article
      style={{
        ...caseCardStyle,
        zIndex: isCaseScaled ? 3 : 1,
      }}>
      <div
        style={{
          ...canvasShellStyle,
          transform: isCaseScaled ? canvasShellScaleStyle.transform : 'scale(1)',
          transformOrigin: canvasShellScaleStyle.transformOrigin,
          transition: canvasShellScaleStyle.transition,
          willChange: canvasShellScaleStyle.willChange,
        }}
        onPointerEnter={() => {
          isPointerOverCaseRef.current = true;
          if (draggingCaseId === null) {
            setHoveredCaseId(item.id);
          }
        }}
        onPointerLeave={() => {
          isPointerOverCaseRef.current = false;
          setHoveredCaseId((current) => (current === item.id ? null : current));
        }}>
        <CdCaseCanvas
          coverSrc={item.coverSrc}
          initialRotationY={initialRotationY}
          onDragEnd={() => {
            setDraggingCaseId(null);
            setHoveredCaseId(isPointerOverCaseRef.current ? item.id : null);
          }}
          onDragStart={() => {
            setDraggingCaseId(item.id);
            setHoveredCaseId(item.id);
          }}
        />
      </div>
      <div style={caseControlsStackStyle}>
        {item.tracks.map((track, index) => (
          <ShopDropTrackControl
            key={track.id}
            activeTrackId={activeTrackId}
            label={index === 0 ? 'A' : 'B'}
            setActiveAudioElement={setActiveAudioElement}
            setActiveTrackId={setActiveTrackId}
            track={track}
            volume={volume}
          />
        ))}
      </div>
    </article>
  );
}

export default function ShopTracksPage(): ReactNode {
  const [activeTrackId, setActiveTrackId] = useState<number | null>(null);
  const [activeAudioElement, setActiveAudioElement] = useState<HTMLAudioElement | null>(null);
  const [draggingCaseId, setDraggingCaseId] = useState<number | null>(null);
  const [hoveredCaseId, setHoveredCaseId] = useState<number | null>(null);
  const [volume, setVolume] = useState(1);
  const activeCoverSrc = getShopDropCoverForTrack(activeTrackId);

  return (
    <main aria-label="shop tracks research dept." style={pageStyle}>
      <style>{newMusicSliderStyles}</style>
      <div aria-label="shop tracks top bar" style={topBarStyle}>
        <span style={topBarTitleStyle}>mons future aesthetical research dept.</span>
        <div style={topBarButtonsStyle}>
          <button
            type="button"
            style={topBarButtonStyle}
            onClick={() => {
              window.location.assign('/drainer-grid');
            }}>
            icon ocean
          </button>
          <button
            type="button"
            style={topBarButtonStyle}
            onClick={() => {
              window.location.assign('/3d-board');
            }}>
            3d board
          </button>
          <button
            type="button"
            aria-current="page"
            style={topBarButtonActiveStyle}
            onClick={() => {
              window.location.assign('/shop-tracks');
            }}>
            shop tracks
          </button>
        </div>
      </div>
      <AudioRadialVisualizer
        activeCoverSrc={activeCoverSrc}
        activeTrackId={activeTrackId}
        audioElement={activeAudioElement}
      />
      <section aria-label="Shop drop tracks" style={galleryStyle}>
        {SHOP_DROP_CASES.map((item, index) => (
          <ShopDropCaseCard
            key={item.id}
            activeTrackId={activeTrackId}
            caseIndex={index}
            draggingCaseId={draggingCaseId}
            hoveredCaseId={hoveredCaseId}
            item={item}
            setDraggingCaseId={setDraggingCaseId}
            setActiveAudioElement={setActiveAudioElement}
            setActiveTrackId={setActiveTrackId}
            setHoveredCaseId={setHoveredCaseId}
            volume={volume}
          />
        ))}
      </section>
      <div style={bottomControlsStyle}>
        <a
          href={SHOP_DROP_DOWNLOAD_SRC}
          download="mons-shop-drop-tracks.zip"
          style={downloadButtonStyle}>
          <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
            <path
              d="M12 3V15M7.5 10.5L12 15L16.5 10.5M5 20H19"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
          download all
        </a>
        <label style={volumeControlStyle}>
          <span style={volumeLabelStyle}>
            <VolumeWaveIcon volume={volume} />
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            aria-label="Shop drop track volume"
            className="new-music-track-slider"
            style={trackSliderStyle}
            onChange={(event) => {
              setVolume(Number(event.currentTarget.value));
            }}
          />
        </label>
      </div>
    </main>
  );
}
