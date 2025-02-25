"use client"

import { useEffect, useState } from "react"
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

type ClosestResult = {
  constituency: string
  party: string
  margin: number
}

type Order = "asc" | "desc"

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (orderBy === "margin") {
    return Math.abs(b[orderBy] as number) - Math.abs(a[orderBy] as number)
  }
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
  id: keyof ClosestResult
  label: string
  numeric: boolean
}

const headCells: readonly HeadCell[] = [
  { id: "constituency", numeric: false, label: "Constituency" },
  { id: "party", numeric: false, label: "Party" },
  { id: "margin", numeric: true, label: "Margin" },
]

interface EnhancedTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof ClosestResult) => void
  order: Order
  orderBy: string
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort } = props
  const createSortHandler = (property: keyof ClosestResult) => (event: React.MouseEvent<unknown>) => {
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

export default function ClosestResults() {
  const [year, setYear] = useState<number>(2021)
  const [selectedParty, setSelectedParty] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [order, setOrder] = useState<Order>("asc")
  const [orderBy, setOrderBy] = useState<keyof ClosestResult>("margin")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(15)

  const [yearsArray, setYearsArray] = useState<number[]>([])
  const [data, setData] = useState<ClosestResult[]>([])
  const [filteredAndSortedData, setFilteredAndSortedData] = useState<ClosestResult[]>([])

  const loadYear = async () => {
    const response = await electionApi.getJahre()
    setYearsArray(response)
  }

  useEffect(() => {
    loadYear()
  }, []) //Fixed: Added empty dependency array []

  const fetchData = async (jahr: number) => {
    try {
      const results = await electionApi.getClosestResults(jahr)
      setData(
          results.map((sieger) => ({
            party: sieger.parteiName,
            constituency: sieger.wahlKreisName,
            margin: sieger.typ === "Sieg" ? sieger.differenz : -sieger.differenz,
          })),
      )
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  useEffect(() => {
    fetchData(year)
  }, [year])

  useEffect(() => {
    const filtered = data.filter(
        (result) =>
            (selectedParty === "All" || result.party === selectedParty) &&
            result.constituency.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    const sorted = stableSort(filtered, getComparator(order, orderBy))
    setFilteredAndSortedData(sorted)
    setPage(0) // Reset to first page when filters or sorting change
  }, [data, selectedParty, searchTerm, order, orderBy])

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof ClosestResult) => {
    const isAsc = orderBy === property && order === "asc"
    setOrder(isAsc ? "desc" : "asc")
    setOrderBy(property)
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = Number.parseInt(event.target.value, 10)
    setRowsPerPage(newRowsPerPage)
    setPage(0)
  }

  const visibleRows = filteredAndSortedData.slice(page * rowsPerPage, (page + 1) * rowsPerPage)

  const parties = Array.from(new Set(data.map((result) => result.party)))

  return (
      <div className="px-4 py-6 sm:px-0">
        <h2 className="text-2xl font-bold mb-4">Q6: Closest Results</h2>
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
                  <option key={year} value={year}>
                    {year}
                  </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="party-select" className="mr-2">
              Select Party:
            </label>
            <select
                id="party-select"
                value={selectedParty}
                onChange={(e) => setSelectedParty(e.target.value)}
                className="p-2 border rounded"
            >
              <option value="All">All Parties</option>
              {parties.map((party) => (
                  <option key={party} value={party}>
                    {party}
                  </option>
              ))}
            </select>
          </div>
          <div className="flex-grow">
            <input
                type="text"
                placeholder="Search constituencies..."
                className="w-full p-2 border rounded"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <TableContainer component={Paper}>
            <Table size="small" aria-label="a dense table" sx={{ minWidth: 650 }}>
              <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
              <TableBody>
                {visibleRows.map((row) => (
                    <TableRow key={row.constituency} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                      <TableCell component="th" scope="row" sx={{ whiteSpace: "nowrap" }}>
                        {row.constituency}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>{row.party}</TableCell>
                      <TableCell
                          align="right"
                          sx={{
                            whiteSpace: "nowrap",
                            color: row.margin > 0 ? "green" : "red",
                            fontWeight: "bold",
                          }}
                      >
                        {row.margin > 0 ? "+" : "-"}
                        {Math.abs(row.margin)} votes
                      </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
              rowsPerPageOptions={[15, 30, 50]}
              component="div"
              count={filteredAndSortedData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </div>
      </div>
  )
}

