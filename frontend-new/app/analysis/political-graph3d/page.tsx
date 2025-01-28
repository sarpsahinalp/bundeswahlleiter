"use client"

import { Canvas } from "@react-three/fiber"
import { Html, OrbitControls, Text } from "@react-three/drei"
import { useEffect, useMemo, useState } from "react"
import { electionApi } from "@/services/api"
import type { SocioCulturalStats } from "@/models/socio-cultural/socio"

const partyColors: { [key: string]: string } = {
    "CDU": "#000000",
    "CSU": "#000000",
    "SPD": "#FF0000",
    "AfD": "#009EE0",
    "FDP": "#FFED00",
    "DIE LINKE": "#BE3075",
    "GRÜNE": "#64A12D",
    "Other": "#CCCCCC",
}

const axisOptions = [
    { key: "svbInsgesamt", label: "Total Businesses" },
    { key: "alter3559", label: "Middle Age (35-59)" },
    { key: "alqInsgesamt", label: "Unemployment Rate" },
    { key: "svbDienstleister", label: "Service Sector" },
    { key: "alter75Plus", label: "Seniors (75+)" },
    { key: "alq1524", label: "Youth Unemployment" },
]

export default function PoliticalAnalysisPage() {
    const [selectedAxes, setSelectedAxes] = useState({
        x: "svbInsgesamt",
        y: "alter3559",
        z: "alqInsgesamt",
    })

    const [selectedYear, setSelectedYear] = useState<number>(2021)
    const [socioStats, setSocioStats] = useState<SocioCulturalStats[]>([])
    const [yearsArray, setYearsArray] = useState<number[]>([])

    const loadYear = async () => {
        const response = await electionApi.getJahre()
        setYearsArray(response)

        const socioResponse = await electionApi.getSocioCulturalStats(selectedYear, "zweitestimme")
        setSocioStats(socioResponse)
    }

    useEffect(() => {
        loadYear()
    }, [selectedYear, electionApi]) // Added electionApi to dependencies

    const processedData = useMemo(() => {
        const axisStats = {
            x: {
                key: selectedAxes.x,
                values: socioStats.map((d) => d[selectedAxes.x as keyof SocioCulturalStats] as number),
            },
            y: {
                key: selectedAxes.y,
                values: socioStats.map((d) => d[selectedAxes.y as keyof SocioCulturalStats] as number),
            },
            z: {
                key: selectedAxes.z,
                values: socioStats.map((d) => d[selectedAxes.z as keyof SocioCulturalStats] as number),
            },
        }

        // Calculate normalization parameters for each axis
        const normalize = (axis: "x" | "y" | "z") => {
            const values = axisStats[axis].values
            const min = Math.min(...values)
            const max = Math.max(...values)
            const range = max - min
            const offset = (max + min) / 2 // Center around the mean

            return {
                min,
                max,
                range,
                offset,
                scale: 10, // Max spread from center
            }
        }

        const xNorm = normalize("x")
        const yNorm = normalize("y")
        const zNorm = normalize("z")

        return socioStats.map((item) => {
            const rawX = item[axisStats.x.key as keyof SocioCulturalStats] as number
            const rawY = item[axisStats.y.key as keyof SocioCulturalStats] as number
            const rawZ = item[axisStats.z.key as keyof SocioCulturalStats] as number

            return {
                ...item,
                position: [
                    ((rawX - xNorm.offset) / xNorm.range) * xNorm.scale * 2,
                    ((rawY - yNorm.offset) / yNorm.range) * yNorm.scale * 2,
                    ((rawZ - zNorm.offset) / zNorm.range) * xNorm.scale * 2,
                ] as [number, number, number],
            }
        })
    }, [selectedAxes, socioStats])

    // Modified Axis component with centered labels
    const Axis = ({
                      label,
                      position,
                      rotation,
                  }: {
        label: string
        position: [number, number, number]
        rotation: [number, number, number]
    }) => (
        <group position={position} rotation={rotation}>
            <mesh>
                <cylinderGeometry args={[0.05, 0.05, 20]} />
                {/* Extended length */}
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
    )

    const DataPoint = ({ item }: { item: SocioCulturalStats & { position: [number, number, number] } }) => {
        const [hovered, setHovered] = useState(false)

        return (
            <mesh position={item.position} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
                <sphereGeometry args={[0.2, 32, 32]} />
                <meshStandardMaterial color={partyColors[item.winningParty] || partyColors["Other"]} />

                {hovered && (
                    <Html distanceFactor={10}>
                        <div className="p-6 bg-white rounded-lg shadow-lg" style={{ width: "300px", fontSize: "14px" }}>
                            <h3 className="font-bold text-xl mb-2">{item.wahlkreisName}</h3>
                            <p className="text-lg mb-2">
                                Winning Party:{" "}
                                <span style={{ color: partyColors[item.winningParty] || partyColors[1] }}>{item.winningParty}</span>
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="font-semibold">Businesses:</p>
                                    <p>{item.svbInsgesamt.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Service Sector:</p>
                                    <p>{item.svbDienstleister.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Unemployment:</p>
                                    <p>{item.alqInsgesamt.toFixed(2)}%</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Youth Unemployment:</p>
                                    <p>{item.alq1524.toFixed(2)}%</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Middle Age (35-59):</p>
                                    <p>{item.alter3559.toFixed(2)}%</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Seniors (75+):</p>
                                    <p>{item.alter75Plus.toFixed(2)}%</p>
                                </div>
                            </div>
                        </div>
                    </Html>
                )}
            </mesh>
        )
    }

    return (
        <div className="h-screen w-full relative">
            <div className="absolute top-4 left-4 z-10 bg-white p-4 rounded-lg shadow-md space-y-2">
                <div className="space-y-2">
                    <label className="block text-sm font-medium">
                        Year:
                        <select
                            className="ml-2 p-1 border rounded"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                        >
                            {yearsArray.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="block text-sm font-medium">
                        X-Axis:
                        <select
                            className="ml-2 p-1 border rounded"
                            value={selectedAxes.x}
                            onChange={(e) => setSelectedAxes((prev) => ({ ...prev, x: e.target.value }))}
                        >
                            {axisOptions.map(({ key, label }) => (
                                <option key={key} value={key}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="block text-sm font-medium">
                        Y-Axis:
                        <select
                            className="ml-2 p-1 border rounded"
                            value={selectedAxes.y}
                            onChange={(e) => setSelectedAxes((prev) => ({ ...prev, y: e.target.value }))}
                        >
                            {axisOptions.map(({ key, label }) => (
                                <option key={key} value={key}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="block text-sm font-medium">
                        Z-Axis:
                        <select
                            className="ml-2 p-1 border rounded"
                            value={selectedAxes.z}
                            onChange={(e) => setSelectedAxes((prev) => ({ ...prev, z: e.target.value }))}
                        >
                            {axisOptions.map(({ key, label }) => (
                                <option key={key} value={key}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </div>

            <Canvas camera={{ position: [15, 15, 15], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={0.8} />

                <Axis
                    label={axisOptions.find((a) => a.key === selectedAxes.x)?.label || ""}
                    position={[0, 0, 0]}
                    rotation={[0, 0, 0]}
                />
                <Axis
                    label={axisOptions.find((a) => a.key === selectedAxes.y)?.label || ""}
                    position={[0, 0, 0]}
                    rotation={[0, Math.PI / 2, 0]}
                />
                <Axis
                    label={axisOptions.find((a) => a.key === selectedAxes.z)?.label || ""}
                    position={[0, 0, 0]}
                    rotation={[Math.PI / 2, 0, 0]}
                />

                {processedData.map((item, index) => (
                    <DataPoint key={index} item={item as SocioCulturalStats & { position: [number, number, number] }} />
                ))}

                <OrbitControls enableZoom={true} zoomSpeed={0.8} rotateSpeed={0.5} minDistance={5} maxDistance={30} />
            </Canvas>
        </div>
    )
}

