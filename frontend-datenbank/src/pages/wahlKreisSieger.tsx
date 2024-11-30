import {useEffect, useState} from "react";
import {
    FormControl,
    InputLabel,
    MenuItem,
    Select, SelectChangeEvent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from "@mui/material";

const years = [2017, 2021]

export default function WahlKreisSieger() {

    const [data, setData] = useState<null | {
        "wahlkreisId": number,
        "wahlkreisName": string,
        "parteiNameErstStimme": string,
        "parteiNameZweitStimme": string,
    }[]>(null);

    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(2021);

    const updateYear = (event: SelectChangeEvent<unknown>) => {
        const value = event.target.value as number;
        setYear(value);
    };

    useEffect(() => {
        setLoading(true);
        fetch(import.meta.env.VITE_API_URL + "/ergebnisse/wahlkreisSieger/" + year)
            .then(res => res.json())
            .then(data => {
                setData(data);
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
            <TableContainer sx={{width: '80%'}}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell> Wahlkreis (id) </TableCell>
                            <TableCell> Gewinner Partei Erststimme </TableCell>
                            <TableCell> Gewinner Partei Zweitstimme</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data?.map((wahlkreis) =>
                            <TableRow>
                                <TableCell> {wahlkreis.wahlkreisName} ({wahlkreis.wahlkreisId}) </TableCell>
                                <TableCell> {wahlkreis.parteiNameErstStimme}</TableCell>
                                <TableCell> {wahlkreis.parteiNameZweitStimme}</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );

}