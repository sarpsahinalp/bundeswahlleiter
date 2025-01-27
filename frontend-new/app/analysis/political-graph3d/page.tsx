// app/political-analysis/page.tsx
'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import { useState, useMemo } from 'react';
import * as THREE from 'three';

interface SocioCulturalStats {
  winningParty: number;
  type: string;
  svbInsgesamt: number;
  svbLandwFischerei: number;
  svbProduzGewerbe: number;
  svbHandelGastVerkehr: number;
  svbDienstleister: number;
  svbUebrigeDienstleister: number;
  alterUnter18: number;
  alter1824: number;
  alter2534: number;
  alter3559: number;
  alter6074: number;
  alter75Plus: number;
  alqFrauen: number;
  alq1524: number;
  alq5564: number;
  alqInsgesamt: number;
  alqMaenner: number;
}

const partyColors: { [key: number]: string } = {
  1: '#FF6B6B', // Party 1
  2: '#4ECDC4', // Party 2
  3: '#45B7D1', // Party 3
  4: '#96CEB4', // Party 4
  5: '#FFEEAD', // Party 5
};

const axisOptions = [
  { key: 'svbInsgesamt', label: 'Total Businesses' },
  { key: 'alter3559', label: 'Middle Age (35-59)' },
  { key: 'alqInsgesamt', label: 'Unemployment Rate' },
  { key: 'svbDienstleister', label: 'Service Sector' },
  { key: 'alter75Plus', label: 'Seniors (75+)' },
  { key: 'alq1524', label: 'Youth Unemployment' },
];

export default function PoliticalAnalysisPage() {
  const [selectedAxes, setSelectedAxes] = useState({
    x: 'svbInsgesamt',
    y: 'alter3559',
    z: 'alqInsgesamt',
  });

  // Sample data - replace with your actual data
  const sampleData: SocioCulturalStats[] = [
    // Urban Centers (Party 1 strongholds)
    {
      winningParty: 1,
      type: 'Metropolis A',
      svbInsgesamt: 2450,
      svbLandwFischerei: 30,
      svbProduzGewerbe: 400,
      svbHandelGastVerkehr: 850,
      svbDienstleister: 1100,
      svbUebrigeDienstleister: 300,
      alterUnter18: 15,
      alter1824: 12,
      alter2534: 18,
      alter3559: 38,
      alter6074: 12,
      alter75Plus: 5,
      alqFrauen: 4.8,
      alq1524: 7.5,
      alq5564: 3.9,
      alqInsgesamt: 4.5,
      alqMaenner: 4.2,
    },
    {
      winningParty: 1,
      type: 'Tech City B',
      svbInsgesamt: 2100,
      svbLandwFischerei: 20,
      svbProduzGewerbe: 350,
      svbHandelGastVerkehr: 720,
      svbDienstleister: 980,
      svbUebrigeDienstleister: 280,
      alterUnter18: 14,
      alter1824: 15,
      alter2534: 22,
      alter3559: 35,
      alter6074: 10,
      alter75Plus: 4,
      alqFrauen: 3.9,
      alq1524: 6.2,
      alq5564: 3.1,
      alqInsgesamt: 3.8,
      alqMaenner: 3.5,
    },

    // Suburban Areas (Mixed parties)
    {
      winningParty: 2,
      type: 'Suburbia North',
      svbInsgesamt: 1200,
      svbLandwFischerei: 80,
      svbProduzGewerbe: 280,
      svbHandelGastVerkehr: 420,
      svbDienstleister: 380,
      svbUebrigeDienstleister: 150,
      alterUnter18: 20,
      alter1824: 10,
      alter2534: 15,
      alter3559: 40,
      alter6074: 10,
      alter75Plus: 5,
      alqFrauen: 5.1,
      alq1524: 8.4,
      alq5564: 4.5,
      alqInsgesamt: 5.3,
      alqMaenner: 5.0,
    },
    {
      winningParty: 3,
      type: 'Green Valley',
      svbInsgesamt: 950,
      svbLandwFischerei: 150,
      svbProduzGewerbe: 180,
      svbHandelGastVerkehr: 300,
      svbDienstleister: 250,
      svbUebrigeDienstleister: 100,
      alterUnter18: 22,
      alter1824: 9,
      alter2534: 12,
      alter3559: 42,
      alter6074: 11,
      alter75Plus: 6,
      alqFrauen: 6.2,
      alq1524: 9.1,
      alq5564: 5.2,
      alqInsgesamt: 6.0,
      alqMaenner: 5.8,
    },

    // Rural Areas (Party 3/4 strongholds)
    {
      winningParty: 3,
      type: 'Farmland West',
      svbInsgesamt: 600,
      svbLandwFischerei: 300,
      svbProduzGewerbe: 100,
      svbHandelGastVerkehr: 150,
      svbDienstleister: 80,
      svbUebrigeDienstleister: 50,
      alterUnter18: 25,
      alter1824: 8,
      alter2534: 10,
      alter3559: 45,
      alter6074: 15,
      alter75Plus: 7,
      alqFrauen: 7.5,
      alq1524: 10.2,
      alq5564: 6.1,
      alqInsgesamt: 7.0,
      alqMaenner: 6.5,
    },
    {
      winningParty: 4,
      type: 'Mountain Region',
      svbInsgesamt: 550,
      svbLandwFischerei: 250,
      svbProduzGewerbe: 90,
      svbHandelGastVerkehr: 130,
      svbDienstleister: 70,
      svbUebrigeDienstleister: 40,
      alterUnter18: 27,
      alter1824: 7,
      alter2534: 9,
      alter3559: 47,
      alter6074: 16,
      alter75Plus: 8,
      alqFrauen: 8.1,
      alq1524: 11.5,
      alq5564: 6.8,
      alqInsgesamt: 7.5,
      alqMaenner: 7.0,
    },

    // Industrial Zones (Party 5 outliers)
    {
      winningParty: 5,
      type: 'Factory Town',
      svbInsgesamt: 1800,
      svbLandwFischerei: 20,
      svbProduzGewerbe: 1200,
      svbHandelGastVerkehr: 400,
      svbDienstleister: 200,
      svbUebrigeDienstleister: 100,
      alterUnter18: 18,
      alter1824: 11,
      alter2534: 14,
      alter3559: 43,
      alter6074: 13,
      alter75Plus: 3,
      alqFrauen: 9.2,
      alq1524: 14.0,
      alq5564: 8.5,
      alqInsgesamt: 9.0,
      alqMaenner: 8.7,
    },
    {
      winningParty: 5,
      type: 'Port City',
      svbInsgesamt: 2200,
      svbLandwFischerei: 50,
      svbProduzGewerbe: 900,
      svbHandelGastVerkehr: 800,
      svbDienstleister: 500,
      svbUebrigeDienstleister: 200,
      alterUnter18: 16,
      alter1824: 13,
      alter2534: 17,
      alter3559: 36,
      alter6074: 14,
      alter75Plus: 4,
      alqFrauen: 8.5,
      alq1524: 12.8,
      alq5564: 7.9,
      alqInsgesamt: 8.2,
      alqMaenner: 7.9,
    },

    // Mixed Demographic Areas
    {
      winningParty: 2,
      type: 'University Town',
      svbInsgesamt: 1500,
      svbLandwFischerei: 40,
      svbProduzGewerbe: 200,
      svbHandelGastVerkehr: 600,
      svbDienstleister: 700,
      svbUebrigeDienstleister: 180,
      alterUnter18: 10,
      alter1824: 25,
      alter2534: 20,
      alter3559: 30,
      alter6074: 12,
      alter75Plus: 3,
      alqFrauen: 6.8,
      alq1524: 9.5,
      alq5564: 5.1,
      alqInsgesamt: 6.2,
      alqMaenner: 5.9,
    },
    {
      winningParty: 4,
      type: 'Retirement Haven',
      svbInsgesamt: 800,
      svbLandwFischerei: 60,
      svbProduzGewerbe: 100,
      svbHandelGastVerkehr: 350,
      svbDienstleister: 300,
      svbUebrigeDienstleister: 120,
      alterUnter18: 12,
      alter1824: 5,
      alter2534: 8,
      alter3559: 35,
      alter6074: 25,
      alter75Plus: 15,
      alqFrauen: 4.2,
      alq1524: 6.5,
      alq5564: 3.8,
      alqInsgesamt: 4.0,
      alqMaenner: 3.7,
    },
  ];

  const processedData = useMemo(() => {
    const axisStats = {
      x: {
        key: selectedAxes.x,
        values: sampleData.map(d => d[selectedAxes.x as keyof SocioCulturalStats] as number),
      },
      y: {
        key: selectedAxes.y,
        values: sampleData.map(d => d[selectedAxes.y as keyof SocioCulturalStats] as number),
      },
      z: {
        key: selectedAxes.z,
        values: sampleData.map(d => d[selectedAxes.z as keyof SocioCulturalStats] as number),
      },
    };

    // Calculate normalization parameters for each axis
    const normalize = (axis: 'x' | 'y' | 'z') => {
      const values = axisStats[axis].values;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min;
      const offset = (max + min) / 2; // Center around the mean
      
      return {
        min,
        max,
        range,
        offset,
        scale: 10 // Max spread from center
      };
    };

    const xNorm = normalize('x');
    const yNorm = normalize('y');
    const zNorm = normalize('z');

    return sampleData.map((item) => {
      const rawX = item[axisStats.x.key as keyof SocioCulturalStats] as number;
      const rawY = item[axisStats.y.key as keyof SocioCulturalStats] as number;
      const rawZ = item[axisStats.z.key as keyof SocioCulturalStats] as number;

      return {
        ...item,
        position: [
          ((rawX - xNorm.offset) / xNorm.range) * xNorm.scale * 2,
          ((rawY - yNorm.offset) / yNorm.range) * yNorm.scale * 2,
          ((rawZ - zNorm.offset) / zNorm.range) * zNorm.scale * 2,
        ]
      };
    });
  }, [selectedAxes]);

  // Modified Axis component with centered labels
  const Axis = ({ label, position, rotation }: { label: string; position: [number, number, number]; rotation: [number, number, number] }) => (
    <group position={position} rotation={rotation}>
      <mesh>
        <cylinderGeometry args={[0.05, 0.05, 20]} /> {/* Extended length */}
        <meshStandardMaterial color="#666" />
      </mesh>
      <Text
        position={[10, 0, 0]} // Position at positive end
        fontSize={0.5}
        color="#333"
        anchorX="center"
        anchorY="middle"
      >
        {`+${label}`}
      </Text>
      <Text
        position={[-10, 0, 0]} // Position at negative end
        fontSize={0.5}
        color="#333"
        anchorX="center"
        anchorY="middle"
      >
        {`-${label}`}
      </Text>
    </group>
  );

  const DataPoint = ({ item }: { item: SocioCulturalStats & { position: [number, number, number] } }) => {
    const [hovered, setHovered] = useState(false);

    return (
      <mesh
        position={item.position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color={partyColors[item.winningParty]} />
        
        {hovered && (
          <Html distanceFactor={10}>
            <div className="p-4 bg-white rounded-lg shadow-lg">
              <h3 className="font-bold text-lg">{item.type}</h3>
              <p className="text-sm">Winning Party: {item.winningParty}</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <p>Businesses: {item.svbInsgesamt}</p>
                  <p>Service Sector: {item.svbDienstleister}</p>
                </div>
                <div>
                  <p>Unemployment: {item.alqInsgesamt}%</p>
                  <p>Youth Unemployment: {item.alq1524}%</p>
                </div>
              </div>
            </div>
          </Html>
        )}
      </mesh>
    );
  };

  return (
    <div className="h-screen w-full relative">
      <div className="absolute top-4 left-4 z-10 bg-white p-4 rounded-lg shadow-md space-y-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            X-Axis:
            <select
              className="ml-2 p-1 border rounded"
              value={selectedAxes.x}
              onChange={(e) => setSelectedAxes(prev => ({ ...prev, x: e.target.value }))}
            >
              {axisOptions.map(({ key, label }) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </label>
          
          <label className="block text-sm font-medium">
            Y-Axis:
            <select
              className="ml-2 p-1 border rounded"
              value={selectedAxes.y}
              onChange={(e) => setSelectedAxes(prev => ({ ...prev, y: e.target.value }))}
            >
              {axisOptions.map(({ key, label }) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium">
            Z-Axis:
            <select
              className="ml-2 p-1 border rounded"
              value={selectedAxes.z}
              onChange={(e) => setSelectedAxes(prev => ({ ...prev, z: e.target.value }))}
            >
              {axisOptions.map(({ key, label }) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <Canvas camera={{ position: [15, 15, 15], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        
        <Axis
          label={axisOptions.find(a => a.key === selectedAxes.x)?.label || ''}
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
        />
        <Axis
          label={axisOptions.find(a => a.key === selectedAxes.y)?.label || ''}
          position={[0, 0, 0]}
          rotation={[0, Math.PI/2, 0]}
        />
        <Axis
          label={axisOptions.find(a => a.key === selectedAxes.z)?.label || ''}
          position={[0, 0, 0]}
          rotation={[Math.PI/2, 0, 0]}
        />

        {processedData.map((item, index) => (
          <DataPoint key={index} item={item} />
        ))}

        <OrbitControls
          enableZoom={true}
          zoomSpeed={0.8}
          rotateSpeed={0.5}
          minDistance={5}
          maxDistance={30}
        />
      </Canvas>
    </div>
  );
}