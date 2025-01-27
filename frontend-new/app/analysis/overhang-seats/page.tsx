"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
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
} from "@mui/material"
import { visuallyHidden } from "@mui/utils"
import { Box } from "@mui/system"
import { electionApi } from "@/services/api"

type OverhangSeat = {
  name: string
  seats: number
  type: "party" | "state"
}

type Order = "asc" | "desc"

// Colors for parties and states
const COLORS = {
  "CDU/CSU": "#000032",
  SPD: "#E3000F",
  AfD: "#009EE0",
  FDP: "#FFED00",
  "DIE LINKE": "#BE3075",
  GRÜNE: "#64A12D",
  Other: "#CCCCCC",
  // Add colors for states (Bundesländer) here
  "Baden-Württemberg": "#4CAF50",
  Bayern: "#2196F3",
  Berlin: "#FFC107",
  Brandenburg: "#FF5722",
  Bremen: "#9C27B0",
  Hamburg: "#795548",
  Hessen: "#607D8B",
  "Mecklenburg-Vorpommern": "#8BC34A",
  Niedersachsen: "#CDDC39",
  "Nordrhein-Westfalen": "#00BCD4",
  "Rheinland-Pfalz": "#FF9800",
  Saarland: "#9E9E9E",
  Sachsen: "#F44336",
  "Sachsen-Anhalt": "#3F51B5",
  "Schleswig-Holstein": "#FFEB3B",
  Thüringen: "#673AB7",
}

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
  id: keyof OverhangSeat
  label: string
  numeric: boolean
}

const headCells: readonly HeadCell[] = [
  { id: "name", numeric: false, label: "Party/State" },
  { id: "seats", numeric: true, label: "Overhang Seats" },
]

interface EnhancedTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof OverhangSeat) => void
  order: Order
  orderBy: string
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort } = props
  const createSortHandler = (property: keyof OverhangSeat) => (event: React.MouseEvent<unknown>) => {
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
                  sx={{ whiteSpace: "nowrap" }}
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

export default function OverhangSeats() {
  const [year, setYear] = useState<2017 | 2021>(2021)
  const [order, setOrder] = useState<Order>("desc")
  const [orderBy, setOrderBy] = useState<keyof OverhangSeat>("seats")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(15)
  const [selectedType, setSelectedType] = useState<"parties" | "states">("parties")

  const [data, setData] = useState<OverhangSeat[]>([])

  const loadData = async (year: number, type: "parties" | "states") => {
    try {
      const response = await electionApi.getOverhangSeats(year, type === "parties" ? "partei" : "bundesland")
      const combinedData: OverhangSeat[] = response.map((mandate) => ({
        name: mandate.groupField,
        seats: mandate.mandates,
        type: type === "parties" ? "party" : "state",
      }))
      setData(combinedData)
    } catch (error) {
      console.error("Failed to fetch overhang seats data:", error)
    }
  }

  useEffect(() => {
    loadData(year, selectedType)
  }, [year, selectedType])

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof OverhangSeat) => {
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

  const sortedRows = stableSort(data, getComparator(order, orderBy))
  const visibleRows = sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
      <div className="px-4 py-6 sm:px-0">
        <h2 className="text-2xl font-bold mb-4">Q5: Overhang Seats</h2>
        <div className="mb-4 flex space-x-4">
          <div>
            <label htmlFor="year-select" className="mr-2">
              Select Year:
            </label>
            <select
                id="year-select"
                value={year}
                onChange={(e) => setYear(Number(e.target.value) as 2017 | 2021)}
                className="p-2 border rounded"
            >
              <option value={2017}>2017</option>
              <option value={2021}>2021</option>
            </select>
          </div>
          <div>
            <label htmlFor="type-select" className="mr-2">
              Select Type:
            </label>
            <select
                id="type-select"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as "parties" | "states")}
                className="p-2 border rounded"
            >
              <option value="parties">Parties</option>
              <option value="states">States (Länder)</option>
            </select>
          </div>
        </div>
        <div className="space-y-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">
              Overhang Seats Chart ({selectedType === "parties" ? "Parties" : "States"})
            </h3>
            <ResponsiveContainer width="100%" height={500}>
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="name"
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
                    label={{
                      value: "Overhang Seats",
                      position: "bottom",
                      offset: 50,
                      style: { textAnchor: "middle" },
                    }}
                />
                <YAxis />
                <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                            <div className="bg-white p-3 shadow-lg rounded-lg border">
                              <p className="font-bold">{label}</p>
                              <p>{`${data.seats} overhang seat${data.seats !== 1 ? "s" : ""}`}</p>
                              <p className="text-sm text-gray-500">{`Type: ${data.type}`}</p>
                            </div>
                        )
                      }
                      return null
                    }}
                />
                <Bar dataKey="seats" fill="#8884d8" name="Overhang Seats">
                  {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name] || COLORS.Other} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">
              Overhang Seats Table ({selectedType === "parties" ? "Parties" : "States"})
            </h3>
            <TableContainer component={Paper}>
              <Table size="small" aria-label="a dense table">
                <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
                <TableBody>
                  {visibleRows.map((row) => (
                      <TableRow key={row.name} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                        <TableCell
                            component="th"
                            scope="row"
                            sx={{ whiteSpace: "nowrap", color: COLORS[row.name] || COLORS.Other }}
                        >
                          {row.name}
                        </TableCell>
                        <TableCell align="right">{row.seats}</TableCell>
                      </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[15, 30, 50]}
                component="div"
                count={data.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </div>
        </div>
      </div>
  )
}

