"use client"

import {useEffect, useState} from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
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
import {Sitzverteilung} from "@/models/models";
import {electionApi} from "@/services/api";

const colorsMap: Map<string, [string, number]> = new Map([
  ['GRÜNE',     ['#78bc1b', 3]],
  ['DIE LINKE', ['#bd3075', 1]],
  ['FDP',       ['#ffcc00', 4]],
  ['AfD',       ['#0021c8', 6]],
  ['SPD',       ['#d71f1d', 2]],
  ['Union',     ['#121212', 5]],
])

type SeatData = Sitzverteilung

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
  id: keyof SeatData
  label: string
  numeric: boolean
}

const headCells: readonly HeadCell[] = [
  { id: "kurzbezeichnung", numeric: false, label: "Party" },
  { id: "sitze", numeric: true, label: "Seats" },
]

interface EnhancedTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof SeatData) => void
  order: Order
  orderBy: string
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort } = props
  const createSortHandler = (property: keyof SeatData) => (event: React.MouseEvent<unknown>) => {
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
                  size="small"
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

export default function SeatDistribution() {
  const [year, setYear] = useState<2017 | 2021>(2021)
  const [order, setOrder] = useState<Order>("desc")
  const [orderBy, setOrderBy] = useState<keyof SeatData>("sitze")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(15)
  const [data, setData] = useState<Sitzverteilung[]>([]);

  const loadData = async (year: number) => {
    try {
      const response = await electionApi.getSeatDistribution(year);
      setData(response);
    } catch (error) {
      console.error('Failed to fetch Sitzverteilung data:', error);
    }
  };

  useEffect(() => {
    loadData(year).then();
  }, [year]);
  
  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof SeatData) => {
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

  const dataPipe = data.filter(val => !['CDU', 'CSU'].includes(val.kurzbezeichnung));
  dataPipe.push({
    kurzbezeichnung: 'Union',
    sitze: data.reduce((accumulator, currentValue) => ['CDU', 'CSU'].includes(currentValue.kurzbezeichnung) ?  accumulator + currentValue.sitze : accumulator, 0)
  })
  dataPipe.sort((a, b) => {
    const aNum = colorsMap.get(a.kurzbezeichnung);
    const bNum = colorsMap.get(b.kurzbezeichnung);
    return (aNum ? aNum[1] : 10 )- (bNum ? bNum[1] : 10);
  })

  return (
      <div className="px-4 py-6 sm:px-0">
        <h2 className="text-2xl font-bold mb-4">Q1: Seat Distribution</h2>
        <div className="mb-4">
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
        <div className="space-y-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Seat Distribution</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                    data={dataPipe}
                    cx="50%"
                    cy="100%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={60}
                    outerRadius={180}
                    paddingAngle={2}
                    dataKey="sitze"
                    nameKey="kurzbezeichnung"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {dataPipe.map((entry, index) => {
                      const color = colorsMap.get(entry.kurzbezeichnung) ?? ['#8d8d8d'];
                      return <Cell key={`cell-${index}`} fill={color[0]} />
                  })}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Detailed Results</h3>
            <TableContainer component={Paper}>
              <Table size="small" aria-label="a dense table">
                <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
                <TableBody>
                  {visibleRows.map((row) => (
                      <TableRow key={row.kurzbezeichnung} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                        <TableCell component="th" scope="row" size="small" sx={{ whiteSpace: "nowrap" }}>
                          {row.kurzbezeichnung}
                        </TableCell>
                        <TableCell align="right" size="small" sx={{ whiteSpace: "nowrap" }}>
                          {row.sitze}
                        </TableCell>
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

