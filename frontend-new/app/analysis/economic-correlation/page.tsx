"use client"

import {useEffect, useState} from "react"
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Select, MenuItem, FormControl, InputLabel, Paper, Typography, Tooltip as MuiTooltip } from "@mui/material"
import InfoIcon from "@mui/icons-material/Info"
import {electionApi} from "@/services/api";
import { SocioCulturalStats } from "@/models/socio-cultural/socio"

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
  const [socioStats, setSocioStats] = useState<SocioCulturalStats[]>([])

  const [yearsArray, setYearsArray] = useState<number[]>([])
  const loadYear = async() => {
    const response = await electionApi.getJahre();
    setYearsArray(response);

    const socioResponse = await electionApi.getSocioCulturalStats(selectedYear, "zweitestimme")
    setSocioStats(socioResponse)
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
          {yearsArray.map((year) => (
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
                comparing two sectors, it&#39;s possible to see how the balance between different types of economic activity
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
            <Scatter name="Economic Sectors vs Winning Party" data={socioStats}>
              {socioStats.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={partyColors[entry.winningParty]} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

