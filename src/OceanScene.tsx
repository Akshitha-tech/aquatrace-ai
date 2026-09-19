import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Text } from "@react-three/drei";
import { useEffect, useRef, type ReactNode } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

type OceanSceneProps = {
  onVesselClick?: () => void;
  onRiskZoneClick?: (zoneIndex: number) => void;
};

/* =========================
   OCEAN SURFACE
========================= */

/* =========================
   ANIMATED OCEAN SURFACE
========================= */

function OceanParallax({ children }: { children: ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const target = useRef(new THREE.Vector2());
  const reducedMotion = useRef(false);
  const { gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    const motionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const updateMotionPreference = () => {
      reducedMotion.current = motionQuery.matches;

      if (reducedMotion.current) {
        target.current.set(0, 0);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (reducedMotion.current || event.pointerType === "touch") {
        return;
      }

      const bounds = canvas.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      const y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;

      target.current.set(
        THREE.MathUtils.clamp(x, -1, 1),
        THREE.MathUtils.clamp(y, -1, 1)
      );
    };

    const handlePointerLeave = () => {
      target.current.set(0, 0);
    };

    updateMotionPreference();
    canvas.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    canvas.addEventListener("pointerleave", handlePointerLeave, {
      passive: true,
    });
    motionQuery.addEventListener("change", updateMotionPreference);

    return () => {
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      motionQuery.removeEventListener("change", updateMotionPreference);
    };
  }, [gl]);

  useFrame(() => {
    if (!group.current) return;

    const targetX = reducedMotion.current ? 0 : target.current.x;
    const targetY = reducedMotion.current ? 0 : target.current.y;

    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      targetY * -0.055,
      0.06
    );
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      targetX * 0.12,
      0.06
    );
    group.current.rotation.z = THREE.MathUtils.lerp(
      group.current.rotation.z,
      targetX * 0.012,
      0.06
    );
    group.current.position.x = THREE.MathUtils.lerp(
      group.current.position.x,
      targetX * 0.12,
      0.06
    );
    group.current.position.y = THREE.MathUtils.lerp(
      group.current.position.y,
      targetY * -0.06,
      0.06
    );
  });

  return <group ref={group}>{children}</group>;
}

function OceanSurface() {
  const meshRef =
    useRef<THREE.Mesh>(null);

  const geometry = new THREE.PlaneGeometry(
    22,
    18,
    100,
    100
  );

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const geometry =
      meshRef.current.geometry as THREE.PlaneGeometry;

    const position =
      geometry.attributes.position;

    const time = clock.elapsedTime;

    for (
      let i = 0;
      i < position.count;
      i++
    ) {
      const x = position.getX(i);
      const y = position.getY(i);

      const wave =
        Math.sin(
          x * 0.75 + time * 0.45
        ) *
        0.035;

      const wave2 =
        Math.cos(
          y * 0.9 + time * 0.35
        ) *
        0.025;

      position.setZ(
        i,
        wave + wave2
      );
    }

    position.needsUpdate = true;

    geometry.computeVertexNormals();
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      rotation={[
        -Math.PI / 2,
        0,
        0,
      ]}
      position={[0, -0.45, 0]}
    >
      <meshStandardMaterial
        color="#031827"
        metalness={0.4}
        roughness={0.38}
        transparent
        opacity={0.97}
      />
    </mesh>
  );
}

function OceanGlow() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;

    const material =
      ref.current.material as THREE.MeshBasicMaterial;

    material.opacity =
      0.035 +
      Math.sin(clock.elapsedTime * 0.7) * 0.012;
  });

  return (
    <mesh
      ref={ref}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.37, 0]}
    >
      <planeGeometry args={[19, 15]} />

      <meshBasicMaterial
        color="#087c91"
        transparent
        opacity={0.04}
        depthWrite={false}
      />
    </mesh>
  );
}

/* =========================
   OCEAN GRID
========================= */

function OceanGrid() {
  return (
    <gridHelper
      args={[22, 22, "#0b4050", "#072532"]}
      position={[0, -0.39, 0]}
    />
  );
}

/* =========================
   COASTLINE
========================= */

function Coastline() {
  const points = [
    new THREE.Vector3(-7, 0.02, -5),
    new THREE.Vector3(-6.4, 0.02, -4),
    new THREE.Vector3(-6.6, 0.02, -3),
    new THREE.Vector3(-6.1, 0.02, -2),
    new THREE.Vector3(-6.5, 0.02, -1),
    new THREE.Vector3(-5.8, 0.02, 0),
    new THREE.Vector3(-6.2, 0.02, 1),
    new THREE.Vector3(-5.7, 0.02, 2),
    new THREE.Vector3(-5.4, 0.02, 3),
    new THREE.Vector3(-4.8, 0.02, 4),
    new THREE.Vector3(-4.1, 0.02, 5.2),
  ];

  const curve =
    new THREE.CatmullRomCurve3(points);

  return (
    <mesh>
      <tubeGeometry
        args={[curve, 100, 0.035, 8, false]}
      />

      <meshBasicMaterial color="#43d9dd" />
    </mesh>
  );
}

/* =========================
   MARITIME BOUNDARY
========================= */

function MaritimeBoundary() {
  const points = [
    new THREE.Vector3(2, 0.04, -5),
    new THREE.Vector3(2.4, 0.04, -3.5),
    new THREE.Vector3(2.1, 0.04, -2),
    new THREE.Vector3(2.7, 0.04, -0.5),
    new THREE.Vector3(3, 0.04, 1),
    new THREE.Vector3(3.5, 0.04, 2.5),
    new THREE.Vector3(3.8, 0.04, 4),
    new THREE.Vector3(4.2, 0.04, 5),
  ];

  const curve =
    new THREE.CatmullRomCurve3(points);

  return (
    <mesh>
      <tubeGeometry
        args={[curve, 100, 0.025, 6, false]}
      />

      <meshBasicMaterial
        color="#ff786d"
        transparent
        opacity={0.75}
      />
    </mesh>
  );
}

/* =========================
   RISK ZONE
========================= */

/* =========================
   SMART AI RISK ZONE
========================= */

function RiskZone({
  position,
  scale,
  zoneIndex,
  onClick,
}: {
  position: [number, number, number];
  scale: number;
  zoneIndex: number;
  onClick?: (zoneIndex: number) => void;
}) {
  const core = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.Mesh>(null);
  const scan = useRef<THREE.Mesh>(null);

  const hovered = useRef(false);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    /* =========================
       CORE PULSE
    ========================= */

    if (core.current) {
      const pulse =
        1 +
        Math.sin(t * 3) * 0.12;

      const hoverBoost =
        hovered.current ? 1.2 : 1;

      core.current.scale.set(
        scale * pulse * hoverBoost,
        scale * pulse * hoverBoost,
        scale * pulse * hoverBoost
      );

      const material =
        core.current.material as THREE.MeshBasicMaterial;

      material.opacity =
        hovered.current
          ? 0.16
          : 0.08 +
            Math.sin(t * 3) * 0.025;
    }

    /* =========================
       OUTER GLOW
    ========================= */

    if (glow.current) {
      const pulse =
        1 +
        Math.sin(t * 2) * 0.18;

      const hoverBoost =
        hovered.current ? 1.3 : 1;

      glow.current.scale.set(
        scale * pulse * hoverBoost,
        scale * pulse * hoverBoost,
        scale * pulse * hoverBoost
      );

      const material =
        glow.current.material as THREE.MeshBasicMaterial;

      material.opacity =
        hovered.current
          ? 0.08
          : 0.035;
    }

    /* =========================
       RADAR SCAN
    ========================= */

    if (scan.current) {
      scan.current.rotation.z =
        t * 0.7;

      const material =
        scan.current.material as THREE.MeshBasicMaterial;

      material.opacity =
        hovered.current
          ? 0.3
          : 0.15 +
            Math.sin(t * 2.5) * 0.05;
    }
  });

  return (
    <group position={position}>

      {/* =========================
          RISK CORE
      ========================= */}

      <mesh
        ref={core}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        onPointerOver={(event) => {
          event.stopPropagation();

          hovered.current = true;

          document.body.style.cursor =
            "pointer";
        }}
        onPointerOut={(event) => {
          event.stopPropagation();

          hovered.current = false;

          document.body.style.cursor =
            "default";
        }}
        onClick={(event) => {
          event.stopPropagation();

          onClick?.(zoneIndex);
        }}
      >
        <circleGeometry
          args={[1, 64]}
        />

        <meshBasicMaterial
          color="#ff786d"
          transparent
          opacity={0.08}
          depthWrite={false}
        />
      </mesh>

      {/* =========================
          OUTER GLOW
      ========================= */}

      <mesh
        ref={glow}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        onPointerOver={(event) => {
          event.stopPropagation();

          hovered.current = true;

          document.body.style.cursor =
            "pointer";
        }}
        onPointerOut={(event) => {
          event.stopPropagation();

          hovered.current = false;

          document.body.style.cursor =
            "default";
        }}
        onClick={(event) => {
          event.stopPropagation();

          onClick?.(zoneIndex);
        }}
      >
        <circleGeometry
          args={[1, 64]}
        />

        <meshBasicMaterial
          color="#ff786d"
          transparent
          opacity={0.035}
          depthWrite={false}
        />
      </mesh>

      {/* =========================
          ROTATING SCAN SECTOR
      ========================= */}

      <mesh
        ref={scan}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        onPointerOver={(event) => {
          event.stopPropagation();

          hovered.current = true;

          document.body.style.cursor =
            "pointer";
        }}
        onPointerOut={(event) => {
          event.stopPropagation();

          hovered.current = false;

          document.body.style.cursor =
            "default";
        }}
        onClick={(event) => {
          event.stopPropagation();

          onClick?.(zoneIndex);
        }}
      >
        <circleGeometry
          args={[
            1.02,
            64,
            0,
            Math.PI / 3,
          ]}
        />

        <meshBasicMaterial
          color="#ff786d"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* =========================
          DETECTION POINT
      ========================= */}

      <mesh
        position={[0, 0.08, 0]}
        onPointerOver={(event) => {
          event.stopPropagation();

          hovered.current = true;

          document.body.style.cursor =
            "pointer";
        }}
        onPointerOut={(event) => {
          event.stopPropagation();

          hovered.current = false;

          document.body.style.cursor =
            "default";
        }}
        onClick={(event) => {
          event.stopPropagation();

          onClick?.(zoneIndex);
        }}
      >
        <sphereGeometry
          args={[0.09, 16, 16]}
        />

        <meshBasicMaterial
          color="#ff786d"
        />
      </mesh>

    </group>
  );
}

/* =========================
   RISK RINGS
========================= */

function RiskRing({
  position,
  scale,
}: {
  position: [number, number, number];
  scale: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;

    const pulse =
      1 +
      Math.sin(clock.elapsedTime * 2) * 0.12;

    ref.current.scale.set(
      scale * pulse,
      scale * pulse,
      scale * pulse
    );

    ref.current.rotation.z =
      clock.elapsedTime * 0.08;
  });

  return (
    <mesh
      ref={ref}
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <ringGeometry args={[0.72, 0.75, 64]} />

      <meshBasicMaterial
        color="#ff786d"
        transparent
        opacity={0.42}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* =========================
   HOTSPOT
========================= */

function Hotspot({
  position,
}: {
  position: [number, number, number];
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;

    const pulse =
      1 +
      Math.sin(clock.elapsedTime * 3) * 0.2;

    ref.current.scale.set(
      pulse,
      pulse,
      pulse
    );
  });

  return (
    <mesh position={position}>
      <sphereGeometry args={[0.08, 16, 16]} />

      <meshBasicMaterial color="#ff786d" />
    </mesh>
  );
}

/* =========================
   CURRENT LINE
========================= */

function CurrentLine({
  points,
}: {
  points: THREE.Vector3[];
}) {
  const curve =
    new THREE.CatmullRomCurve3(points);

  return (
    <mesh>
      <tubeGeometry
        args={[curve, 60, 0.012, 5, false]}
      />

      <meshBasicMaterial
        color="#43d9dd"
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}
/* =========================
   ANIMATED CURRENT PARTICLES
========================= */

function CurrentParticles({
  points,
  count = 8,
}: {
  points: THREE.Vector3[];
  count?: number;
}) {
  const curve = new THREE.CatmullRomCurve3(points);

  const particles = useRef<
    THREE.Mesh[]
  >([]);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;

    particles.current.forEach(
      (particle, index) => {
        if (!particle) return;

        const offset = index / count;

        const progress =
          (time * 0.08 + offset) % 1;

        const position =
          curve.getPointAt(progress);

        particle.position.copy(position);

        particle.position.y += 0.06;

        const pulse =
          0.8 +
          Math.sin(
            time * 3 + index
          ) *
            0.2;

        particle.scale.set(
          pulse,
          pulse,
          pulse
        );
      }
    );
  });

  return (
    <>
      {Array.from({ length: count }).map(
        (_, index) => (
          <mesh
            key={index}
            ref={(el) => {
              if (el) {
                particles.current[index] =
                  el;
              }
            }}
          >
            <sphereGeometry
              args={[0.045, 10, 10]}
            />

            <meshBasicMaterial
              color="#43d9dd"
              transparent
              opacity={0.9}
            />
          </mesh>
        )
      )}
    </>
  );
}

/* =========================
   PREDICTION ROUTE
========================= */

function PredictionRoute() {
  const points = [
    new THREE.Vector3(-3.8, 0.08, -3),
    new THREE.Vector3(-2, 0.08, -2),
    new THREE.Vector3(-0.2, 0.08, -0.5),
    new THREE.Vector3(1.5, 0.08, 1),
    new THREE.Vector3(3.5, 0.08, 2.5),
  ];

  const curve =
    new THREE.CatmullRomCurve3(points);

  return (
    <mesh>
      <tubeGeometry
        args={[curve, 100, 0.025, 8, false]}
      />

      <meshBasicMaterial color="#ff786d" />
    </mesh>
  );
}
/* =========================
   ANIMATED PREDICTION PARTICLES
========================= */

function PredictionParticles() {
  const points = [
    new THREE.Vector3(-3.8, 0.08, -3),
    new THREE.Vector3(-2, 0.08, -2),
    new THREE.Vector3(-0.2, 0.08, -0.5),
    new THREE.Vector3(1.5, 0.08, 1),
    new THREE.Vector3(3.5, 0.08, 2.5),
  ];

  const curve =
    new THREE.CatmullRomCurve3(points);

  const particles =
    useRef<THREE.Mesh[]>([]);

  const count = 7;

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;

    particles.current.forEach(
      (particle, index) => {
        if (!particle) return;

        const offset = index / count;

        const progress =
          (time * 0.12 + offset) % 1;

        const position =
          curve.getPointAt(progress);

        particle.position.copy(position);

        particle.position.y += 0.08;

        const pulse =
          0.75 +
          Math.sin(
            time * 4 + index
          ) * 0.25;

        particle.scale.set(
          pulse,
          pulse,
          pulse
        );
      }
    );
  });

  return (
    <>
      {Array.from({
        length: count,
      }).map((_, index) => (
        <mesh
          key={index}
          ref={(el) => {
            if (el) {
              particles.current[index] =
                el;
            }
          }}
        >
          <sphereGeometry
            args={[0.055, 12, 12]}
          />

          <meshBasicMaterial
            color="#ff786d"
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
    </>
  );
}

/* =========================
   ROUTE MARKER
========================= */

function RouteMarker({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.055, 12, 12]} />

      <meshBasicMaterial color="#ff786d" />
    </mesh>
  );
}

/* =========================
   MOVING PARTICLES
========================= */

function MovingParticles() {
  const particles =
    useRef<THREE.Points>(null);

  const positions =
    new Float32Array(90 * 3);

  for (let i = 0; i < 90; i++) {
    positions[i * 3] =
      (Math.random() - 0.5) * 18;

    positions[i * 3 + 1] =
      Math.random() * 0.2;

    positions[i * 3 + 2] =
      (Math.random() - 0.5) * 14;
  }

  useFrame(() => {
    if (!particles.current) return;

    particles.current.rotation.y +=
      0.0003;
  });

  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>

      <pointsMaterial
        color="#43d9dd"
        size={0.025}
        transparent
        opacity={0.6}
      />
    </points>
  );
}

/* =========================
   LIVE TRACKED VESSEL
========================= */

/* =========================
   LIVE TRACKED VESSEL
========================= */

/* =========================
   LIVE TRACKED VESSEL
========================= */

function Vessel({
  onClick,
}: {
  onClick?: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const beacon = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const trail = useRef<THREE.Mesh>(null);

  const hovered = useRef(false);

  useFrame(({ clock }) => {
    if (!group.current) return;

    const t = clock.elapsedTime;

    /* =========================
       VESSEL MOVEMENT
    ========================= */

    group.current.position.x =
      -1.8 +
      Math.sin(t * 0.18) * 0.35;

    group.current.position.z =
      -1.2 +
      Math.cos(t * 0.14) * 0.25;

    group.current.position.y =
      Math.sin(t * 1.2) * 0.025;

    group.current.rotation.y =
      Math.sin(t * 0.2) * 0.25;

    /* =========================
       SMOOTH HOVER SCALE
    ========================= */

    const targetScale =
      hovered.current ? 1.18 : 1;

    const currentScale =
      group.current.scale.x;

    const smoothScale =
      THREE.MathUtils.lerp(
        currentScale,
        targetScale,
        0.12
      );

    group.current.scale.set(
      smoothScale,
      smoothScale,
      smoothScale
    );

    /* =========================
       BEACON PULSE
    ========================= */

    if (beacon.current) {
      const pulse =
        1 +
        Math.sin(t * 4) * 0.35;

      const hoverBoost =
        hovered.current ? 1.35 : 1;

      beacon.current.scale.set(
        pulse * hoverBoost,
        pulse * hoverBoost,
        pulse * hoverBoost
      );

      const material =
        beacon.current.material as THREE.MeshBasicMaterial;

      material.opacity =
        hovered.current
          ? 0.28
          : 0.15 +
            Math.sin(t * 4) * 0.08;
    }

    /* =========================
       TRACKING RING
    ========================= */

    if (ring.current) {
      const pulse =
        1 +
        Math.sin(t * 2.5) * 0.12;

      const hoverBoost =
        hovered.current ? 1.25 : 1;

      ring.current.scale.set(
        pulse * hoverBoost,
        pulse * hoverBoost,
        pulse * hoverBoost
      );

      ring.current.rotation.z =
        t * 0.35;
    }

    /* =========================
       TRAIL ANIMATION
    ========================= */

    if (trail.current) {
      const material =
        trail.current.material as THREE.MeshBasicMaterial;

      material.opacity =
        hovered.current
          ? 0.18
          : 0.08 +
            Math.sin(t * 2) * 0.025;
    }
  });

  return (
    <group
      ref={group}

      /* =========================
         HOVER
      ========================= */

      onPointerOver={(event) => {
        event.stopPropagation();

        hovered.current = true;

        document.body.style.cursor =
          "pointer";
      }}

      onPointerOut={(event) => {
        event.stopPropagation();

        hovered.current = false;

        document.body.style.cursor =
          "default";
      }}

      /* =========================
         CLICK
      ========================= */

      onClick={(event) => {
        event.stopPropagation();

        onClick?.();
      }}
    >

      {/* Keep the moving vessel easy to select without changing its visuals. */}
      <mesh
        position={[0, 0.12, 0]}
        onPointerOver={(event) => {
          event.stopPropagation();

          hovered.current = true;
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(event) => {
          event.stopPropagation();

          hovered.current = false;
          document.body.style.cursor = "default";
        }}
        onClick={(event) => {
          event.stopPropagation();

          onClick?.();
        }}
      >
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {/* =========================
          VESSEL BODY
      ========================= */}

      <mesh>
        <boxGeometry
          args={[0.42, 0.1, 0.18]}
        />

        <meshStandardMaterial
          color="#ff786d"
          emissive="#ff786d"
          emissiveIntensity={0.7}
          metalness={0.35}
          roughness={0.3}
        />
      </mesh>

      {/* =========================
          VESSEL CABIN
      ========================= */}

      <mesh
        position={[0, 0.09, 0]}
      >
        <boxGeometry
          args={[0.16, 0.09, 0.13]}
        />

        <meshStandardMaterial
          color="#dffcff"
          emissive="#43d9dd"
          emissiveIntensity={0.35}
        />
      </mesh>

      {/* =========================
          VESSEL ANTENNA
      ========================= */}

      <mesh
        position={[0, 0.18, 0]}
      >
        <cylinderGeometry
          args={[
            0.008,
            0.008,
            0.12,
            8,
          ]}
        />

        <meshBasicMaterial
          color="#dffcff"
        />
      </mesh>

      {/* =========================
          TRACKING LIGHT
      ========================= */}

      <pointLight
        color="#ff786d"
        intensity={2}
        distance={2}
      />

      {/* =========================
          LOCATION BEACON
      ========================= */}

      <mesh
        ref={beacon}
        position={[0, 0.45, 0]}
      >
        <sphereGeometry
          args={[0.12, 20, 20]}
        />

        <meshBasicMaterial
          color="#ff786d"
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </mesh>

      {/* =========================
          TRACKING BEAM
      ========================= */}

      <mesh
        position={[0, 0.28, 0]}
      >
        <cylinderGeometry
          args={[
            0.012,
            0.045,
            0.55,
            16,
          ]}
        />

        <meshBasicMaterial
          color="#43d9dd"
          transparent
          opacity={0.28}
          depthWrite={false}
        />
      </mesh>

      {/* =========================
          TRACKING RING
      ========================= */}

      <mesh
        ref={ring}
        position={[0, 0.02, 0]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
      >
        <ringGeometry
          args={[
            0.38,
            0.405,
            48,
          ]}
        />

        <meshBasicMaterial
          color="#43d9dd"
          transparent
          opacity={0.55}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* =========================
          VESSEL TRAIL
      ========================= */}

      <mesh
        ref={trail}
        position={[
          0,
          -0.01,
          0.35,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
      >
        <planeGeometry
          args={[0.08, 0.7]}
        />

        <meshBasicMaterial
          color="#43d9dd"
          transparent
          opacity={0.1}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* =========================
          CLICK TARGET
      ========================= */}

      <mesh>
        <sphereGeometry
          args={[0.3, 16, 16]}
        />

        <meshBasicMaterial
          transparent
          opacity={0}
        />
      </mesh>

    </group>
  );
}

/* =========================
   INTELLIGENCE LABEL
========================= */

function IntelligenceLabel({
  text,
  position,
  color = "#43d9dd",
  size = 0.16,
}: {
  text: string;
  position: [number, number, number];
  color?: string;
  size?: number;
}) {
  return (
    <Text
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      fontSize={size}
      color={color}
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.015}
      outlineColor="#020b14"
      letterSpacing={0.08}
    >
      {text}
    </Text>
  );
}
/* =========================
   TELEMETRY MARKER
========================= */

function TelemetryMarker({
  label,
  value,
  position,
}: {
  label: string;
  value: string;
  position: [number, number, number];
}) {
  const dot = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!dot.current) return;

    const pulse =
      1 +
      Math.sin(
        clock.elapsedTime * 2.5
      ) *
        0.18;

    dot.current.scale.set(
      pulse,
      pulse,
      pulse
    );
  });

  return (
    <group position={position}>
      {/* DATA POINT */}

      <mesh ref={dot}>
        <sphereGeometry
          args={[0.055, 16, 16]}
        />

        <meshBasicMaterial
          color="#43d9dd"
        />
      </mesh>

      {/* VERTICAL DATA BEAM */}

      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry
          args={[
            0.006,
            0.006,
            0.44,
            8,
          ]}
        />

        <meshBasicMaterial
          color="#43d9dd"
          transparent
          opacity={0.28}
        />
      </mesh>

      {/* LABEL */}

      <Text
        position={[0.18, 0.28, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.085}
        color="#43d9dd"
        anchorX="left"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#020b14"
        letterSpacing={0.05}
      >
        {label}
      </Text>

      {/* VALUE */}

      <Text
        position={[0.18, 0.17, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.12}
        color="#ffffff"
        anchorX="left"
        anchorY="middle"
        outlineWidth={0.012}
        outlineColor="#020b14"
      >
        {value}
      </Text>
    </group>
  );
}
/* =========================
   3D NAVIGATION COMPASS
========================= */

function NavigationCompass() {
  const compass = useRef<THREE.Group>(null);
  const needle = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    if (compass.current) {
      compass.current.rotation.z =
        Math.sin(t * 0.15) * 0.04;
    }

    if (needle.current) {
      needle.current.rotation.z =
        Math.sin(t * 0.35) * 0.35;
    }
  });

  return (
    <group
      ref={compass}
      position={[5.2, 0.15, -3.6]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      {/* OUTER COMPASS RING */}

      <mesh>
        <ringGeometry
          args={[
            0.55,
            0.59,
            64,
          ]}
        />

        <meshBasicMaterial
          color="#43d9dd"
          transparent
          opacity={0.55}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* INNER RING */}

      <mesh>
        <ringGeometry
          args={[
            0.36,
            0.37,
            64,
          ]}
        />

        <meshBasicMaterial
          color="#43d9dd"
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* NORTH */}

      <Text
        position={[0, 0.78, 0]}
        fontSize={0.18}
        color="#ff786d"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.015}
        outlineColor="#020b14"
      >
        N
      </Text>

      {/* SOUTH */}

      <Text
        position={[0, -0.78, 0]}
        fontSize={0.13}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.012}
        outlineColor="#020b14"
      >
        S
      </Text>

      {/* EAST */}

      <Text
        position={[0.78, 0, 0]}
        fontSize={0.13}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.012}
        outlineColor="#020b14"
      >
        E
      </Text>

      {/* WEST */}

      <Text
        position={[-0.78, 0, 0]}
        fontSize={0.13}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.012}
        outlineColor="#020b14"
      >
        W
      </Text>

      {/* CENTER */}

      <mesh>
        <circleGeometry
          args={[0.08, 32]}
        />

        <meshBasicMaterial
          color="#43d9dd"
        />
      </mesh>

      {/* HEADING NEEDLE */}

      <mesh
        ref={needle}
        position={[0, 0.02, 0]}
      >
        <coneGeometry
          args={[
            0.08,
            0.34,
            3,
          ]}
        />

        <meshBasicMaterial
          color="#ff786d"
        />
      </mesh>
    </group>
  );
}

/* =========================
   RADAR SCAN
========================= */

function RadarScan() {
  const radar =
    useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!radar.current) return;

    radar.current.rotation.z =
      -clock.elapsedTime * 0.45;
  });

  return (
    <mesh
      ref={radar}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.30, 0]}
    >
      <circleGeometry
        args={[6.5, 64, 0, Math.PI / 5]}
      />

      <meshBasicMaterial
        color="#43d9dd"
        transparent
        opacity={0.055}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/* =========================
   MAIN SCENE
========================= */

function SceneContent({
  onVesselClick,
  onRiskZoneClick,
}: {
  onVesselClick?: () => void;
  onRiskZoneClick?: (
    zoneIndex: number
  ) => void;
}) {
  return (
    <>
      {/* =========================
    CINEMATIC LIGHTING
========================= */}

<ambientLight intensity={0.42} />

{/* MAIN MOONLIGHT */}

<directionalLight
  position={[5, 10, 6]}
  intensity={1.35}
  color="#dffcff"
/>

{/* CYAN OCEAN LIGHT */}

<pointLight
  position={[0, 3, 2]}
  color="#087c91"
  intensity={2.5}
  distance={16}
  decay={2}
/>

{/* CORAL ATMOSPHERE */}

<pointLight
  position={[3, 1.5, 1]}
  color="#ff786d"
  intensity={1.1}
  distance={8}
  decay={2}
/>

{/* SECONDARY CYAN LIGHT */}

<pointLight
  position={[-5, 1, -2]}
  color="#43d9dd"
  intensity={0.8}
  distance={10}
  decay={2}
/>

      <Stars
        radius={50}
        depth={30}
        count={1400}
        factor={1}
        saturation={0}
        fade
        speed={0.2}
      />

      <OceanSurface />

      <OceanGlow />

      <RadarScan />
      <NavigationCompass />
      {/* =========================
    LIVE TELEMETRY
========================= */}

<TelemetryMarker
  label="SEA TEMP"
  value="28.4°C"
  position={[-2.8, 0.08, 0.2]}
/>

<TelemetryMarker
  label="WIND"
  value="18 KT"
  position={[1.8, 0.08, -2.2]}
/>

<TelemetryMarker
  label="VISIBILITY"
  value="8.2 NM"
  position={[3.8, 0.08, 3.2]}
/>

<TelemetryMarker
  label="CURRENT"
  value="1.8 KT"
  position={[-3.5, 0.08, 2.8]}
/>

      {/* =========================
          MAP INTELLIGENCE LABELS
      ========================= */}

      <IntelligenceLabel
        text="BAY OF BENGAL"
        position={[0, -0.34, 0.8]}
        size={0.22}
      />

      <IntelligenceLabel
        text="CHENNAI"
        position={[-5.4, -0.34, -1.1]}
        color="#ffffff"
        size={0.13}
      />

      <IntelligenceLabel
        text="INDIA"
        position={[-6.1, -0.34, -3.4]}
        color="#ffffff"
        size={0.11}
      />

      <IntelligenceLabel
        text="MARITIME BOUNDARY"
        position={[3.8, -0.34, 0]}
        color="#ff786d"
        size={0.10}
      />

      <IntelligenceLabel
        text="VESSEL-042"
        position={[-1.8, 0.22, -1.55]}
        color="#ff786d"
        size={0.10}
      />

      <IntelligenceLabel
        text="RISK ZONE 01"
        position={[-4, -0.31, -2.65]}
        color="#ff786d"
        size={0.09}
      />

      <IntelligenceLabel
        text="RISK ZONE 02"
        position={[3.2, -0.31, 0.85]}
        color="#ff786d"
        size={0.09}
      />

      <IntelligenceLabel
        text="RISK ZONE 03"
        position={[0, -0.31, 3.35]}
        color="#ff786d"
        size={0.09}
      />

      <OceanGrid />

      <Coastline />

      <MaritimeBoundary />

      <PredictionRoute />
      <PredictionParticles />

      {/* CURRENT LINE 1 */}

      <CurrentLine
        points={[
          new THREE.Vector3(
            -5,
            0.08,
            3.5
          ),
          new THREE.Vector3(
            -2.5,
            0.08,
            2.5
          ),
          new THREE.Vector3(
            0,
            0.08,
            2.8
          ),
          new THREE.Vector3(
            3,
            0.08,
            3.5
          ),
        ]}
      />
      <CurrentParticles
  points={[
    new THREE.Vector3(
      -5,
      0.08,
      3.5
    ),
    new THREE.Vector3(
      -2.5,
      0.08,
      2.5
    ),
    new THREE.Vector3(
      0,
      0.08,
      2.8
    ),
    new THREE.Vector3(
      3,
      0.08,
      3.5
    ),
  ]}
  count={10}
/>

      {/* CURRENT LINE 2 */}

      <CurrentLine
        points={[
          new THREE.Vector3(
            -4.5,
            0.08,
            -4
          ),
          new THREE.Vector3(
            -2,
            0.08,
            -3.5
          ),
          new THREE.Vector3(
            0.5,
            0.08,
            -2.8
          ),
          new THREE.Vector3(
            3.5,
            0.08,
            -3
          ),
        ]}
      />
      <CurrentParticles
  points={[
    new THREE.Vector3(
      -4.5,
      0.08,
      -4
    ),
    new THREE.Vector3(
      -2,
      0.08,
      -3.5
    ),
    new THREE.Vector3(
      0.5,
      0.08,
      -2.8
    ),
    new THREE.Vector3(
      3.5,
      0.08,
      -3
    ),
  ]}
  count={10}
/>

      {/* =========================
          RISK ZONE 1
      ========================= */}

      <RiskZone
        position={[-4, -0.42, -2]}
        scale={1.3}
        zoneIndex={0}
        onClick={onRiskZoneClick}
      />

      <RiskRing
        position={[-4, -0.4, -2]}
        scale={1.3}
      />

      {/* =========================
          RISK ZONE 2
      ========================= */}

      <RiskZone
        position={[3.2, -0.41, 1.5]}
        scale={1.1}
        zoneIndex={1}
        onClick={onRiskZoneClick}
      />

      <RiskRing
        position={[3.2, -0.39, 1.5]}
        scale={1.1}
      />

      {/* =========================
          RISK ZONE 3
      ========================= */}

      <RiskZone
        position={[0, -0.4, 4]}
        scale={0.9}
        zoneIndex={2}
        onClick={onRiskZoneClick}
      />

      <RiskRing
        position={[0, -0.38, 4]}
        scale={0.9}
      />

      {/* HOTSPOTS */}

      <Hotspot
        position={[-2.5, 0.05, 1.5]}
      />

      <Hotspot
        position={[2.8, 0.05, -1]}
      />

      <Hotspot
        position={[0.5, 0.05, 3]}
      />

      {/* ROUTE MARKERS */}

      <RouteMarker
        position={[-2, 0.1, -2]}
      />

      <RouteMarker
        position={[-0.2, 0.1, -0.5]}
      />

      <RouteMarker
        position={[1.5, 0.1, 1]}
      />

      {/* PARTICLES */}

      <MovingParticles />

      {/* VESSEL */}

      <Vessel
        onClick={onVesselClick}
      />

      {/* CAMERA */}

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minDistance={7}
        maxDistance={18}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={
          Math.PI / 2.15
        }
      />
    </>
  );
}

/* =========================
   EXPORT
========================= */

export default function OceanScene({
  onVesselClick,
  onRiskZoneClick,
}: OceanSceneProps) {
  return (
    <Canvas
      camera={{
        position: [0, 8, 11],
        fov: 48,
      }}
      dpr={[1, 2]}
    >
      <color
        attach="background"
        args={["#020b14"]}
      />

      <fog
  attach="fog"
  args={["#020b14", 8, 21]}
/>

      <OceanParallax>
        <SceneContent
          onVesselClick={onVesselClick}
          onRiskZoneClick={
            onRiskZoneClick
          }
        />
      </OceanParallax>
    </Canvas>
  );
}