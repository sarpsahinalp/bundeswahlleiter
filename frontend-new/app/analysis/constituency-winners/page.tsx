"use client"

import { useState } from "react"
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

type ConstituencyWinner = {
  id: number
  name: string
  firstVoteWinner: string
  secondVoteWinner: string
}

type Order = "asc" | "desc"

// Mock data for constituency winners
const generateMockData = (year: number) =>
  Array.from({ length: 299 }, (_, i) => ({
    id: i + 1,
    name: `Constituency ${i + 1} (${year})`,
    firstVoteWinner: ["CDU/CSU", "SPD", "AfD", "FDP", "Die Linke", "Grüne"][Math.floor(Math.random() * 6)],
    secondVoteWinner: ["CDU/CSU", "SPD", "AfD", "FDP", "Die Linke", "Grüne"][Math.floor(Math.random() * 6)],
  }))

const mockData = {
  2017: generateMockData(2017),
  2021: generateMockData(2021),
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
  id: keyof ConstituencyWinner
  label: string
  numeric: boolean
}

const headCells: readonly HeadCell[] = [
  { id: "name", numeric: false, label: "Constituency" },
  { id: "firstVoteWinner", numeric: false, label: "First Vote Winner" },
  { id: "secondVoteWinner", numeric: false, label: "Second Vote Winner" },
]

interface EnhancedTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof ConstituencyWinner) => void
  order: Order
  orderBy: string
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort } = props
  const createSortHandler = (property: keyof ConstituencyWinner) => (event: React.MouseEvent<unknown>) => {
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

export default function ConstituencyWinners() {
  const [year, setYear] = useState<2017 | 2021>(2021)
  const [filter, setFilter] = useState("")
  const [order, setOrder] = useState<Order>("asc")
  const [orderBy, setOrderBy] = useState<keyof ConstituencyWinner>("name")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(15)

  const data = mockData[year]

  const filteredData = data.filter(
    (winner) =>
      winner.name.toLowerCase().includes(filter.toLowerCase()) ||
      winner.firstVoteWinner.toLowerCase().includes(filter.toLowerCase()) ||
      winner.secondVoteWinner.toLowerCase().includes(filter.toLowerCase()),
  )

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof ConstituencyWinner) => {
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

  const sortedRows = stableSort(filteredData, getComparator(order, orderBy))
  const visibleRows = sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <div className="px-4 py-6 sm:px-0">
      <h2 className="text-2xl font-bold mb-4">Q4: Constituency Winners</h2>
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
        <div className="flex-grow">
          <input
            type="text"
            placeholder="Filter constituencies..."
            className="w-full p-2 border rounded"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <TableContainer component={Paper}>
          <Table size="small" aria-label="a dense table">
            <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
            <TableBody>
              {visibleRows.map((row) => (
                <TableRow key={row.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell component="th" scope="row" sx={{ whiteSpace: "nowrap" }}>
                    {row.name}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{row.firstVoteWinner}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{row.secondVoteWinner}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[15, 30, 50]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </div>
    </div>
  )
}

