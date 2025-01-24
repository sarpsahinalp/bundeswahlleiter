"use client"

import {ChangeEvent, useEffect, useState} from "react"
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
import {Bundesland} from "@/models/models";
import {electionApi} from "@/services/api";

type ParliamentMember = {
  id: number
  name: string
  party: string
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
  id: keyof ParliamentMember
  label: string
  numeric: boolean
}

const headCells: readonly HeadCell[] = [
  { id: "name", numeric: false, label: "Name" },
  { id: "party", numeric: false, label: "Party" },
]

interface EnhancedTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof ParliamentMember) => void
  order: Order
  orderBy: string
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort } = props
  const createSortHandler = (property: keyof ParliamentMember) => (event: React.MouseEvent<unknown>) => {
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

export default function ParliamentMembers() {
  const [year, setYear] = useState<2017 | 2021>(2021)
  const [searchTerm, setSearchTerm] = useState("")
  const [order, setOrder] = useState<Order>("asc")
  const [orderBy, setOrderBy] = useState<keyof ParliamentMember>("name")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(15)

  const [mandate, setMandate] = useState<ParliamentMember[]>([])
  const [bundeslander, setBundeslander] = useState<Bundesland[]>([])
  const [land , setLand] = useState<Bundesland | null>(null)

  const loadBundesLander = async () => {
    try {
      const response = await electionApi.getAllBundeslander();
      setBundeslander(response);
    } catch (error) {
      console.error('Failed to fetch grouped data:', error);
    }
  }

  const loadMandate = async (year: number, bundesland_id: number) => {
    try {
      const response = await electionApi.getParliamentMembers(year, bundesland_id);
      response.sort((mA, mB) => mA.partei.localeCompare(mB.partei));
      setMandate(response.map((mandat, index) => ({
        party: mandat.partei,
        name: mandat.nachname + ', ' + mandat.vorname,
        id: index
      })));
    } catch (error) {
      console.error('Failed to fetch mandate:', error);
    }
  }

  useEffect(() => {
    loadBundesLander().then();
  }, []);

  useEffect(() => {
    if(!land) {
      return;
    }
    loadMandate(year, land.id).then();
  }, [year, land]);

  const filteredData = mandate.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.party.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof ParliamentMember) => {
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

  const updateLand = (event:ChangeEvent<HTMLSelectElement>) => {
    const bundesland_id = parseInt(event.target.value);
    const land = bundeslander.find(b => b.id === bundesland_id) ?? null;
    setLand(land);
  }

  const sortedRows = stableSort(filteredData, getComparator(order, orderBy))
  const visibleRows = sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <div className="px-4 py-6 sm:px-0">
      <h2 className="text-2xl font-bold mb-4">Q2: Members of Parliament</h2>
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
          <label htmlFor="bundesland-select" className="mr-2">
            Select Constituency:
          </label>
          <select
              id="bundesland-select"
              value={land?.id}
              onChange={updateLand}
              className="p-2 border rounded"
          >
            {bundeslander.map((land) => (
                <option key={land.id} value={land.id}>
                  {land.name}
                </option>
            ))}
          </select>
        </div>
        <div className="flex-grow">
          <input
              type="text"
              placeholder="Search members..."
              className="w-full p-2 border rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <TableContainer component={Paper}>
          <Table size="small" aria-label="a dense table" sx={{minWidth: 650}}>
            <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort}/>
            <TableBody>
              {visibleRows.map((row) => (
                  <TableRow key={row.id} sx={{"&:last-child td, &:last-child th": {border: 0}}}>
                    <TableCell component="th" scope="row" sx={{whiteSpace: "nowrap"}}>
                    {row.name}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{row.party}</TableCell>
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

