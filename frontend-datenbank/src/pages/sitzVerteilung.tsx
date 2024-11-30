import {PieChart} from '@mui/x-charts/PieChart';
import {useEffect, useState} from "react";
import {FormControl, InputLabel, MenuItem, Select, SelectChangeEvent} from "@mui/material";

const years = [2021]

type sitzverteilung = {
    kurzbezeichnung: string,
    sitze: number,
}

type row = {
    value: number,
    label: string,
    color: string,
}

const colors: Map<string, string> = new Map([
    ['GRÜNE', '#78bc1b'],
    ['DIE LINKE', '#bd3075'],
    ['FDP', '#ffcc00'],
    ['AfD', '#0021c8'],
    ['SPD', '#d71f1d'],
    ['CSU', '#121212'],
    ['CDU', '#125000'],
])

export default function SitzVerteilung() {

    const [data, setData] = useState<row[]>([]);

    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(2021);

    const updateYear = (event: SelectChangeEvent<unknown>) => {
        const value = event.target.value as number;
        setYear(value);
    };

    useEffect(() => {
        setLoading(true);
        fetch(import.meta.env.VITE_API_URL + "/ergebnisse/sitzverteilung/" + year)
            .then(res => res.json())
            .then(data => {
                const value = data as sitzverteilung[];
                const rows: row[] = value.map(sV => {
                    const color = colors.get(sV.kurzbezeichnung)
                    return {
                        value: sV.sitze,
                        label: sV.kurzbezeichnung,
                        color: color ? color : '#c6bf96',
                    }
                })
                setData(rows);
                setLoading(false);
            })
    }, [year]);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <FormControl>
                <InputLabel>Jahr</InputLabel>
                <Select
                    value={year}
                    label="Jahr"
                    onChange={updateYear}
                >
                    {years.map(year => (
                        <MenuItem value={year}>{year}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <PieChart
                sx={{width: 500, height: 500}}
                series={[{
                    data: data,
                    startAngle: -90,
                    endAngle: 90,
                    innerRadius: 30,
                    outerRadius: 300,
                    highlightScope: {fade: 'global', highlight: 'item'},
                }]}
                width={1000}
                height={700}
            />
        </div>
    )
}