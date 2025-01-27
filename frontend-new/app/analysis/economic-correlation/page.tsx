"use client"

import { useState } from "react"
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Select, MenuItem, FormControl, InputLabel, Paper, Typography, Tooltip as MuiTooltip } from "@mui/material"
import InfoIcon from "@mui/icons-material/Info"

interface SocioCulturalStats {
  winningParty: number
  type: string
  svbInsgesamt: number
  svbLandwFischerei: number
  svbProduzGewerbe: number
  svbHandelGastVerkehr: number
  svbDienstleister: number
  svbUebrigeDienstleister: number
  alterUnter18: number
  alter1824: number
  alter2534: number
  alter3559: number
  alter6074: number
  alter75Plus: number
  alqFrauen: number
  alq1524: number
  alq5564: number
  alqInsgesamt: number
  alqMaenner: number
}

const mockData: { [year: number]: SocioCulturalStats[] } = {
  2017: [
    {
      winningParty: 1,
      type: "Urban",
      svbInsgesamt: 100000,
      svbLandwFischerei: 1000,
      svbProduzGewerbe: 20000,
      svbHandelGastVerkehr: 25000,
      svbDienstleister: 40000,
      svbUebrigeDienstleister: 14000,
      alterUnter18: 15,
      alter1824: 10,
      alter2534: 20,
      alter3559: 30,
      alter6074: 15,
      alter75Plus: 10,
      alqFrauen: 5.2,
      alq1524: 7.5,
      alq5564: 4.8,
      alqInsgesamt: 5.5,
      alqMaenner: 5.8,
    },
    {
      winningParty: 2,
      type: "Rural",
      svbInsgesamt: 50000,
      svbLandwFischerei: 5000,
      svbProduzGewerbe: 15000,
      svbHandelGastVerkehr: 10000,
      svbDienstleister: 15000,
      svbUebrigeDienstleister: 5000,
      alterUnter18: 18,
      alter1824: 8,
      alter2534: 15,
      alter3559: 35,
      alter6074: 18,
      alter75Plus: 6,
      alqFrauen: 4.8,
      alq1524: 6.9,
      alq5564: 4.2,
      alqInsgesamt: 5.1,
      alqMaenner: 5.4,
    },
    {
      winningParty: 3,
      type: "Suburban",
      svbInsgesamt: 75000,
      svbLandwFischerei: 2000,
      svbProduzGewerbe: 18000,
      svbHandelGastVerkehr: 20000,
      svbDienstleister: 25000,
      svbUebrigeDienstleister: 10000,
      alterUnter18: 17,
      alter1824: 9,
      alter2534: 18,
      alter3559: 32,
      alter6074: 16,
      alter75Plus: 8,
      alqFrauen: 5.0,
      alq1524: 7.2,
      alq5564: 4.5,
      alqInsgesamt: 5.3,
      alqMaenner: 5.6,
    },
  ],
  2021: [
    {
      winningParty: 2,
      type: "Urban",
      svbInsgesamt: 110000,
      svbLandwFischerei: 800,
      svbProduzGewerbe: 22000,
      svbHandelGastVerkehr: 28000,
      svbDienstleister: 45000,
      svbUebrigeDienstleister: 14200,
      alterUnter18: 14,
      alter1824: 11,
      alter2534: 22,
      alter3559: 28,
      alter6074: 16,
      alter75Plus: 9,
      alqFrauen: 4.9,
      alq1524: 7.1,
      alq5564: 4.6,
      alqInsgesamt: 5.2,
      alqMaenner: 5.5,
    },
    {
      winningParty: 1,
      type: "Rural",
      svbInsgesamt: 55000,
      svbLandwFischerei: 5500,
      svbProduzGewerbe: 16000,
      svbHandelGastVerkehr: 11000,
      svbDienstleister: 17000,
      svbUebrigeDienstleister: 5500,
      alterUnter18: 17,
      alter1824: 7,
      alter2534: 14,
      alter3559: 36,
      alter6074: 19,
      alter75Plus: 7,
      alqFrauen: 4.5,
      alq1524: 6.5,
      alq5564: 4.0,
      alqInsgesamt: 4.8,
      alqMaenner: 5.1,
    },
    {
      winningParty: 4,
      type: "Suburban",
      svbInsgesamt: 80000,
      svbLandwFischerei: 1800,
      svbProduzGewerbe: 19000,
      svbHandelGastVerkehr: 22000,
      svbDienstleister: 27000,
      svbUebrigeDienstleister: 10200,
      alterUnter18: 16,
      alter1824: 10,
      alter2534: 19,
      alter3559: 31,
      alter6074: 17,
      alter75Plus: 7,
      alqFrauen: 4.7,
      alq1524: 6.8,
      alq5564: 4.3,
      alqInsgesamt: 5.0,
      alqMaenner: 5.3,
    },
  ],
}

const partyColors = ["#000000", "#FF0000", "#FFFF00", "#00FF00", "#0000FF", "#FF00FF"]

const economicCategories = [
  { key: "svbLandwFischerei", label: "Agriculture & Fishery" },
  { key: "svbProduzGewerbe", label: "Manufacturing" },
  { key: "svbHandelGastVerkehr", label: "Trade, Hospitality & Transport" },
  { key: "svbDienstleister", label: "Services" },
  { key: "svbUebrigeDienstleister", label: "Other Services" },
]

export default function EconomicCorrelation() {
  const [selectedYear, setSelectedYear] = useState<number>(2021)
  const [selectedCategory1, setSelectedCategory1] = useState(economicCategories[0].key)
  const [selectedCategory2, setSelectedCategory2] = useState(economicCategories[1].key)

  const years = Object.keys(mockData).map(Number)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <Paper className="p-4">
          <Typography variant="body2">
            <strong>Winning Party:</strong> {data.winningParty}
          </Typography>
          <Typography variant="body2">
            <strong>Type:</strong> {data.type}
          </Typography>
          <Typography variant="body2">
            <strong>{economicCategories.find((cat) => cat.key === selectedCategory1)?.label}:</strong>{" "}
            {data[selectedCategory1]}
          </Typography>
          <Typography variant="body2">
            <strong>{economicCategories.find((cat) => cat.key === selectedCategory2)?.label}:</strong>{" "}
            {data[selectedCategory2]}
          </Typography>
        </Paper>
      )
    }
    return null
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <h2 className="text-2xl font-bold mb-4">Q9: Economic Sector Correlation Analysis</h2>
      <FormControl fullWidth className="mb-4">
        <InputLabel>Select Year</InputLabel>
        <Select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} label="Select Year">
          {years.map((year) => (
            <MenuItem key={year} value={year}>
              {year}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Economic Sector Distribution vs Winning Party</h3>
          <MuiTooltip
            title={
              <Typography>
                This scatter plot demonstrates the correlation between economic sector distribution and winning parties
                across different regions. The x and y axes represent the percentage of employees in two selected
                economic sectors (e.g., Agriculture & Fishery, Manufacturing, Services). Each point on the graph
                represents a region, with its color indicating the winning party. This visualization helps identify
                patterns in how the prominence of different economic sectors might influence election outcomes. By
                comparing two sectors, it's possible to see how the balance between different types of economic activity
                relates to political preferences in various areas.
              </Typography>
            }
          >
            <InfoIcon />
          </MuiTooltip>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <FormControl fullWidth>
            <InputLabel>Category 1</InputLabel>
            <Select
              value={selectedCategory1}
              onChange={(e) => setSelectedCategory1(e.target.value as string)}
              label="Category 1"
            >
              {economicCategories.map((category) => (
                <MenuItem key={category.key} value={category.key}>
                  {category.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Category 2</InputLabel>
            <Select
              value={selectedCategory2}
              onChange={(e) => setSelectedCategory2(e.target.value as string)}
              label="Category 2"
            >
              {economicCategories.map((category) => (
                <MenuItem key={category.key} value={category.key}>
                  {category.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid />
            <XAxis
              type="number"
              dataKey={selectedCategory1}
              name={economicCategories.find((cat) => cat.key === selectedCategory1)?.label}
              unit="%"
              label={{ value: "Category 1 Percentage", position: "bottom" }}
            />
            <YAxis
              type="number"
              dataKey={selectedCategory2}
              name={economicCategories.find((cat) => cat.key === selectedCategory2)?.label}
              unit="%"
              label={{ value: "Category 2 Percentage", angle: -90, position: "left" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter name="Economic Sectors vs Winning Party" data={mockData[selectedYear]}>
              {mockData[selectedYear].map((entry, index) => (
                <Cell key={`cell-${index}`} fill={partyColors[entry.winningParty - 1]} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

