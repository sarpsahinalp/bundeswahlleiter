"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tab, Tabs, Box } from "@mui/material"

type VoteData = {
    party: string
    firstVotes: number
    secondVotes: number
}

const initialData: VoteData[] = [
    { party: "CDU/CSU", firstVotes: 0, secondVotes: 0 },
    { party: "SPD", firstVotes: 0, secondVotes: 0 },
    { party: "AfD", firstVotes: 0, secondVotes: 0 },
    { party: "FDP", firstVotes: 0, secondVotes: 0 },
    { party: "LINKE", firstVotes: 0, secondVotes: 0 },
    { party: "GRÜNE", firstVotes: 0, secondVotes: 0 },
    { party: "Other", firstVotes: 0, secondVotes: 0 },
]

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

export default function LiveResults() {
    const [voteData, setVoteData] = useState<VoteData[]>(initialData)
    const [totalVotes, setTotalVotes] = useState(0)
    const [tabValue, setTabValue] = useState(0)

    useEffect(() => {
        const updateInterval = setInterval(() => {
            setVoteData((currentData) =>
                currentData.map((party) => ({
                    ...party,
                    firstVotes: party.firstVotes + Math.floor(Math.random() * 10),
                    secondVotes: party.secondVotes + Math.floor(Math.random() * 10),
                })),
            )
        }, 2000)

        return () => clearInterval(updateInterval)
    }, [])

    useEffect(() => {
        const newTotalVotes = voteData.reduce((sum, party) => sum + party.firstVotes + party.secondVotes, 0)
        setTotalVotes(newTotalVotes)
    }, [voteData])

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue)
    }

    const ChartView = () => (
        <>
            <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">First Votes (Erststimme)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={voteData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="party" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="firstVotes" fill="#8884d8" name="First Votes" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Second Votes (Zweitstimme)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={voteData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="party" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="secondVotes" fill="#82ca9d" name="Second Votes" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </>
    )

    const TableView = () => (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} size="small" aria-label="vote results table">
                <TableHead>
                    <TableRow>
                        <TableCell>Party</TableCell>
                        <TableCell align="right">First Votes</TableCell>
                        <TableCell align="right">Second Votes</TableCell>
                        <TableCell align="right">Total Votes</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {voteData.map((row) => (
                        <TableRow key={row.party} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                            <TableCell component="th" scope="row">
                                {row.party}
                            </TableCell>
                            <TableCell align="right">{row.firstVotes}</TableCell>
                            <TableCell align="right">{row.secondVotes}</TableCell>
                            <TableCell align="right">{row.firstVotes + row.secondVotes}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )

    return (
        <div className="px-4 py-6 sm:px-0">
            <h2 className="text-2xl font-bold mb-4">Live Voting Results</h2>
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <p className="mb-4">Total votes cast: {totalVotes}</p>
                <Box sx={{ width: "100%" }}>
                    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                        <Tabs value={tabValue} onChange={handleTabChange} aria-label="results view tabs">
                            <Tab label="Chart View" {...a11yProps(0)} />
                            <Tab label="Table View" {...a11yProps(1)} />
                        </Tabs>
                    </Box>
                    <TabPanel value={tabValue} index={0}>
                        <ChartView />
                    </TabPanel>
                    <TabPanel value={tabValue} index={1}>
                        <TableView />
                    </TabPanel>
                </Box>
            </div>
        </div>
    )
}

