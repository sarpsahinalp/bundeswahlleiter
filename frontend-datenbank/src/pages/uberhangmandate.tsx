import React, { useEffect, useState } from 'react';
import {
    Box,
    CircularProgress,
    Typography,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Button,
    ButtonGroup,
    SelectChangeEvent
} from '@mui/material';
import { BarChart } from '@mui/x-charts';
import {UberhangMandate} from "../models/uberhandmandate.ts";
import {fetchUberhangMandates} from "../services/AnalyseService.ts";

const OverhangMandateChart: React.FC = () => {
    const [data, setData] = useState<UberhangMandate[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedYear, setSelectedYear] = useState<number>(2017);
    const [viewBy, setViewBy] = useState<'bundesland' | 'partei'>('bundesland'); // Default to 'bundesland'

    const loadData = async (year: number, groupBy: 'bundesland' | 'partei') => {
        setLoading(true);
        try {
            const response = await fetchUberhangMandates(year, groupBy);
            setData(response);
        } catch (error) {
            console.error('Failed to fetch grouped data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData(selectedYear, viewBy).then();
    }, [selectedYear, viewBy]);

    const handleYearChange = (event: SelectChangeEvent<unknown>) => {
        setSelectedYear(event.target.value as number);
    };

    const handleViewChange = (view: 'bundesland' | 'partei') => {
        setViewBy(view);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Typography align="center" variant="h6">
                No data available for the selected year and grouping.
            </Typography>
        );
    }

    // Format data to be used in @mui/x-charts/BarChart
    const chartData = data.map((item) => ({
        code: item.groupField.substring(0, 3),  // either 'bundesland' or 'partei'
        groupField: item.groupField,
        mandates: item.mandates,
    }));

    return (
        <Box p={4}>
            <Typography variant="h6" align="center" gutterBottom>
                Überhangmandate pro {viewBy === 'bundesland' ? 'Bundesland' : 'Partei'} - {selectedYear}
            </Typography>

            <FormControl fullWidth sx={{ mb: 4 }}>
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

            <ButtonGroup variant="contained" sx={{ mb: 4 }}>
                <Button
                    onClick={() => handleViewChange('bundesland')}
                >
                    Group by Bundesland
                </Button>
                <Button
                    onClick={() => handleViewChange('partei')}
                >
                    Group by Partei
                </Button>
            </ButtonGroup>

            <BarChart
                dataset={chartData}
                series={[
                    {
                        dataKey: 'mandates',
                        color: '#8884d8',
                        valueFormatter: (value) => `${value} Mandate`,
                    },
                ]}
                width={600}
                height={350}
                xAxis={[{ scaleType: 'band', dataKey: 'code', valueFormatter: (code, context) =>
                        context.location === 'tick'
                            ? code
                            : `${chartData.find((d) => d.code === code)?.groupField} (${code})`, }]}
            />
        </Box>
    );
};

export default OverhangMandateChart;
