"use client"

import { type ChangeEvent, useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TableSortLabel,
  FormControlLabel,
  Switch,
} from "@mui/material"
import { visuallyHidden } from "@mui/utils"
import { Box } from "@mui/system"
import type { Stimmen, Wahlkreis, WahlkreisUebersicht } from "@/models/models"
import { electionApi } from "@/services/api"

type Order = "asc" | "desc"

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1
  }
  if (b[orderBy] > a[orderBy]) {
    return 1
  }
  return 0
}

function getComparator<Key extends keyof never>(
    order: Order,
    orderBy: Key,
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
  return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy)
}

function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number])
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0])
    if (order !== 0) {
      return order
    }
    return a[1] - b[1]
  })
  return stabilizedThis.map((el) => el[0])
}

interface HeadCell {
  id: keyof Stimmen
  label: string
  numeric: boolean
}

const headCells: readonly HeadCell[] = [
  { id: "name", numeric: false, label: "Party" },
  { id: "stimmen_abs", numeric: true, label: "Votes" },
  { id: "stimmen_prozent", numeric: true, label: "Percentage" },
  { id: "stimmen_abs_vergleich", numeric: true, label: "Change-abs" },
  { id: "stimmen_prozent_vergleich", numeric: true, label: "Change-%" },
]

interface EnhancedTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Stimmen) => void
  order: Order
  orderBy: string
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort } = props
  const createSortHandler = (property: keyof Stimmen) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property)
  }

  return (
      <TableHead>
        <TableRow>
          {headCells.map((headCell) => (
              <TableCell
                  key={headCell.id}
                  align={headCell.numeric ? "right" : "left"}
                  sortDirection={orderBy === headCell.id ? order : false}
              >
                <TableSortLabel
                    active={orderBy === headCell.id}
                    direction={orderBy === headCell.id ? order : "asc"}
                    onClick={createSortHandler(headCell.id)}
                >
                  {headCell.label}
                  {orderBy === headCell.id ? (
                      <Box component="span" sx={visuallyHidden}>
                        {order === "desc" ? "sorted descending" : "sorted ascending"}
                      </Box>
                  ) : null}
                </TableSortLabel>
              </TableCell>
          ))}
        </TableRow>
      </TableHead>
  )
}

const COLORS = {
  "CDU": "#000032",
  "CSU": "#000032",
  "SPD": "#E3000F",
  "AfD": "#009EE0",
  "FDP": "#FFED00",
  "DIE LINKE": "#BE3075",
  "GRÜNE": "#64A12D",
  "Other": "#CCCCCC", // Default color for other parties
}

export default function ConstituencyOverview() {
  const [year, setYear] = useState<number>(2021)
  const [selectedConstituency, setSelectedConstituency] = useState<Wahlkreis | null>(null)
  const [order, setOrder] = useState<Order>("asc")
  const [orderBy, setOrderBy] = useState<keyof Stimmen>("name")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(15)

  const [yearsArray, setYearsArray] = useState<number[]>([])
  const loadYear = async() => {
    const response = await electionApi.getJahre();
    setYearsArray(response);
  }
  useEffect(() => {
    loadYear().then();
  }, []);

  const [wahlkreise, setWahlkreise] = useState<Wahlkreis[]>([])
  const [wahlkreisUebersicht, setWahlkreisUebersicht] = useState<WahlkreisUebersicht | null>(null)
  const [useAggregation, setUseAggregation] = useState<boolean>(true)

  const loadWahlkreise = async () => {
    try {
      const response = await electionApi.getAllConstituencies()
      setWahlkreise(response)
      setSelectedConstituency(response[0])
    } catch (error) {
      console.error("Failed to fetch grouped data:", error)
    }
  }

  useEffect(() => {
    loadWahlkreise().then()
  }, [])

  const loadWahlkreisUebersicht = async (year: number, wahlkreis_id: number, useAggregation: boolean) => {
    try {
      const response = await electionApi.getConstituencyOverview(year, wahlkreis_id, useAggregation)
      response?.parteiErgebnis.sort((ergA, ergB) => ergB.stimmen_abs - ergA.stimmen_abs)
      setWahlkreisUebersicht(response)
    } catch (error) {
      console.error("Failed to fetch grouped data:", error)
    }
  }

  useEffect(() => {
    if (selectedConstituency) {
      loadWahlkreisUebersicht(year, selectedConstituency.id, useAggregation).then()
    }
  }, [year, selectedConstituency, useAggregation])

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof Stimmen) => {
    const isAsc = orderBy === property && order === "asc"
    setOrder(isAsc ? "desc" : "asc")
    setOrderBy(property)
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  const updateWahlkreis = (event: ChangeEvent<HTMLSelectElement>) => {
    const wahlkreis_id = Number.parseInt(event.target.value)
    const wahlkreis = wahlkreise.find((wk) => wk.id === wahlkreis_id) ?? null
    setSelectedConstituency(wahlkreis)
  }

  const sortedRows = wahlkreisUebersicht?.parteiErgebnis
      ? stableSort(wahlkreisUebersicht?.parteiErgebnis, getComparator(order, orderBy))
      : []
  const visibleRows = sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  const barData = wahlkreisUebersicht?.parteiErgebnis.map((erg) => ({
    party: erg.name,
    percentage: Number(erg.stimmen_prozent.toFixed(1)),
    change: erg.stimmen_prozent_vergleich ? Number(erg.stimmen_prozent_vergleich.toFixed(1)) : null,
  }))

  return (
      <div className="px-4 py-6 sm:px-0">
        <h2 className="text-2xl font-bold mb-4">Q3: Constituency Overview</h2>
        <div className="mb-4 flex space-x-4">
          <div>
            <label htmlFor="year-select" className="mr-2">
              Select Year:
            </label>
            <select
                id="year-select"
                value={year}
                onChange={(e) => setYear(Number(e.target.value) as number)}
                className="p-2 border rounded"
            >
              {yearsArray.map((year) => (
                  <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="constituency-select" className="mr-2">
              Select Constituency:
            </label>
            <select
                id="constituency-select"
                value={selectedConstituency?.id}
                onChange={updateWahlkreis}
                className="p-2 border rounded"
            >
              {wahlkreise.map((constituency) => (
                  <option key={constituency.id} value={constituency.id}>
                    {constituency.name}
                  </option>
              ))}
            </select>
          </div>
          <FormControlLabel
              control={<Switch checked={useAggregation} onChange={() => setUseAggregation(!useAggregation)}></Switch>}
              label="Aggregation"
          ></FormControlLabel>
        </div>
        {wahlkreisUebersicht && (
            <div className="space-y-8">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">General Information</h3>
                <p>
                  Turnout:{" "}
                  {(
                      (wahlkreisUebersicht.wahlbeteiligung.teilgenommen * 100) /
                      wahlkreisUebersicht.wahlbeteiligung.berechtigt
                  ).toFixed(0)}
                  %
                </p>
                <p>
                  Directly Elected Candidate: {wahlkreisUebersicht.direktMandat.vorname}{" "}
                  {wahlkreisUebersicht.direktMandat.nachname} ({wahlkreisUebersicht.direktMandat.partei})
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Vote Distribution</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="party"
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        tick={({ x, y, payload }) => (
                            <g transform={`translate(${x},${y})`}>
                              <text
                                  x={0}
                                  y={0}
                                  dy={16}
                                  textAnchor="end"
                                  fill="#666"
                                  transform="rotate(-35)"
                                  style={{ fontSize: "12px" }}
                              >
                                {payload.value}
                              </text>
                            </g>
                        )}
                    />
                    <YAxis axisLine={false} tickLine={false} domain={[0, "auto"]} tickFormatter={(value) => `${value}%`} />
                    <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                                <div className="bg-white p-3 shadow-lg rounded-lg border">
                                  <div className="font-bold">{label}</div>
                                  <div className="text-sm">{payload[0].value}% der Zweitstimmen</div>
                                  {payload[1] && (
                                      <div className="text-sm text-gray-600">
                                        {Number(payload[1].value) > 0 ? "+" : ""}
                                        {payload[1].value}% zum Vorjahr
                                      </div>
                                  )}
                                </div>
                            )
                          }
                          return null
                        }}
                    />
                    <Bar dataKey="percentage" fill="#8884d8" name="Percentage" radius={[4, 4, 0, 0]}>
                      {barData?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[entry.party] || COLORS["Other"]} />
                      ))}
                    </Bar>
                    <Bar dataKey="change" fill="#82ca9d" name="Change from previous election" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Detailed Results</h3>
                <TableContainer component={Paper}>
                  <Table size="small" aria-label="a dense table">
                    <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
                    <TableBody>
                      {visibleRows.map((row) => (
                          <TableRow key={row.name} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                            <TableCell component="th" scope="row" sx={{ whiteSpace: "nowrap" }}>
                              {row.name}
                            </TableCell>
                            <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                              {row.stimmen_abs.toLocaleString()}
                            </TableCell>
                            <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                              {row.stimmen_prozent.toFixed(1)}%
                            </TableCell>
                            <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                              {!row.stimmen_abs_vergleich
                                  ? ""
                                  : (row.stimmen_abs_vergleich > 0 ? "+" : "") + row.stimmen_abs_vergleich}
                            </TableCell>
                            <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                              {!row.stimmen_prozent_vergleich
                                  ? ""
                                  : (row.stimmen_prozent_vergleich > 0 ? "+" : "") + row.stimmen_prozent_vergleich.toFixed(1) + "%"}
                            </TableCell>
                          </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[15, 30, 50]}
                    component="div"
                    count={wahlkreisUebersicht.parteiErgebnis.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </div>
            </div>
        )}
      </div>
  )
}

