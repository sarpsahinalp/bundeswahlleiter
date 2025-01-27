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
import {electionApi} from "@/services/api";

const colorsMap: Map<string, [string, number]> = new Map([
  ['GRÜNE',     ['#78bc1b', 3]],
  ['DIE LINKE', ['#bd3075', 1]],
  ['FDP',       ['#ffcc00', 4]],
  ['AfD',       ['#0021c8', 6]],
  ['SPD',       ['#d71f1d', 2]],
  ['Union',     ['#121212', 5]],
])

const PARTY_FULL_NAMES = new Map([
  ['Union', "Christlich Demokratische Union Deutschlands"],
  ['SPD', "Sozialdemokratische Partei Deutschlands"],
  ['AfD', "Alternative für Deutschland"],
  ['FDP', "Freie Demokratische Partei"],
  ["DIE LINKE", "Die Linke"],
  ['GRÜNE', "Bündnis 90/Die Grünen"],
  ['Other', "Other Parties"],
])

type SeatData = {
  name: string
  seats: number
  prevSeats: number | null
  year: 2017 | 2021
  color: string
}

type Order = "asc" | "desc"

// Custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data: SeatData = payload[0].payload
    const difference = data.seats - (data.prevSeats ?? 0)
    const diffText = difference > 0 ? `+${difference}` : difference

    return (
        <div className="bg-white p-4 shadow-lg rounded-lg border">
          <div className="text-lg font-bold">{data.name}</div>
          <div className="text-sm text-gray-600">{PARTY_FULL_NAMES.get(data.name)}</div>
          {data.prevSeats
              ? <div className="mt-2 font-semibold">
                {data.seats} Sitze (Diff.zu {data.year === 2021 ? "2017" : "2013"}: {diffText} Sitze)
              </div>
              : <div className="mt-2 font-semibold">
                  {data.seats} Sitze
                </div>
          }
        </div>
  )
  }
  return null
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
  id: keyof SeatData
  label: string
  numeric: boolean
}

const headCells: readonly HeadCell[] = [
  { id: "name", numeric: false, label: "Party" },
  { id: "seats", numeric: true, label: "Seats" },
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
  const [orderBy, setOrderBy] = useState<keyof SeatData>("seats")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(15)
  const [data, setData] = useState<SeatData[]>([]);

  const loadData = async (year: 2017 | 2021) => {
    try {
      const response = await electionApi.getSeatDistribution(year);
      let newData: SeatData[] = response.map(res => ({
        name: res.kurzbezeichnung,
        seats: res.sitze,
        prevSeats: res.prevSitze,
        color: (colorsMap.get(res.kurzbezeichnung) ?? ['#8d8d8d'])[0],
        year: year,
      }))
      newData.push({
        name: 'Union',
        seats: newData.reduce((accumulator, currentValue) => ['CDU', 'CSU'].includes(currentValue.name) ?  accumulator + currentValue.seats : accumulator, 0),
        prevSeats: newData.reduce((accumulator, currentValue) => ['CDU', 'CSU'].includes(currentValue.name) ?  accumulator + (currentValue.prevSeats ?? 0) : accumulator, 0),
        color: (colorsMap.get('Union') ?? ['#8d8d8d'])[0],
        year: year,
      })
      newData = newData.filter(val => !['CDU', 'CSU'].includes(val.name));
      newData.sort((a, b) => {
        const aNum = colorsMap.get(a.name);
        const bNum = colorsMap.get(b.name);
        return (aNum ? aNum[1] : 10 )- (bNum ? bNum[1] : 10);
      })
      setData(newData);
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

  return (
      <div className="px-4 py-6 sm:px-0">
        <h2 className="text-2xl font-bold mb-4">Sitzverteilung</h2>
        <h3 className="text-lg mb-4">
          Bundestagswahl {year} {year === 2021 && "(Wiederholung in Teilen Berlins)"}, Deutschland
        </h3>
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
            <div className="text-center mb-4">
              <span className="text-2xl font-bold">{data.reduce((sum, item) => sum + item.seats, 0)} Sitze</span>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="90%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius="60%"
                    outerRadius="90%"
                    paddingAngle={1}
                    dataKey="seats"
                >
                  {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    verticalAlign="top"
                    height={36}
                    formatter={(value, entry) => {
                      const { payload } = entry
                      return `${value} (${payload?.seats})`
                    }}
                />
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
                      <TableRow key={row.name} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                        <TableCell
                            component="th"
                            scope="row"
                            size="small"
                            sx={{
                              whiteSpace: "nowrap",
                              color: row.color,
                            }}
                        >
                          {row.name}
                        </TableCell>
                        <TableCell align="right" size="small" sx={{ whiteSpace: "nowrap" }}>
                          {row.seats}
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

