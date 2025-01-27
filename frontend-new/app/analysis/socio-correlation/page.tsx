"use client"

import { useEffect, useState } from "react"
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Typography,
  Button,
  Tooltip as MuiTooltip,
} from "@mui/material"
import InfoIcon from "@mui/icons-material/Info"
import { electionApi } from "@/services/api"

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
  const [socioStats, setSocioStats] = useState<SocioCulturalStats[]>([])

  const [yearsArray, setYearsArray] = useState<number[]>([])
  const loadYear = async () => {
    const response = await electionApi.getJahre()
    setYearsArray(response)

    const socioResponse = await electionApi.getSocioCulturalStats(selectedYear, "zweitestimme")
    setSocioStats(socioResponse)
  }

  useEffect(() => {
    loadYear().then()
  }, [selectedYear]) // Removed loadYear from dependencies

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
          <Paper className="p-4">
            <Typography variant="body2">
              <strong>Constituency:</strong> {data.wahlkreisName}
            </Typography>
            <Typography variant="body2">
              <strong>Winning Party:</strong> {data.winningParty}
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

  const parties = Array.from(new Set(socioStats.map((stat) => stat.winningParty)))

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
        <div className="space-y-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Age Distribution vs Winning Party</h3>
              <MuiTooltip
                  title={
                    <Typography>
                      This scatter plot shows the correlation between age distribution and winning parties. The x-axis
                      represents the different parties, while the y-axis shows the percentage of the selected age group.
                      Each point represents a constituency, with its color corresponding to the winning party in that
                      constituency.
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
            <ResponsiveContainer width="100%" height={700}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 120, left: 60 }}>
                <CartesianGrid />
                <XAxis
                    type="category"
                    dataKey="winningParty"
                    name="Party"
                    allowDuplicatedCategory={false}
                    interval={0}
                    tick={({ x, y, payload }) => (
                        <g transform={`translate(${x},${y})`}>
                          <text
                              x={0}
                              y={0}
                              dy={16}
                              textAnchor="end"
                              fill={partyColors[payload.value] || partyColors["Other"]}
                              transform="rotate(-45)"
                          >
                            {payload.value}
                          </text>
                        </g>
                    )}
                />
                <YAxis
                    type="number"
                    dataKey={selectedAgeCategory}
                    name="Percentage"
                    unit="%"
                    label={{ value: "Age Group Percentage", angle: -90, position: "insideLeft" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Scatter name="Age Distribution" data={socioStats}>
                  {socioStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={partyColors[entry.winningParty] || partyColors["Other"]} />
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
                      This scatter plot illustrates the relationship between unemployment rates and winning parties. The
                      x-axis shows the different parties, while the y-axis represents the unemployment rate for the selected
                      category. Each point represents a constituency, with its color indicating the winning party in that
                      constituency.
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
            <ResponsiveContainer width="100%" height={700}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 120, left: 60 }}>
                <CartesianGrid />
                <XAxis
                    type="category"
                    dataKey="winningParty"
                    name="Party"
                    allowDuplicatedCategory={false}
                    interval={0}
                    tick={({ x, y, payload }) => (
                        <g transform={`translate(${x},${y})`}>
                          <text
                              x={0}
                              y={0}
                              dy={16}
                              textAnchor="end"
                              fill={partyColors[payload.value] || partyColors["Other"]}
                              transform="rotate(-45)"
                          >
                            {payload.value}
                          </text>
                        </g>
                    )}
                />
                <YAxis
                    type="number"
                    dataKey={selectedUnemploymentCategory}
                    name="Unemployment Rate"
                    unit="%"
                    label={{ value: "Unemployment Rate", angle: -90, position: "insideLeft" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Scatter name="Unemployment Rate" data={socioStats}>
                  {socioStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={partyColors[entry.winningParty] || partyColors["Other"]} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
  )
}

