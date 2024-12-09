import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Box, Typography, CircularProgress, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import {SocioCulturalStats} from "../models/SocioCulturalStats.ts";
import {fetchSocioCulturalStats} from "../services/AnalyseService.ts";

const SocioCulturalStatsChart: React.FC<{ availableYears: number[] }> = ({ availableYears }) => {
    const [year, setYear] = useState<number>(availableYears[0]);
    const [stats, setStats] = useState<SocioCulturalStats[]>([]);
    const [loading, setLoading] = useState<boolean>(true);


    const loadData = async (year: number) => {
        setLoading(true);
        try {
            const response = await fetchSocioCulturalStats(year); // Pass the year to the backend API
            setStats(response);
        } catch (error) {
            console.error('Failed to fetch Sitzverteilung data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData(year).then(); // Fetch data when the selected year changes
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

    if (stats.length === 0) {
        return (
            <Typography variant="h6" align="center">
                No data available for the year {year}.
            </Typography>
        );
    }

    const labels = Object.keys(stats[0].averages);
    const datasets = stats.map((stat) => ({
        label: `${stat.winningParty} (${stat.type})`,
        averages: stat.averages,
    }));

    const chartData = labels.map((label) => ({
        name: label,
        ...Object.fromEntries(
            datasets.map((dataset) => [dataset.label, dataset.averages[label] || 0])
        ),
    }));

    const colors = [
        "#FF6384",
        "#36A2EB",
        "#FFCE56",
        "#4BC0C0",
        "#9966FF",
        "#FF9F40",
    ];

    // @ts-ignore
    // @ts-ignore
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

            <BarChart
                data={chartData}
                width={800}
                height={500}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                {datasets.map((dataset, index) => (
                    <Bar
                        key={dataset.label}
                        dataKey={dataset.label}
                        fill={colors[index % colors.length]}
                    />
                ))}
            </BarChart>
        </Box>
    );
};

export default SocioCulturalStatsChart;
