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

// Mock data for constituencies
const constituencies = [
  { id: "1", name: "Berlin-Mitte" },
  { id: "2", name: "Hamburg-Mitte" },
  { id: "3", name: "München-Nord" },
]

// Mock data for constituency details
const constituencyData = {
  2017: {
    "1": {
      turnout: 75.9,
      directCandidate: "John Doe (CDU)",
      votes: [
        { party: "CDU/CSU", votes: 28000, percentage: 31.8, change: -3.5 },
        { party: "SPD", votes: 25000, percentage: 28.4, change: -5.2 },
        { party: "AfD", votes: 9000, percentage: 10.2, change: 8.9 },
        { party: "FDP", votes: 8000, percentage: 9.1, change: 5.2 },
        { party: "Die Linke", votes: 9000, percentage: 10.2, change: 0.8 },
        { party: "Grüne", votes: 9000, percentage: 10.2, change: -0.5 },
      ],
    },
    // Add similar data for other constituencies
  },
  2021: {
    "1": {
      turnout: 76.5,
      directCandidate: "Jane Doe (SPD)",
      votes: [
        { party: "CDU/CSU", votes: 25000, percentage: 28.4, change: -3.4 },
        { party: "SPD", votes: 30000, percentage: 34.1, change: 5.7 },
        { party: "AfD", votes: 8000, percentage: 9.1, change: -1.1 },
        { party: "FDP", votes: 10000, percentage: 11.4, change: 2.3 },
        { party: "Die Linke", votes: 7000, percentage: 8.0, change: -2.2 },
        { party: "Grüne", votes: 8000, percentage: 9.1, change: -1.1 },
      ],
    },
    // Add similar data for other constituencies
  },
}

type VoteData = {
  party: string
  votes: number
  percentage: number
  change: number
}

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
  id: keyof VoteData
  label: string
  numeric: boolean
}

const headCells: readonly HeadCell[] = [
  { id: "party", numeric: false, label: "Party" },
  { id: "votes", numeric: true, label: "Votes" },
  { id: "percentage", numeric: true, label: "Percentage" },
  { id: "change", numeric: true, label: "Change" },
]

interface EnhancedTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof VoteData) => void
  order: Order
  orderBy: string
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort } = props
  const createSortHandler = (property: keyof VoteData) => (event: React.MouseEvent<unknown>) => {
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

export default function ConstituencyOverview() {
  const [year, setYear] = useState<2017 | 2021>(2021)
  const [selectedConstituency, setSelectedConstituency] = useState("1")
  const [order, setOrder] = useState<Order>("asc")
  const [orderBy, setOrderBy] = useState<keyof VoteData>("party")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(15)

  const data = constituencyData[year][selectedConstituency]

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof VoteData) => {
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

  const sortedRows = stableSort(data.votes, getComparator(order, orderBy))
  const visibleRows = sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

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
            onChange={(e) => setYear(Number(e.target.value) as 2017 | 2021)}
            className="p-2 border rounded"
          >
            <option value={2017}>2017</option>
            <option value={2021}>2021</option>
          </select>
        </div>
        <div>
          <label htmlFor="constituency-select" className="mr-2">
            Select Constituency:
          </label>
          <select
            id="constituency-select"
            value={selectedConstituency}
            onChange={(e) => setSelectedConstituency(e.target.value)}
            className="p-2 border rounded"
          >
            {constituencies.map((constituency) => (
              <option key={constituency.id} value={constituency.id}>
                {constituency.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {data && (
        <div className="space-y-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">General Information</h3>
            <p>Turnout: {data.turnout}%</p>
            <p>Directly Elected Candidate: {data.directCandidate}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Vote Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.votes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="party" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="percentage" fill="#8884d8" name="Percentage" />
                <Bar dataKey="change" fill="#82ca9d" name="Change from previous election" />
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
                    <TableRow key={row.party} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                      <TableCell component="th" scope="row" sx={{ whiteSpace: "nowrap" }}>
                        {row.party}
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                        {row.votes.toLocaleString()}
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                        {row.percentage.toFixed(1)}%
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                        {row.change > 0 ? "+" : ""}
                        {row.change.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[15, 30, 50]}
              component="div"
              count={data.votes.length}
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

