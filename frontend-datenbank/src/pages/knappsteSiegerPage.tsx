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
} from "@mui/material";
import {KnappsteSieger} from "../models/knappsteSieger.ts";
import {fetchKnappsteSieger} from "../services/AnalyseService.ts";

const KnappsteSiegerPage: React.FC = () => {
    const [year, setYear] = useState<number>(2023); // Default year
    const [partyFilter, setPartyFilter] = useState<string>("");
    const [wahlkreisFilter, setWahlkreisFilter] = useState<string>("");
    const [data, setData] = useState<KnappsteSieger[]>([]);
    const [filteredData, setFilteredData] = useState<KnappsteSieger[]>([]);

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
                    (wahlkreisFilter === "" || row.wahlKreisName === wahlkreisFilter)
            )
        );
    }, [partyFilter, wahlkreisFilter, data]);

    return (
        <Box sx={{ padding: 4 }}>
            <Box sx={{ marginBottom: 4, display: "flex", gap: 2 }}>
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
                    onChange={(e) =>
                        setWahlkreisFilter(e.target.value)
                    }
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
                            <TableCell>Difference</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredData.map((row, index) => (
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
        </Box>
    );
};

export default KnappsteSiegerPage;