import {useEffect, useRef, type CSSProperties, type PointerEvent, type ReactNode} from 'react';

type BrowserWindowWithAudioContext = Window & {
  webkitAudioContext?: typeof AudioContext;
};

type Particle = {
  age: number;
  life: number;
  renderAlpha: number;
  size: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
};

type SiteMusicVisualizerProps = {
  audioElement: HTMLAudioElement | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onSeek: (nextTime: number) => void;
  onTogglePlay: () => void;
};

let siteMusicAudioContext: AudioContext | null = null;
const siteMusicSourceByElement = new WeakMap<HTMLAudioElement, MediaElementAudioSourceNode>();
const siteMusicOutputConnectedElements = new WeakSet<HTMLAudioElement>();

const visualizerWrapStyle: CSSProperties = {
  position: 'relative',
  height: '270px',
  overflow: 'hidden',
  backgroundColor: '#fff',
  userSelect: 'none',
};

const visualizerCanvasStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  height: '100%',
};

const visualizerProgressHitAreaStyle: CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: 166,
  height: 166,
  padding: 0,
  border: 0,
  borderRadius: '9999px',
  backgroundColor: 'transparent',
  transform: 'translate(-50%, -50%)',
  cursor: 'pointer',
  zIndex: 2,
};

const visualizerDiskStyle: CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: 72,
  height: 72,
  borderRadius: '9999px',
  border: 0,
  padding: 0,
  background:
    'radial-gradient(circle at 50% 50%, #f9f9f9 0 13%, #d9d9d9 14% 17%, #fbfbfb 18% 38%, #efefef 39% 49%, #ffffff 50% 100%)',
  boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.16), inset 0 0 12px rgba(0, 0, 0, 0.08)',
  cursor: 'pointer',
  zIndex: 3,
};

const visualizerDiskCenterStyle: CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: 14,
  height: 14,
  borderRadius: '9999px',
  border: '1px solid rgba(0, 0, 0, 0.16)',
  backgroundColor: '#fff',
  transform: 'translate(-50%, -50%)',
};

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getSiteMusicAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') {
    return null;
  }
  if (siteMusicAudioContext !== null) {
    return siteMusicAudioContext;
  }
  const browserWindow = window as BrowserWindowWithAudioContext;
  const AudioContextConstructor = window.AudioContext ?? browserWindow.webkitAudioContext;
  if (AudioContextConstructor === undefined) {
    return null;
  }
  siteMusicAudioContext = new AudioContextConstructor();
  return siteMusicAudioContext;
}

function getPointerProgress(event: {
  clientX: number;
  clientY: number;
  currentTarget: HTMLElement;
}): number {
  const rect = event.currentTarget.getBoundingClientRect();
  const offsetX = event.clientX - rect.left - rect.width / 2;
  const offsetY = event.clientY - rect.top - rect.height / 2;
  const angle = Math.atan2(offsetY, offsetX);
  return ((angle + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2);
}

export default function SiteMusicVisualizer({
  audioElement,
  currentTime,
  duration,
  isPlaying,
  onSeek,
  onTogglePlay,
}: SiteMusicVisualizerProps): ReactNode {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentTimeRef = useRef(currentTime);
  const durationRef = useRef(duration);
  const isPlayingRef = useRef(isPlaying);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    if (isPlaying) {
      const audioContext = getSiteMusicAudioContext();
      if (audioContext?.state === 'suspended') {
        void audioContext.resume();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (audioElement === null || canvas === null || typeof window === 'undefined') {
      return undefined;
    }

    const audioContext = getSiteMusicAudioContext();
    if (audioContext === null) {
      return undefined;
    }

    let source = siteMusicSourceByElement.get(audioElement);
    if (source === undefined) {
      source = audioContext.createMediaElementSource(audioElement);
      siteMusicSourceByElement.set(audioElement, source);
    }
    if (!siteMusicOutputConnectedElements.has(audioElement)) {
      source.connect(audioContext.destination);
      siteMusicOutputConnectedElements.add(audioElement);
    }

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.78;
    source.connect(analyser);

    const frequencyData = new Uint8Array(analyser.frequencyBinCount);
    const visualFrequencyData = new Float32Array(analyser.frequencyBinCount);
    const particleCanvas = document.createElement('canvas');
    const particleContext = particleCanvas.getContext('2d');
    const particles: Particle[] = [];
    let frameId: number | null = null;
    let lastFrameTime = performance.now();
    let nextParticleSpawnTime = lastFrameTime + 150;

    const resizeCanvas = (): void => {
      const pixelRatio = Math.min(2, window.devicePixelRatio || 1);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * pixelRatio));
      canvas.height = Math.max(1, Math.round(rect.height * pixelRatio));
    };

    const readBin = (binIndex: number): number =>
      (visualFrequencyData[Math.min(visualFrequencyData.length - 1, Math.max(1, binIndex))] ?? 0) /
      255;

    const draw = (): void => {
      const frameTime = performance.now();
      const deltaSeconds = Math.min(0.05, Math.max(0.001, (frameTime - lastFrameTime) / 1000));
      lastFrameTime = frameTime;
      analyser.getByteFrequencyData(frequencyData);

      const isPausedFrame = !isPlayingRef.current;
      const frequencyEase = Math.min(1, deltaSeconds * (isPausedFrame ? 2.2 : 12));
      for (let index = 0; index < frequencyData.length; index += 1) {
        const target = isPausedFrame ? 0 : (frequencyData[index] ?? 0);
        visualFrequencyData[index] += (target - visualFrequencyData[index]) * frequencyEase;
      }

      const context = canvas.getContext('2d');
      if (context === null) {
        return;
      }

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width * 0.5;
      const centerY = height * 0.5;
      const size = Math.min(width, height);
      const baseRadius = size * 0.21;
      const particlePixelSize = Math.max(5, Math.round(size * 0.018));
      const particleScale = 1 / particlePixelSize;
      const barCount = 136;
      const trackDuration = durationRef.current;
      const trackProgress =
        Number.isFinite(trackDuration) && trackDuration > 0
          ? clampNumber(currentTimeRef.current / trackDuration, 0, 1)
          : 0;

      context.clearRect(0, 0, width, height);

      let bass = 0;
      let mid = 0;
      let treble = 0;
      for (let index = 1; index < 22; index += 1) {
        bass += visualFrequencyData[index] ?? 0;
      }
      for (let index = 22; index < 138; index += 1) {
        mid += visualFrequencyData[index] ?? 0;
      }
      for (let index = 138; index < 420; index += 1) {
        treble += visualFrequencyData[index] ?? 0;
      }
      bass /= 21 * 255;
      mid /= 116 * 255;
      treble /= 282 * 255;

      if (!isPausedFrame && frameTime >= nextParticleSpawnTime) {
        const spawnCount = Math.random() > 0.8 ? 2 : 1;
        for (let index = 0; index < spawnCount; index += 1) {
          const angle = Math.random() * Math.PI * 2;
          const speed = size * (0.07 + Math.random() * 0.08);
          const startDistance = size * (0.09 + Math.random() * 0.08);
          particles.push({
            age: 0,
            life: 4.4 + Math.random() * 3.1,
            renderAlpha: 0,
            size: size * (0.02 + Math.random() * 0.036),
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - size * (0.006 + Math.random() * 0.011),
            x: centerX + Math.cos(angle) * startDistance,
            y: centerY + Math.sin(angle) * startDistance,
          });
        }
        nextParticleSpawnTime = frameTime + 110 + Math.random() * 240;
      }

      if (particleContext !== null) {
        const particleWidth = Math.max(1, Math.ceil(width * particleScale));
        const particleHeight = Math.max(1, Math.ceil(height * particleScale));
        if (particleCanvas.width !== particleWidth || particleCanvas.height !== particleHeight) {
          particleCanvas.width = particleWidth;
          particleCanvas.height = particleHeight;
        }
        particleContext.clearRect(0, 0, particleWidth, particleHeight);
      }

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        particle.age += deltaSeconds * (isPausedFrame ? 2.3 : 1);
        if (particle.age >= particle.life) {
          particles.splice(index, 1);
          continue;
        }
        particle.x += particle.vx * deltaSeconds;
        particle.y += particle.vy * deltaSeconds;
        particle.vx *= 0.998;
        particle.vy *= 0.998;

        const lifeProgress = particle.age / particle.life;
        const fade = Math.sin(lifeProgress * Math.PI);
        const edgeFadeX = Math.min(
          1,
          particle.x / (width * 0.2),
          (width - particle.x) / (width * 0.2),
        );
        const edgeFadeY = Math.min(
          1,
          particle.y / (height * 0.2),
          (height - particle.y) / (height * 0.2),
        );
        const alpha = Math.max(0, fade * edgeFadeX * edgeFadeY) * (0.82 + mid * 0.12);
        particle.renderAlpha = alpha;
        if (alpha <= 0.001 || particleContext === null) {
          continue;
        }
        particleContext.save();
        particleContext.globalAlpha = Math.min(1, alpha);
        particleContext.fillStyle = '#79bdff';
        particleContext.beginPath();
        particleContext.arc(
          particle.x * particleScale,
          particle.y * particleScale,
          Math.max(1.4, particle.size * particleScale) * 0.62,
          0,
          Math.PI * 2,
        );
        particleContext.fill();
        particleContext.restore();
      }

      if (particleContext !== null) {
        context.save();
        context.imageSmoothingEnabled = false;
        context.drawImage(particleCanvas, 0, 0, width, height);
        context.restore();
      }

      context.beginPath();
      context.arc(centerX, centerY, baseRadius * 1.02, 0, Math.PI * 2);
      context.fillStyle = '#fff';
      context.fill();

      context.beginPath();
      context.arc(centerX, centerY, baseRadius + bass * size * 0.065, 0, Math.PI * 2);
      context.strokeStyle = `rgba(0, 0, 0, ${0.08 + bass * 0.18})`;
      context.lineWidth = Math.max(1, size * 0.012);
      context.stroke();

      for (let index = 0; index < barCount; index += 1) {
        const angle = (index / barCount) * Math.PI * 2 - Math.PI / 2;
        const normalizedIndex = index / (barCount - 1);
        const binIndex = Math.min(
          visualFrequencyData.length - 1,
          Math.max(1, Math.round(Math.pow(normalizedIndex, 1.42) * 560)),
        );
        const magnitude = (visualFrequencyData[binIndex] ?? 0) / 255;
        const lowSample = readBin(4 + ((index * 7) % 55));
        const midSample = readBin(48 + ((index * 19) % 240));
        const highSample = readBin(170 + ((index * 29) % 560));
        const circularLift =
          0.82 +
          ((Math.sin(angle * 5 + currentTimeRef.current * 1.7) + 1) / 2) * 0.2 +
          ((Math.sin(angle * 9 - currentTimeRef.current * 2.1) + 1) / 2) * 0.1;
        const harmonic =
          (magnitude * 0.58 +
            lowSample * 0.14 +
            midSample * 0.2 +
            highSample * 0.16 +
            bass * (1 - normalizedIndex) * 0.12 +
            mid * Math.sin(normalizedIndex * Math.PI) * 0.12 +
            treble * normalizedIndex * 0.14) *
          circularLift;
        const cappedHarmonic = clampNumber(harmonic, 0, 1);
        const barLength = size * (0.03 + Math.pow(cappedHarmonic, 1.18) * 0.27);
        const innerRadius = baseRadius + size * 0.018;
        const outerRadius = innerRadius + barLength;
        const x1 = centerX + Math.cos(angle) * innerRadius;
        const y1 = centerY + Math.sin(angle) * innerRadius;
        const x2 = centerX + Math.cos(angle) * outerRadius;
        const y2 = centerY + Math.sin(angle) * outerRadius;
        const alpha = 0.12 + Math.min(0.68, cappedHarmonic * 0.78);
        const lineWidth = Math.max(1, size * (0.004 + Math.max(magnitude, treble) * 0.004));

        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
        context.lineWidth = lineWidth;
        context.lineCap = 'round';
        context.stroke();

        const segmentDeltaX = x2 - x1;
        const segmentDeltaY = y2 - y1;
        const segmentLengthSquared = segmentDeltaX * segmentDeltaX + segmentDeltaY * segmentDeltaY;
        const segmentLength = Math.sqrt(segmentLengthSquared);
        if (segmentLength <= 0) {
          continue;
        }
        for (const particle of particles) {
          if (particle.renderAlpha <= 0.03) {
            continue;
          }
          const projection = clampNumber(
            ((particle.x - x1) * segmentDeltaX + (particle.y - y1) * segmentDeltaY) /
              segmentLengthSquared,
            0,
            1,
          );
          const closestX = x1 + segmentDeltaX * projection;
          const closestY = y1 + segmentDeltaY * projection;
          const distanceX = particle.x - closestX;
          const distanceY = particle.y - closestY;
          const invertRadius = particle.size * 0.78 + particlePixelSize * 1.15;
          const distanceSquared = distanceX * distanceX + distanceY * distanceY;
          if (distanceSquared > invertRadius * invertRadius) {
            continue;
          }
          const halfSegmentT = Math.sqrt(invertRadius * invertRadius - distanceSquared) / segmentLength;
          const startT = clampNumber(projection - halfSegmentT, 0, 1);
          const endT = clampNumber(projection + halfSegmentT, 0, 1);
          context.beginPath();
          context.moveTo(x1 + segmentDeltaX * startT, y1 + segmentDeltaY * startT);
          context.lineTo(x1 + segmentDeltaX * endT, y1 + segmentDeltaY * endT);
          context.strokeStyle = `rgba(255, 255, 255, ${Math.min(1, particle.renderAlpha * 1.1)})`;
          context.lineWidth = Math.max(1.2, lineWidth);
          context.lineCap = 'round';
          context.stroke();
        }
      }

      context.beginPath();
      context.arc(centerX, centerY, baseRadius * 0.45 + mid * size * 0.035, 0, Math.PI * 2);
      context.fillStyle = `rgba(0, 0, 0, ${0.04 + mid * 0.1})`;
      context.fill();

      if (trackProgress > 0) {
        const progressRingRadius = baseRadius * 0.72;
        const progressRingStart = -Math.PI / 2;
        const progressRingEnd =
          trackProgress >= 0.999
            ? progressRingStart + Math.PI * 2
            : progressRingStart + Math.PI * 2 * trackProgress;
        context.beginPath();
        context.arc(centerX, centerY, progressRingRadius, progressRingStart, progressRingEnd);
        context.strokeStyle = 'rgba(0, 0, 0, 0.62)';
        context.lineWidth = Math.max(2, size * 0.011);
        context.lineCap = trackProgress >= 0.999 ? 'butt' : 'round';
        context.stroke();
      }

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
        source.disconnect(analyser);
      } catch {
        // Ignore disconnect races during page changes.
      }
      analyser.disconnect();
    };
  }, [audioElement]);

  const seekFromPointer = (event: {
    clientX: number;
    clientY: number;
    currentTarget: HTMLElement;
  }): void => {
    if (!Number.isFinite(duration) || duration <= 0) {
      return;
    }
    onSeek(getPointerProgress(event) * duration);
  };

  const handleProgressPointerDown = (event: PointerEvent<HTMLButtonElement>): void => {
    event.currentTarget.setPointerCapture(event.pointerId);
    seekFromPointer(event);
  };

  const handleProgressPointerMove = (event: PointerEvent<HTMLButtonElement>): void => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      seekFromPointer(event);
    }
  };

  const releaseProgressPointer = (event: PointerEvent<HTMLButtonElement>): void => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div style={visualizerWrapStyle}>
      <canvas ref={canvasRef} style={visualizerCanvasStyle} aria-hidden="true" />
      <button
        type="button"
        aria-label="Seek current track"
        style={visualizerProgressHitAreaStyle}
        onPointerDown={handleProgressPointerDown}
        onPointerMove={handleProgressPointerMove}
        onPointerUp={releaseProgressPointer}
        onPointerCancel={releaseProgressPointer}
      />
      <button
        type="button"
        aria-label={isPlaying ? 'Pause current track' : 'Play current track'}
        className="site-music-visualizer-disk"
        style={{
          ...visualizerDiskStyle,
          animationPlayState: isPlaying ? 'running' : 'paused',
        }}
        onClick={onTogglePlay}
        disabled={audioElement === null}>
        <span style={visualizerDiskCenterStyle} aria-hidden="true" />
      </button>
      <style>{`
        @keyframes site-music-visualizer-disk-spin {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        .site-music-visualizer-disk {
          animation: site-music-visualizer-disk-spin 5.5s linear infinite;
        }
      `}</style>
    </div>
  );
}
