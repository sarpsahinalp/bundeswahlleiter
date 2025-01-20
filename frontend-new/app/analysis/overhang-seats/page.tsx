"use client"

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
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

type OverhangSeat = {
  name: string
  seats: number
}

type Order = "asc" | "desc"

const mockData = {
  2017: {
    parties: [
      { name: "CDU/CSU", seats: 4 },
      { name: "SPD", seats: 3 },
      { name: "AfD", seats: 0 },
      { name: "FDP", seats: 2 },
      { name: "Die Linke", seats: 0 },
      { name: "Grüne", seats: 1 },
    ],
    states: [
      { name: "Baden-Württemberg", seats: 2 },
      { name: "Bayern", seats: 3 },
      { name: "Berlin", seats: 1 },
      { name: "Brandenburg", seats: 0 },
      { name: "Bremen", seats: 0 },
      { name: "Hamburg", seats: 1 },
      { name: "Hessen", seats: 1 },
      { name: "Mecklenburg-Vorpommern", seats: 0 },
      { name: "Niedersachsen", seats: 1 },
      { name: "Nordrhein-Westfalen", seats: 1 },
      { name: "Rheinland-Pfalz", seats: 0 },
      { name: "Saarland", seats: 0 },
      { name: "Sachsen", seats: 0 },
      { name: "Sachsen-Anhalt", seats: 0 },
      { name: "Schleswig-Holstein", seats: 0 },
      { name: "Thüringen", seats: 0 },
    ],
  },
  2021: {
    parties: [
      { name: "CDU/CSU", seats: 3 },
      { name: "SPD", seats: 2 },
      { name: "AfD", seats: 0 },
      { name: "FDP", seats: 1 },
      { name: "Die Linke", seats: 0 },
      { name: "Grüne", seats: 1 },
    ],
    states: [
      { name: "Baden-Württemberg", seats: 1 },
      { name: "Bayern", seats: 2 },
      { name: "Berlin", seats: 1 },
      { name: "Brandenburg", seats: 0 },
      { name: "Bremen", seats: 0 },
      { name: "Hamburg", seats: 0 },
      { name: "Hessen", seats: 1 },
      { name: "Mecklenburg-Vorpommern", seats: 0 },
      { name: "Niedersachsen", seats: 1 },
      { name: "Nordrhein-Westfalen", seats: 1 },
      { name: "Rheinland-Pfalz", seats: 0 },
      { name: "Saarland", seats: 0 },
      { name: "Sachsen", seats: 0 },
      { name: "Sachsen-Anhalt", seats: 0 },
      { name: "Schleswig-Holstein", seats: 0 },
      { name: "Thüringen", seats: 0 },
    ],
  },
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

function getComparator<Key extends keyof any>(
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
  const [view, setView] = useState<"parties" | "states">("parties")
  const [order, setOrder] = useState<Order>("desc")
  const [orderBy, setOrderBy] = useState<keyof OverhangSeat>("seats")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(15)

  const data = mockData[year][view]

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
          <label htmlFor="view-select" className="mr-2">
            Select View:
          </label>
          <select
            id="view-select"
            value={view}
            onChange={(e) => setView(e.target.value as "parties" | "states")}
            className="p-2 border rounded"
          >
            <option value="parties">Parties</option>
            <option value="states">States (Länder)</option>
          </select>
        </div>
      </div>
      <div className="space-y-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Overhang Seats Chart</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="seats" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Overhang Seats Table</h3>
          <TableContainer component={Paper}>
            <Table size="small" aria-label="a dense table">
              <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
              <TableBody>
                {visibleRows.map((row) => (
                  <TableRow key={row.name} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                    <TableCell component="th" scope="row" sx={{ whiteSpace: "nowrap" }}>
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

