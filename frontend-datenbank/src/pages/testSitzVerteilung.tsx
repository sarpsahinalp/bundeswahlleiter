import React, {useEffect, useState} from 'react';
import {fetchSitzverteilung} from '../services/AnalyseService.ts';
import {PieChart, Pie, Cell, Tooltip, Legend} from 'recharts';
import {Box, CircularProgress, Typography, MenuItem, Select, FormControl, InputLabel} from '@mui/material';
import {Sitzverteilung} from "../models/sitzverteilung.ts";

// Extended color palette to handle more than 9 items
const COLORS = [
    '#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#33FFA7', '#A133FF', '#FFD433', '#FF9633',
    '#33FF96', '#9633FF', '#FF3333', '#3333FF', '#33FF33', '#A1FF33', '#33A1FF', '#FFA733',
    '#73FF33', '#3373FF', '#FF3373', '#FF33FF', '#33FFFF', '#FFFF33', '#A1A1FF', '#FFA1A1',
];

const SitzverteilungPieChart: React.FC = () => {
    const [data, setData] = useState<Sitzverteilung[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedYear, setSelectedYear] = useState<number>(2017); // Default year

    const loadData = async (year: number) => {
        setLoading(true);
        try {
            const response = await fetchSitzverteilung(year); // Pass the year to the backend API
            setData(response);
        } catch (error) {
            console.error('Failed to fetch Sitzverteilung data:', error);
        } finally {
            setLoading(false);
        }
    };
;
    useEffect(() => {
        loadData(selectedYear); // Fetch data when the selected year changes
    }, [selectedYear]);

    const handleYearChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setSelectedYear(event.target.value as number);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress/>
            </Box>
        );
    }

    return (
        <Box p={4}>
            <Typography variant="h6" align="center" gutterBottom>
                Sitzverteilung (Seat Distribution) - {selectedYear}
            </Typography>

            {/* Year Selection Dropdown */}
            <FormControl fullWidth sx={{mb: 4}}>
                <InputLabel id="year-select-label">Select Year</InputLabel>
                <Select
                    labelId="year-select-label"
                    value={selectedYear}
                    onChange={handleYearChange}
                >
                    <MenuItem value={2017}>2017</MenuItem>
                    <MenuItem value={2021}>2021</MenuItem>
                </Select>
            </FormControl>

            {/* Pie Chart */}
            <PieChart
                width={1000}
                height={700}
            >
                <Pie
                    data={data}
                    dataKey="sitze"
                    nameKey="kurzbezeichnung"
                    cx="50%"
                    cy="50%"
                    startAngle={0}
                    endAngle={180}
                    innerRadius={30}
                    outerRadius={300}
                    fill="#8884d8"
                    label={(entry) => `${entry.kurzbezeichnung}: ${entry.sitze}`}
                >
                    {data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                    ))}
                </Pie>
                <Tooltip/>
                <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
        </Box>
    );
};

export default SitzverteilungPieChart;