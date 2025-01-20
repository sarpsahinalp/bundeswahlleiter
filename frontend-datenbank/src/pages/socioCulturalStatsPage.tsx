import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Box, Typography, CircularProgress, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { SocioCulturalStats } from "../models/SocioCulturalStats.ts";
import { fetchSocioCulturalStats } from "../services/AnalyseService.ts";

const SocioCulturalStatsChart: React.FC<{ availableYears: number[] }> = ({ availableYears }) => {
    const [year, setYear] = useState<number>(availableYears[0]);
    const [stats, setStats] = useState<SocioCulturalStats[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const loadData = async (year: number) => {
        setLoading(true);
        try {
            const response = await fetchSocioCulturalStats(year); // Fetch data from backend
            setStats(response);
        } catch (error) {
            console.error('Failed to fetch socio-cultural statistics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData(year).then(); // Load data when the selected year changes
    }, [year]);

    const handleYearChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setYear(event.target.value as number);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress />
            </Box>
        );
    }

    if (!stats) {
        return (
            <Typography variant="h6" align="center">
                No data available for the year {year}.
            </Typography>
        );
    }

    // Preparing data for the chart
    const chartData = stats.map((item) => ({
        name: item.winningParty,
        value: item.alqInsgesamt,
    }));

    const colors = [
        "#FF6384",
        "#36A2EB",
        "#FFCE56",
        "#4BC0C0",
        "#9966FF",
        "#FF9F40",
    ];

    return (
        <Box>
            <Typography variant="h5" align="center" gutterBottom>
                Socio-Cultural Statistics
            </Typography>

            <FormControl fullWidth style={{ marginBottom: "20px" }}>
                <InputLabel id="year-select-label">Year</InputLabel>
                <Select
                    labelId="year-select-label"
                    value={year}
                    onChange={handleYearChange}
                    label="Year"
                >
                    {availableYears.map((availableYear) => (
                        <MenuItem key={availableYear} value={availableYear}>
                            {availableYear}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <BarChart width={800} height={400} data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                {chartData.map((_entry, index) => (
                    <Bar key={index} dataKey="value" fill={colors[index % colors.length]} />
                ))}
            </BarChart>
        </Box>
    );
};

export default SocioCulturalStatsChart;
