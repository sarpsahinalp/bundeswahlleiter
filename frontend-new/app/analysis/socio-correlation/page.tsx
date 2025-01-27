"use client"

import {useEffect, useState } from "react"
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Select, MenuItem, FormControl, InputLabel, Paper, Typography, Button, Tooltip as MuiTooltip } from "@mui/material"
import InfoIcon from "@mui/icons-material/Info"
import {electionApi} from "@/services/api";

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

const ageCategories = [
  { key: "alterUnter18", label: "Under 18" },
  { key: "alter1824", label: "18-24" },
  { key: "alter2534", label: "25-34" },
  { key: "alter3559", label: "35-59" },
  { key: "alter6074", label: "60-74" },
  { key: "alter75Plus", label: "75+" },
]

const unemploymentCategories = [
  { key: "alqInsgesamt", label: "Total" },
  { key: "alqFrauen", label: "Women" },
  { key: "alqMaenner", label: "Men" },
  { key: "alq1524", label: "15-24" },
  { key: "alq5564", label: "55-64" },
]

export default function SocioCulturalCorrelation() {
  const [selectedYear, setSelectedYear] = useState<number>(2021)
  const [selectedAgeCategory, setSelectedAgeCategory] = useState(ageCategories[0].key)
  const [selectedUnemploymentCategory, setSelectedUnemploymentCategory] = useState(unemploymentCategories[0].key)

  const [yearsArray, setYearsArray] = useState<number[]>([])
  const loadYear = async() => {
    const response = await electionApi.getJahre();
    setYearsArray(response);
  }
  useEffect(() => {
    loadYear().then();
  }, []);

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
            <strong>{ageCategories.find((cat) => cat.key === selectedAgeCategory)?.label}:</strong>{" "}
            {data[selectedAgeCategory]}%
          </Typography>
          <Typography variant="body2">
            <strong>
              Unemployment ({unemploymentCategories.find((cat) => cat.key === selectedUnemploymentCategory)?.label}):
            </strong>{" "}
            {data[selectedUnemploymentCategory]}%
          </Typography>
        </Paper>
      )
    }
    return null
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <h2 className="text-2xl font-bold mb-4">Q8: Socio-Cultural Correlation Analysis</h2>
      <div className="mb-4">
        {yearsArray.map((year) => (
          <Button
            key={year}
            variant={selectedYear === year ? "contained" : "outlined"}
            onClick={() => setSelectedYear(year)}
            className="mr-2"
          >
            {year}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Age Distribution vs Winning Party</h3>
            <MuiTooltip
              title={
                <Typography>
                  This scatter plot shows the correlation between age distribution and winning parties in different
                  regions. The x-axis represents the percentage of the selected age group in each region, while the
                  y-axis represents the winning party (encoded as numbers). Each point on the graph represents a region,
                  and its color corresponds to the winning party. This visualization helps identify patterns in how age
                  demographics might influence election outcomes across different areas.
                </Typography>
              }
            >
              <InfoIcon />
            </MuiTooltip>
          </div>
          <FormControl fullWidth className="mb-4">
            <InputLabel>Select Age Category</InputLabel>
            <Select
              value={selectedAgeCategory}
              onChange={(e) => setSelectedAgeCategory(e.target.value as string)}
              label="Select Age Category"
            >
              {ageCategories.map((category) => (
                <MenuItem key={category.key} value={category.key}>
                  {category.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid />
              <XAxis
                type="number"
                dataKey={selectedAgeCategory}
                name="Age"
                unit="%"
                label={{ value: "Age Percentage", position: "bottom" }}
              />
              <YAxis type="number" dataKey="winningParty" name="Winning Party" />
              <Tooltip content={<CustomTooltip />} />
              <Scatter name="Age vs Winning Party" data={mockData[selectedYear]}>
                {mockData[selectedYear].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={partyColors[entry.winningParty - 1]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Unemployment Rate vs Winning Party</h3>
            <MuiTooltip
              title={
                <Typography>
                  This scatter plot illustrates the relationship between unemployment rates and winning parties in
                  different regions. The x-axis shows the unemployment rate for the selected category (e.g., total,
                  women, men, or specific age groups), while the y-axis represents the winning party (encoded as
                  numbers). Each point represents a region, with its color indicating the winning party. This graph
                  helps visualize how varying levels of unemployment across different demographics might correlate with
                  election results in different areas.
                </Typography>
              }
            >
              <InfoIcon />
            </MuiTooltip>
          </div>
          <FormControl fullWidth className="mb-4">
            <InputLabel>Select Unemployment Category</InputLabel>
            <Select
              value={selectedUnemploymentCategory}
              onChange={(e) => setSelectedUnemploymentCategory(e.target.value as string)}
              label="Select Unemployment Category"
            >
              {unemploymentCategories.map((category) => (
                <MenuItem key={category.key} value={category.key}>
                  {category.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid />
              <XAxis
                type="number"
                dataKey={selectedUnemploymentCategory}
                name="Unemployment"
                unit="%"
                label={{ value: "Unemployment Rate", position: "bottom" }}
              />
              <YAxis type="number" dataKey="winningParty" name="Winning Party" />
              <Tooltip content={<CustomTooltip />} />
              <Scatter name="Unemployment vs Winning Party" data={mockData[selectedYear]}>
                {mockData[selectedYear].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={partyColors[entry.winningParty - 1]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

