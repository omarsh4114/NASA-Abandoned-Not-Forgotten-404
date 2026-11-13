import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

export type ArrowDirection = 'left' | 'right' | 'up' | 'down';

// Module-level shared virtual D-pad state so the on-screen UI pad and R3F useFrame loop communicate with zero re-renders
const virtualPadState: Record<ArrowDirection, boolean> = {
  left: false,
  right: false,
  up: false,
  down: false,
};

export function setVirtualArrowPadState(dir: ArrowDirection, pressed: boolean): void {
  virtualPadState[dir] = pressed;
}

interface ArrowCameraControllerProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  onUserInteract?: () => void;
}

export const ArrowCameraController: React.FC<ArrowCameraControllerProps> = ({
  controlsRef,
  onUserInteract,
}) => {
  const { camera } = useThree();

  const keysRef = useRef<{
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    shift: boolean;
  }>({
    left: false,
    right: false,
    up: false,
    down: false,
    shift: false,
  });

  const sphericalRef = useRef(new THREE.Spherical());
  const offsetRef = useRef(new THREE.Vector3());

  useEffect(() => {
    const isInputFocused = (target: EventTarget | null): boolean => {
      const tag = (target as HTMLElement | null)?.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInputFocused(e.target)) return;

      keysRef.current.shift = e.shiftKey;

      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          keysRef.current.left = true;
          break;
        case 'ArrowRight':
        case 'KeyD':
          keysRef.current.right = true;
          break;
        case 'ArrowUp':
        case 'KeyW':
          keysRef.current.up = true;
          if (e.code === 'ArrowUp') e.preventDefault();
          break;
        case 'ArrowDown':
        case 'KeyS':
          keysRef.current.down = true;
          if (e.code === 'ArrowDown') e.preventDefault();
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keysRef.current.shift = true;
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.shift = e.shiftKey;

      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          keysRef.current.left = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          keysRef.current.right = false;
          break;
        case 'ArrowUp':
        case 'KeyW':
          keysRef.current.up = false;
          break;
        case 'ArrowDown':
        case 'KeyS':
          keysRef.current.down = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keysRef.current.shift = false;
          break;
        default:
          break;
      }
    };

    const handleBlur = () => {
      keysRef.current.left = false;
      keysRef.current.right = false;
      keysRef.current.up = false;
      keysRef.current.down = false;
      keysRef.current.shift = false;
      virtualPadState.left = false;
      virtualPadState.right = false;
      virtualPadState.up = false;
      virtualPadState.down = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    const moveLeft = keysRef.current.left || virtualPadState.left;
    const moveRight = keysRef.current.right || virtualPadState.right;
    const moveUp = keysRef.current.up || virtualPadState.up;
    const moveDown = keysRef.current.down || virtualPadState.down;
    const isShift = keysRef.current.shift;

    if (!moveLeft && !moveRight && !moveUp && !moveDown) {
      return;
    }

    // Cancel any programmatic transition lerp so keyboard/pad input has immediate priority
    onUserInteract?.();

    const dt = Math.min(delta, 0.1);
    const offset = offsetRef.current.copy(camera.position).sub(controls.target);
    const spherical = sphericalRef.current.setFromVector3(offset);

    // 1. Horizontal Orbit (ArrowLeft / ArrowRight at 1.4 rad/s)
    const azimuthSpeed = 1.4;
    if (moveLeft) {
      spherical.theta += azimuthSpeed * dt;
    }
    if (moveRight) {
      spherical.theta -= azimuthSpeed * dt;
    }

    // 2. Vertical Elevation (Shift + ArrowUp / Shift + ArrowDown) OR Zoom (ArrowUp / ArrowDown)
    if (isShift) {
      const polarSpeed = 1.05;
      if (moveUp) {
        spherical.phi -= polarSpeed * dt;
      }
      if (moveDown) {
        spherical.phi += polarSpeed * dt;
      }
    } else {
      const zoomFactor = 1.35 * dt;
      if (moveUp) {
        spherical.radius *= Math.max(0.5, 1 - zoomFactor);
      }
      if (moveDown) {
        spherical.radius *= 1 + zoomFactor;
      }
    }

    // Clamp polar angle above the ground plane and radius within [minDistance, maxDistance]
    const minPolar = controls.minPolarAngle ?? 0.08;
    const maxPolar = controls.maxPolarAngle ?? Math.PI * 0.48;
    spherical.phi = THREE.MathUtils.clamp(spherical.phi, minPolar, maxPolar);

    const minDist = Math.max(0.5, controls.minDistance ?? 1.5);
    const maxDist = Math.max(minDist + 1, controls.maxDistance ?? 165);
    spherical.radius = THREE.MathUtils.clamp(spherical.radius, minDist, maxDist);
    spherical.makeSafe();

    offset.setFromSpherical(spherical);
    camera.position.copy(controls.target).add(offset);
    controls.update();
  });

  return null;
};

/**
 * Minimal On-Screen Arrow Pad (bottom-right corner) that triggers the exact same smooth
 * frame-rate-independent camera movement on pointer hold.
 */
export const OnScreenArrowPad: React.FC = () => {
  const bindHold = (dir: ArrowDirection) => ({
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      setVirtualArrowPadState(dir, true);
    },
    onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      setVirtualArrowPadState(dir, false);
    },
    onPointerCancel: () => {
      setVirtualArrowPadState(dir, false);
    },
    onPointerLeave: () => {
      setVirtualArrowPadState(dir, false);
    },
  });

  const btnClass =
    'flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.04] text-slate-300 hover:bg-white/[0.12] hover:text-white active:bg-[#38BDF8] active:text-[#090B0E] transition cursor-pointer select-none touch-none';

  return (
    <div
      className="pointer-events-auto fixed bottom-[140px] right-4 2xl:bottom-4 z-30 flex flex-col items-center gap-1 rounded-lg border border-white/10 bg-[#11141A]/75 p-1 backdrop-blur-md shadow-xl"
      title="Camera Navigation (Arrow Keys or WASD · Hold Shift + Up/Down for Tilt)"
    >
      <button
        type="button"
        aria-label="Zoom In (Up Arrow)"
        className={btnClass}
        {...bindHold('up')}
      >
        <ArrowUp className="h-3.5 w-3.5" />
      </button>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Orbit Left (Left Arrow)"
          className={btnClass}
          {...bindHold('left')}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label="Zoom Out (Down Arrow)"
          className={btnClass}
          {...bindHold('down')}
        >
          <ArrowDown className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label="Orbit Right (Right Arrow)"
          className={btnClass}
          {...bindHold('right')}
        >
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
