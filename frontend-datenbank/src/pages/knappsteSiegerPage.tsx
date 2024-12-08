import React, { useState, useEffect } from "react";
import {
    Box,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TableSortLabel,
} from "@mui/material";
import { KnappsteSieger } from "../models/knappsteSieger";
import { fetchKnappsteSieger } from "../services/AnalyseService";
import PaginationComponent from "../Components/PaginationComponent.tsx";

const KnappsteSiegerPage: React.FC = () => {
    const [year, setYear] = useState<number>(2021); // Default year
    const [partyFilter, setPartyFilter] = useState<string>("");
    const [wahlkreisFilter, setWahlkreisFilter] = useState<string>("");
    const [data, setData] = useState<KnappsteSieger[]>([]);
    const [filteredData, setFilteredData] = useState<KnappsteSieger[]>([]);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // Default sorting order
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10; // Number of rows per page

    useEffect(() => {
        const fetchData = async () => {
            try {
                const results = await fetchKnappsteSieger(year);
                setData(results);
                setFilteredData(results);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, [year]);

    // Filter data based on inputs
    useEffect(() => {
        setFilteredData(
            data.filter(
                (row) =>
                    (partyFilter === "" || row.parteiName.includes(partyFilter)) &&
                    (wahlkreisFilter === "" || row.wahlKreisName.includes(wahlkreisFilter))
            )
        );
    }, [partyFilter, wahlkreisFilter, data]);

    // Handle sorting by "Difference"
    const handleSort = () => {
        const sortedData = [...filteredData].sort((a, b) => {
            if (sortOrder === "asc") {
                return a.differenz - b.differenz;
            } else {
                return b.differenz - a.differenz;
            }
        });
        setFilteredData(sortedData);
        setSortOrder(sortOrder === "asc" ? "desc" : "asc"); // Toggle sort order
    };

    // Paginated data
    const paginatedData = filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    return (
        <Box sx={{ padding: 4 }}>
            <Box sx={{ marginBottom: 4, display: "flex", gap: 0 }}>
                <TextField
                    label="Year"
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    sx={{ width: 120 }}
                />
                <TextField
                    label="Party"
                    value={partyFilter}
                    onChange={(e) => setPartyFilter(e.target.value)}
                    sx={{ width: 200 }}
                />
                <TextField
                    label="Wahlkreis"
                    type="string"
                    value={wahlkreisFilter}
                    onChange={(e) => setWahlkreisFilter(e.target.value)}
                    sx={{ width: 200 }}
                />
                <Button
                    variant="contained"
                    onClick={() => setFilteredData(data)} // Reset filter
                >
                    Reset
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Party</TableCell>
                            <TableCell>Wahlkreis</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Votes</TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={true}
                                    direction={sortOrder}
                                    onClick={handleSort}
                                >
                                    Difference
                                </TableSortLabel>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedData.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell>{row.parteiName}</TableCell>
                                <TableCell>{row.wahlKreisName}</TableCell>
                                <TableCell>{row.typ}</TableCell>
                                <TableCell>{row.stimmen}</TableCell>
                                <TableCell>{row.differenz}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <PaginationComponent
                totalItems={filteredData.length}
                itemsPerPage={rowsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
            />
        </Box>
    );
};

export default KnappsteSiegerPage;