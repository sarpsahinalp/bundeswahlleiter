// Import necessary dependencies
import React, { useEffect, useState } from "react";
import {
    Box,
    CircularProgress,
    Typography,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
} from "@mui/material";
import { fetchNonVoters } from "../services/AnalyseService.ts";

// Define the data type
interface NonVoters {
    wahlkreisName: string;
    nonVoters: number;
    type: string;
}

const NonVoterTablePage: React.FC = () => {
    const [nonVoterData, setNonVoterData] = useState<NonVoters[]>([]);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState<number>(2021); // Default year
    const [type, setType] = useState<string>("erststimme"); // Default type

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // Fetch non-voter data
    useEffect(() => {
        const loadNonVoters = async () => {
            setLoading(true);
            try {
                const data = await fetchNonVoters(year, type);
                setNonVoterData(data);
            } catch (error) {
                console.error("Error loading non voters data", error);
            } finally {
                setLoading(false);
            }
        };

        loadNonVoters();
    }, [year, type]);

    // Handle pagination changes
    const handleChangePage = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Show loader while fetching data
    if (loading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ padding: 4 }}>
            {/* Page Title */}
            <Typography variant="h4" gutterBottom>
                Non Voter Analysis
            </Typography>

            {/* Dropdowns to select Year and Type */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "flex-start",
                    gap: 2,
                    marginBottom: 3,
                }}
            >
                {/* Dropdown for Year */}
                <FormControl sx={{ width: 150 }}>
                    <InputLabel>Year</InputLabel>
                    <Select
                        value={year}
                        label="Year"
                        onChange={(e) => setYear(e.target.value as number)}
                    >
                        <MenuItem value={2017}>2017</MenuItem>
                        <MenuItem value={2021}>2021</MenuItem>
                    </Select>
                </FormControl>

                {/* Dropdown for Type */}
                <FormControl sx={{ width: 150 }}>
                    <InputLabel>Type</InputLabel>
                    <Select
                        value={type}
                        label="Type"
                        onChange={(e) => setType(e.target.value as string)}
                    >
                        <MenuItem value="erststimme">Erststimme</MenuItem>
                        <MenuItem value="zweitstimme">Zweitstimme</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Table with data */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Wahlkreis Name</TableCell>
                            <TableCell>Non Voters</TableCell>
                            <TableCell>Type</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {nonVoterData
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.wahlkreisName}</TableCell>
                                    <TableCell>{item.nonVoters}</TableCell>
                                    <TableCell>{item.type}</TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination Controls */}
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={nonVoterData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Box>
    );
};

export default NonVoterTablePage;
