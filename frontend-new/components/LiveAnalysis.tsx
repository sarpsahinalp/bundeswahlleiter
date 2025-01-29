"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { useElection } from "../contexts/ElectionContext"
import { electionApi } from "@/services/api"
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Tabs,
  Tab,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material"
import type { PartyResult } from "@/models/election"
import { partyColors } from "@/utils/partyColors"

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  }
}

export default function LiveAnalysis() {
  const { isElectionActive, electionStartTime, refreshElectionStatus } = useElection()
  const [data, setData] = useState<{
    firstVotes: PartyResult[]
    secondVotes: PartyResult[]
    totalVotes: number
  }>({
    firstVotes: [],
    secondVotes: [],
    totalVotes: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tabValue, setTabValue] = useState(0)
  const [formattedStartTime, setFormattedStartTime] = useState<string>("")
  const [selectedWahlkreis, setSelectedWahlkreis] = useState<string>("all")
  const [wahlkreise, setWahlkreise] = useState<string[]>([])

  useEffect(() => {
    const fetchData = async () => {
      if (!isElectionActive) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const result = await electionApi.getLiveResults()
        console.log(result)

        // Extract unique Wahlkreise from the results
        const uniqueWahlkreise = Array.from(
          new Set([
            ...result.firstVotes.map((vote) => vote.wahlkreis),
            ...result.secondVotes.map((vote) => vote.wahlkreis),
          ]),
        )
        setWahlkreise(["all", ...uniqueWahlkreise])

        setData((prevData) => {
          const filteredFirstVotes =
            selectedWahlkreis === "all"
              ? result.firstVotes
              : result.firstVotes.filter((vote) => vote.wahlkreis === selectedWahlkreis)

          const filteredSecondVotes =
            selectedWahlkreis === "all"
              ? result.secondVotes
              : result.secondVotes.filter((vote) => vote.wahlkreis === selectedWahlkreis)

          const totalVotes =
            selectedWahlkreis === "all"
              ? result.totalVotes
              : filteredFirstVotes.reduce((sum, vote) => sum + vote.firstVotes, 0)

          const firstVotesWithPercentage = filteredFirstVotes.map((party) => ({
            ...party,
            percentage: (party.firstVotes / totalVotes) * 100,
          }))

          const secondVotesWithPercentage = filteredSecondVotes.map((party) => ({
            ...party,
            percentage: (party.secondVotes / totalVotes) * 100,
          }))

          return {
            firstVotes: firstVotesWithPercentage,
            secondVotes: secondVotesWithPercentage,
            totalVotes: totalVotes,
          }
        })
      } catch (error) {
        console.error("Error fetching live results:", error)
        setError("Failed to fetch live results. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [isElectionActive, selectedWahlkreis])

  useEffect(() => {
    if (electionStartTime) {
      setFormattedStartTime(
        electionStartTime.toLocaleString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
      )
    }
  }, [electionStartTime])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  if (!isElectionActive) {
    return (
      <Card>
        <CardHeader
          title="Live Election Results"
          subheader={
            electionStartTime
              ? `The election is scheduled to start on ${formattedStartTime}.`
              : "Election is not active"
          }
        />
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader title="Live Election Results" />
        <CardContent>
          <CircularProgress />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader title="Live Election Results" />
        <CardContent>
          <Typography color="error">{error}</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title="Live Election Results"
        action={
          <Button variant="contained" color="primary" onClick={refreshElectionStatus}>
            Refresh Status
          </Button>
        }
      />
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          Total votes cast: {data.totalVotes.toLocaleString()}
        </Typography>
        <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
          <InputLabel id="wahlkreis-select-label">Wahlkreis</InputLabel>
          <Select
            labelId="wahlkreis-select-label"
            id="wahlkreis-select"
            value={selectedWahlkreis}
            label="Wahlkreis"
            onChange={(e) => setSelectedWahlkreis(e.target.value as string)}
          >
            {wahlkreise.map((wahlkreis) => (
              <MenuItem key={wahlkreis} value={wahlkreis}>
                {wahlkreis === "all" ? "All Wahlkreise" : wahlkreis}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ width: "100%" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="live results tabs">
              <Tab label="Chart View" {...a11yProps(0)} />
              <Tab label="Table View" {...a11yProps(1)} />
            </Tabs>
          </Box>
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ height: 400, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                First Votes (Erststimme)
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.firstVotes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="party" />
                  <YAxis
                    label={{ value: "Percentage of Votes", angle: -90, position: "insideLeft" }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white p-2 border rounded shadow">
                            <p className="font-bold">{label}</p>
                            <p>{`Votes: ${data.firstVotes.toLocaleString()}`}</p>
                            <p>{`Percentage: ${data.percentage.toFixed(2)}%`}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend />
                  <Bar dataKey="percentage" name="Percentage">
                    {data.firstVotes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={partyColors[entry.party] || partyColors["Other"]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
            <Box sx={{ height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Second Votes (Zweitstimme)
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.secondVotes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="party" />
                  <YAxis
                    label={{ value: "Percentage of Votes", angle: -90, position: "insideLeft" }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white p-2 border rounded shadow">
                            <p className="font-bold">{label}</p>
                            <p>{`Votes: ${data.secondVotes.toLocaleString()}`}</p>
                            <p>{`Percentage: ${data.percentage.toFixed(2)}%`}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend />
                  <Bar dataKey="percentage" name="Percentage">
                    {data.secondVotes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={partyColors[entry.party] || partyColors["Other"]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              First Votes (Erststimme)
            </Typography>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="first votes table">
                <TableHead>
                  <TableRow>
                    <TableCell>Party</TableCell>
                    <TableCell align="right">Votes</TableCell>
                    <TableCell align="right">Percentage</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.firstVotes.map((row) => (
                    <TableRow key={row.party}>
                      <TableCell component="th" scope="row">
                        {row.party}
                      </TableCell>
                      <TableCell align="right">{row.firstVotes}</TableCell>
                      <TableCell align="right">{row.percentage.toFixed(2)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Second Votes (Zweitstimme)
            </Typography>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="second votes table">
                <TableHead>
                  <TableRow>
                    <TableCell>Party</TableCell>
                    <TableCell align="right">Votes</TableCell>
                    <TableCell align="right">Percentage</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.secondVotes.map((row) => (
                    <TableRow key={row.party}>
                      <TableCell component="th" scope="row">
                        {row.party}
                      </TableCell>
                      <TableCell align="right">{row.secondVotes}</TableCell>
                      <TableCell align="right">{row.percentage.toFixed(2)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Box>
      </CardContent>
    </Card>
  )
}

