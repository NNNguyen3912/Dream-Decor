
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { MapControls, Environment, OrthographicCamera, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Grid, FurnitureType } from '../types';
import { GRID_SIZE, FURNITURE } from '../constants';

const WORLD_OFFSET = GRID_SIZE / 2;
const gridToWorld = (x: number, y: number) => [x - WORLD_OFFSET + 0.5, 0, y - WORLD_OFFSET + 0.5] as [number, number, number];

const getHash = (x: number, y: number) => Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;

const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const cylinderGeo = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
const sphereGeo = new THREE.SphereGeometry(0.5, 16, 16);

const Group = 'group' as any;
const Mesh = 'mesh' as any;
const MeshStandardMaterial = 'meshStandardMaterial' as any;
const PlaneGeometry = 'planeGeometry' as any;
const AmbientLight = 'ambientLight' as any;
const PointLight = 'pointLight' as any;
const GridHelper = 'gridHelper' as any;

const ProceduralFurniture = React.memo(({ type, baseColor, x, y, opacity = 1, transparent = false, tileRotation }: { type: FurnitureType, baseColor: string, x: number, y: number, opacity?: number, transparent?: boolean, tileRotation?: number }) => {
  const hash = getHash(x, y);
  const rotation = tileRotation !== undefined ? tileRotation * (Math.PI / 2) : Math.floor(hash * 4) * (Math.PI / 2);
  const color = useMemo(() => new THREE.Color(baseColor).offsetHSL(0, 0, hash * 0.05 - 0.025), [baseColor, hash]);

  const materialProps = { color, opacity, transparent, roughness: 0.7 };

  return (
    <Group rotation={[0, rotation, 0]}>
      {(() => {
        switch (type) {
          case FurnitureType.Seating:
            return (
              <Group position={[0, 0.2, 0]}>
                <Mesh geometry={boxGeo} scale={[0.8, 0.4, 0.7]}><meshStandardMaterial {...materialProps} /></Mesh>
                <Mesh geometry={boxGeo} position={[0, 0.35, -0.28]} scale={[0.8, 0.5, 0.15]}><meshStandardMaterial {...materialProps} /></Mesh>
              </Group>
            );
          case FurnitureType.Table:
            return (
              <Group position={[0, 0.3, 0]}>
                <Mesh geometry={boxGeo} scale={[0.6, 0.1, 0.6]}><meshStandardMaterial {...materialProps} /></Mesh>
                <Mesh geometry={boxGeo} position={[0, -0.15, 0]} scale={[0.1, 0.3, 0.1]}><meshStandardMaterial color="#444" /></Mesh>
              </Group>
            );
          case FurnitureType.LargeTable:
            return (
              <Group position={[0, 0.35, 0]}>
                <Mesh geometry={boxGeo} scale={[0.95, 0.1, 0.6]}><meshStandardMaterial {...materialProps} /></Mesh>
                {[0.4, -0.4].map(px => [0.2, -0.2].map(pz => (
                  <Mesh key={`${px}-${pz}`} geometry={boxGeo} position={[px, -0.17, pz]} scale={[0.05, 0.35, 0.05]}><meshStandardMaterial color="#333" /></Mesh>
                )))}
              </Group>
            );
          case FurnitureType.Bed:
            return (
              <Group position={[0, 0.2, 0]}>
                <Mesh geometry={boxGeo} scale={[0.8, 0.3, 0.95]}><meshStandardMaterial {...materialProps} /></Mesh>
                <Mesh geometry={boxGeo} position={[0, 0.2, -0.35]} scale={[0.6, 0.1, 0.2]}><meshStandardMaterial color="#fefefe" /></Mesh>
                <Mesh geometry={boxGeo} position={[0, 0.2, 0.1]} scale={[0.8, 0.05, 0.6]}><meshStandardMaterial color="#eee" /></Mesh>
              </Group>
            );
          case FurnitureType.Storage:
            return (
              <Group position={[0, 0.4, 0]}>
                <Mesh geometry={boxGeo} scale={[0.8, 0.8, 0.4]}><meshStandardMaterial {...materialProps} /></Mesh>
                <Mesh geometry={boxGeo} position={[0.2, 0, 0.18]} scale={[0.05, 0.1, 0.05]}><meshStandardMaterial color="#222" /></Mesh>
              </Group>
            );
          case FurnitureType.Bookshelf:
            return (
              <Group position={[0, 0.7, 0]}>
                <Mesh geometry={boxGeo} scale={[0.9, 1.4, 0.3]}><meshStandardMaterial {...materialProps} /></Mesh>
                {[-0.4, -0.1, 0.2, 0.5].map(py => (
                  <Mesh key={py} geometry={boxGeo} position={[0, py, 0.1]} scale={[0.8, 0.05, 0.25]}><meshStandardMaterial color="#111" /></Mesh>
                ))}
              </Group>
            );
          case FurnitureType.Electronics: // TV
            return (
              <Group position={[0, 0.4, 0]}>
                <Mesh geometry={boxGeo} scale={[0.8, 0.5, 0.1]}><meshStandardMaterial color="#111" /></Mesh>
                <Mesh geometry={boxGeo} position={[0, -0.25, 0]} scale={[0.3, 0.1, 0.3]}><meshStandardMaterial color="#333" /></Mesh>
                <Mesh geometry={boxGeo} position={[0, 0, 0.06]} scale={[0.7, 0.4, 0.01]}><meshStandardMaterial color="#222" emissive="#111" /></Mesh>
              </Group>
            );
          case FurnitureType.Wall:
            return (
              <Group position={[0, 0.8, 0]}>
                <Mesh geometry={boxGeo} scale={[1, 1.6, 0.15]}><meshStandardMaterial {...materialProps} /></Mesh>
              </Group>
            );
          case FurnitureType.Window:
            return (
              <Group position={[0, 0.8, 0]}>
                <Mesh geometry={boxGeo} position={[0, 0.5, 0]} scale={[1, 0.6, 0.15]}><meshStandardMaterial {...materialProps} /></Mesh>
                <Mesh geometry={boxGeo} position={[0, -0.5, 0]} scale={[1, 0.6, 0.15]}><meshStandardMaterial {...materialProps} /></Mesh>
                <Mesh geometry={boxGeo} position={[0.4, 0, 0]} scale={[0.2, 0.4, 0.15]}><meshStandardMaterial {...materialProps} /></Mesh>
                <Mesh geometry={boxGeo} position={[-0.4, 0, 0]} scale={[0.2, 0.4, 0.15]}><meshStandardMaterial {...materialProps} /></Mesh>
                <Mesh geometry={boxGeo} position={[0, 0, 0]} scale={[0.6, 0.4, 0.05]}><meshStandardMaterial color="#a2d2ff" transparent opacity={0.6} /></Mesh>
              </Group>
            );
          case FurnitureType.Door:
            return (
              <Group position={[0, 0.7, 0]}>
                <Mesh geometry={boxGeo} position={[0, 0.6, 0]} scale={[1, 0.2, 0.15]}><meshStandardMaterial {...materialProps} /></Mesh>
                <Mesh geometry={boxGeo} position={[0, -0.1, 0]} scale={[0.8, 1.2, 0.1]}><meshStandardMaterial color="#5e3023" /></Mesh>
                <Mesh geometry={sphereGeo} position={[0.3, -0.1, 0.06]} scale={[0.05, 0.05, 0.05]}><meshStandardMaterial color="gold" /></Mesh>
              </Group>
            );
          case FurnitureType.Decor:
            return (
              <Group position={[0, 0.2, 0]}>
                <Mesh geometry={cylinderGeo} scale={[0.3, 0.4, 0.3]}><meshStandardMaterial color="#b08968" /></Mesh>
                <Mesh geometry={sphereGeo} position={[0, 0.4, 0]} scale={[0.4, 0.5, 0.4]}><meshStandardMaterial color="#588157" /></Mesh>
              </Group>
            );
          case FurnitureType.Flooring:
            return (
              <Mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <PlaneGeometry args={[0.98, 0.98]} />
                <MeshStandardMaterial {...materialProps} />
              </Mesh>
            );
          case FurnitureType.Chair:
            return (
              <Group position={[0, 0.2, 0]}>
                {/* Mặt ghế */}
                <Mesh geometry={boxGeo} scale={[0.4, 0.08, 0.4]}><meshStandardMaterial {...materialProps} /></Mesh>
                {/* Lưng ghế */}
                <Mesh geometry={boxGeo} position={[0, 0.25, -0.18]} scale={[0.4, 0.4, 0.05]}><meshStandardMaterial {...materialProps} /></Mesh>
                {/* 4 chân */}
                <Mesh geometry={boxGeo} position={[0.15, -0.15, 0.15]} scale={[0.05, 0.3, 0.05]}><meshStandardMaterial color="#333" /></Mesh>
                <Mesh geometry={boxGeo} position={[-0.15, -0.15, 0.15]} scale={[0.05, 0.3, 0.05]}><meshStandardMaterial color="#333" /></Mesh>
                <Mesh geometry={boxGeo} position={[0.15, -0.15, -0.15]} scale={[0.05, 0.3, 0.05]}><meshStandardMaterial color="#333" /></Mesh>
                <Mesh geometry={boxGeo} position={[-0.15, -0.15, -0.15]} scale={[0.05, 0.3, 0.05]}><meshStandardMaterial color="#333" /></Mesh>
              </Group>
            );
          case FurnitureType.Stove:
            return (
              <Group position={[0, 0.35, 0]}>
                {/* Thân bếp */}
                <Mesh geometry={boxGeo} scale={[0.8, 0.7, 0.6]}><meshStandardMaterial {...materialProps} /></Mesh>
                {/* Mặt bếp */}
                <Mesh geometry={boxGeo} position={[0, 0.36, 0]} scale={[0.82, 0.02, 0.62]}><meshStandardMaterial color="#222" /></Mesh>
                {/* Vòng bếp */}
                <Mesh geometry={cylinderGeo} position={[-0.2, 0.38, 0.1]} scale={[0.15, 0.02, 0.15]}><meshStandardMaterial color="#444" /></Mesh>
                <Mesh geometry={cylinderGeo} position={[0.2, 0.38, 0.1]} scale={[0.15, 0.02, 0.15]}><meshStandardMaterial color="#444" /></Mesh>
                <Mesh geometry={cylinderGeo} position={[-0.2, 0.38, -0.15]} scale={[0.12, 0.02, 0.12]}><meshStandardMaterial color="#444" /></Mesh>
                <Mesh geometry={cylinderGeo} position={[0.2, 0.38, -0.15]} scale={[0.12, 0.02, 0.12]}><meshStandardMaterial color="#444" /></Mesh>
              </Group>
            );
          case FurnitureType.Oven:
            return (
              <Group position={[0, 0.35, 0]}>
                {/* Thân lò */}
                <Mesh geometry={boxGeo} scale={[0.7, 0.7, 0.6]}><meshStandardMaterial {...materialProps} /></Mesh>
                {/* Cửa lò */}
                <Mesh geometry={boxGeo} position={[0, -0.05, 0.31]} scale={[0.5, 0.4, 0.02]}><meshStandardMaterial color="#333" /></Mesh>
                {/* Kính lò */}
                <Mesh geometry={boxGeo} position={[0, -0.05, 0.32]} scale={[0.4, 0.3, 0.01]}><meshStandardMaterial color="#666" transparent opacity={0.7} /></Mesh>
                {/* Tay nắm */}
                <Mesh geometry={boxGeo} position={[0, 0.2, 0.32]} scale={[0.3, 0.03, 0.03]}><meshStandardMaterial color="#888" /></Mesh>
                {/* Bảng điều khiển */}
                <Mesh geometry={boxGeo} position={[0, 0.3, 0.31]} scale={[0.6, 0.08, 0.02]}><meshStandardMaterial color="#111" /></Mesh>
              </Group>
            );
          case FurnitureType.Fridge:
            return (
              <Group position={[0, 0.7, 0]}>
                {/* Thân tủ lạnh */}
                <Mesh geometry={boxGeo} scale={[0.7, 1.4, 0.6]}><meshStandardMaterial {...materialProps} /></Mesh>
                {/* Cửa trên (ngăn đá) */}
                <Mesh geometry={boxGeo} position={[0, 0.45, 0.31]} scale={[0.68, 0.45, 0.02]}><meshStandardMaterial color="#d0d0d0" /></Mesh>
                {/* Cửa dưới (ngăn mát) */}
                <Mesh geometry={boxGeo} position={[0, -0.2, 0.31]} scale={[0.68, 0.85, 0.02]}><meshStandardMaterial color="#d0d0d0" /></Mesh>
                {/* Tay nắm */}
                <Mesh geometry={boxGeo} position={[0.28, 0.45, 0.33]} scale={[0.03, 0.15, 0.03]}><meshStandardMaterial color="#888" /></Mesh>
                <Mesh geometry={boxGeo} position={[0.28, -0.2, 0.33]} scale={[0.03, 0.25, 0.03]}><meshStandardMaterial color="#888" /></Mesh>
              </Group>
            );
          case FurnitureType.WashingMachine:
            return (
              <Group position={[0, 0.35, 0]}>
                {/* Thân máy */}
                <Mesh geometry={boxGeo} scale={[0.7, 0.7, 0.6]}><meshStandardMaterial {...materialProps} /></Mesh>
                {/* Cửa tròn */}
                <Mesh geometry={cylinderGeo} position={[0, 0, 0.31]} rotation={[Math.PI / 2, 0, 0]} scale={[0.25, 0.02, 0.25]}><meshStandardMaterial color="#aaa" /></Mesh>
                {/* Kính cửa */}
                <Mesh geometry={cylinderGeo} position={[0, 0, 0.32]} rotation={[Math.PI / 2, 0, 0]} scale={[0.2, 0.01, 0.2]}><meshStandardMaterial color="#333" transparent opacity={0.6} /></Mesh>
                {/* Bảng điều khiển */}
                <Mesh geometry={boxGeo} position={[0, 0.3, 0.31]} scale={[0.6, 0.08, 0.02]}><meshStandardMaterial color="#ddd" /></Mesh>
                {/* Nút */}
                <Mesh geometry={cylinderGeo} position={[0.2, 0.3, 0.33]} rotation={[Math.PI / 2, 0, 0]} scale={[0.04, 0.02, 0.04]}><meshStandardMaterial color="#444" /></Mesh>
              </Group>
            );
          case FurnitureType.Speaker:
            return (
              <Group position={[0, 0.3, 0]}>
                {/* Thân loa */}
                <Mesh geometry={boxGeo} scale={[0.3, 0.6, 0.25]}><meshStandardMaterial {...materialProps} /></Mesh>
                {/* Loa tròn lớn */}
                <Mesh geometry={cylinderGeo} position={[0, 0.1, 0.13]} rotation={[Math.PI / 2, 0, 0]} scale={[0.1, 0.02, 0.1]}><meshStandardMaterial color="#333" /></Mesh>
                {/* Loa tròn nhỏ */}
                <Mesh geometry={cylinderGeo} position={[0, -0.15, 0.13]} rotation={[Math.PI / 2, 0, 0]} scale={[0.06, 0.02, 0.06]}><meshStandardMaterial color="#222" /></Mesh>
              </Group>
            );
          case FurnitureType.Lamp:
            return (
              <Group position={[0, 0.4, 0]}>
                {/* Chân đèn */}
                <Mesh geometry={cylinderGeo} position={[0, -0.3, 0]} scale={[0.08, 0.4, 0.08]}><meshStandardMaterial color="#8b7355" /></Mesh>
                {/* Đế đèn */}
                <Mesh geometry={cylinderGeo} position={[0, -0.5, 0]} scale={[0.15, 0.02, 0.15]}><meshStandardMaterial color="#5c4033" /></Mesh>
                {/* Chao đèn */}
                <Mesh geometry={cylinderGeo} position={[0, 0.1, 0]} scale={[0.25, 0.2, 0.25]}><meshStandardMaterial {...materialProps} transparent opacity={0.9} /></Mesh>
                {/* Bóng đèn (sáng) */}
                <Mesh geometry={sphereGeo} position={[0, 0, 0]} scale={[0.08, 0.1, 0.08]}><meshStandardMaterial color="#fffacd" emissive="#ffd700" emissiveIntensity={0.5} /></Mesh>
              </Group>
            );
          case FurnitureType.Bathtub:
            return (
              <Group position={[0, 0.25, 0]}>
                {/* Thân bồn tắm */}
                <Mesh geometry={boxGeo} scale={[0.9, 0.4, 0.5]}><meshStandardMaterial {...materialProps} /></Mesh>
                {/* Phần trong bồn (nước) */}
                <Mesh geometry={boxGeo} position={[0, 0.05, 0]} scale={[0.8, 0.3, 0.4]}><meshStandardMaterial color="#87ceeb" transparent opacity={0.6} /></Mesh>
                {/* Vòi nước */}
                <Mesh geometry={cylinderGeo} position={[0.35, 0.3, 0]} scale={[0.03, 0.15, 0.03]}><meshStandardMaterial color="#c0c0c0" /></Mesh>
                <Mesh geometry={sphereGeo} position={[0.35, 0.38, 0]} scale={[0.05, 0.05, 0.05]}><meshStandardMaterial color="#c0c0c0" /></Mesh>
              </Group>
            );
          default: return null;
        }
      })()}
    </Group>
  );
});

const InteractionPlane = ({ onHover, onClick }: { onHover: (pos: { x: number, y: number } | null) => void, onClick: (x: number, y: number) => void }) => {
  const handlePointerMove = useCallback((e: any) => {
    e.stopPropagation();
    const x = Math.floor(e.point.x + WORLD_OFFSET);
    const y = Math.floor(e.point.z + WORLD_OFFSET);
    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
      onHover({ x, y });
    } else {
      onHover(null);
    }
  }, [onHover]);

  const handlePointerDown = useCallback((e: any) => {
    e.stopPropagation();
    const x = Math.floor(e.point.x + WORLD_OFFSET);
    const y = Math.floor(e.point.z + WORLD_OFFSET);
    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE && e.button === 0) {
      onClick(x, y);
    }
  }, [onClick]);

  return (
    <Mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.01, 0]}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerOut={() => onHover(null)}
    >
      <PlaneGeometry args={[GRID_SIZE, GRID_SIZE]} />
      <MeshStandardMaterial color="#1e293b" />
    </Mesh>
  );
};

const IsoMap: React.FC<{ grid: Grid, onTileClick: (x: number, y: number) => void, hoveredTool: FurnitureType, onHoverChange?: (pos: { x: number, y: number } | null) => void }> = ({ grid, onTileClick, hoveredTool, onHoverChange }) => {
  const [hoveredTile, setHoveredTile] = useState<{ x: number, y: number } | null>(null);

  const handleHover = useCallback((pos: { x: number, y: number } | null) => {
    setHoveredTile(pos);
    onHoverChange?.(pos);
  }, [onHoverChange]);

  const priceTag = useMemo(() => {
    if (!hoveredTile || hoveredTool === FurnitureType.None) return null;
    const config = FURNITURE[hoveredTool];
    return (
      <Html position={[0, 1.8, 0]} center pointerEvents="none">
        <div className="bg-emerald-600 text-white font-bold text-[12px] px-2 py-1 rounded shadow-lg border border-emerald-400 whitespace-nowrap animate-in fade-in zoom-in duration-200">
          ${config.cost}
        </div>
      </Html>
    );
  }, [hoveredTile, hoveredTool]);

  return (
    <div className="absolute inset-0 bg-[#0f172a] touch-none">
      <Canvas shadows dpr={[1, 2]}>
        <OrthographicCamera makeDefault zoom={60} position={[15, 15, 15]} />
        <MapControls enableRotate={true} target={[0, 0, 0]} />

        <AmbientLight intensity={0.7} />
        <PointLight position={[10, 15, 10]} intensity={2.5} castShadow />
        <Environment preset="city" />

        <GridHelper args={[GRID_SIZE, GRID_SIZE, "#475569", "#334155"]} position={[0, 0.01, 0]} />

        <InteractionPlane onHover={handleHover} onClick={onTileClick} />

        <Group>
          {grid.map((row, y) => row.map((tile, x) => (
            tile.furnitureType !== FurnitureType.None && (
              <Group key={`${x}-${y}`} position={gridToWorld(x, y)}>
                <ProceduralFurniture type={tile.furnitureType} baseColor={FURNITURE[tile.furnitureType].color} x={x} y={y} tileRotation={tile.rotation} />
              </Group>
            )
          )))}

          {hoveredTile && hoveredTool !== FurnitureType.None && grid[hoveredTile.y]?.[hoveredTile.x]?.furnitureType === FurnitureType.None && (
            <Group position={gridToWorld(hoveredTile.x, hoveredTile.y)}>
              <ProceduralFurniture type={hoveredTool} baseColor={FURNITURE[hoveredTool].color} x={hoveredTile.x} y={hoveredTile.y} transparent opacity={0.5} />
              {priceTag}
            </Group>
          )}
        </Group>

        <ContactShadows opacity={0.4} scale={20} blur={2} far={10} color="#000000" />
      </Canvas>
    </div>
  );
};

export default IsoMap;
