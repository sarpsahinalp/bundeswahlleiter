import {useEffect, useState} from "react";
import {Bundesland} from "../models/Bundesland.ts";
import {fetchBundesLander, fetchMandate} from "../services/AnalyseService.ts";
import {Mandat} from "../models/mandat.ts";
import {
    Box, CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Table, TableBody, TableCell, TableHead, TableRow
} from "@mui/material";

const years = [2017, 2021]

export default function BundestagsMitglieder() {
    const [bundeslander, setBundeslander] = useState<Bundesland[]>([])
    const [land , setLand] = useState<Bundesland | null>(null)
    const [mandate, setMandate] = useState<Mandat[]>([])
    const [year, setYear] = useState(2021);
    const [loading, setLoading] = useState(false);

    const loadBundesLander = async () => {
        try {
            const response = await fetchBundesLander();
            setBundeslander(response);
        } catch (error) {
            console.error('Failed to fetch grouped data:', error);
        }
    }

    const loadMandate = async (year: number, bundesland_id: number) => {
        setLoading(true);
        try {
            const response = await fetchMandate(year, bundesland_id);
            response.sort((mA, mB) => mA.partei.localeCompare(mB.partei));
            setMandate(response);
        } catch (error) {
            console.error('Failed to fetch mandate:', error);
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        loadBundesLander().then();
    }, []);

    useEffect(() => {
        if(!land) {
            return;
        }
        loadMandate(year, land.id).then();
    }, [year, land]);

    const updateYear = (event: SelectChangeEvent<unknown>) => {
        const value = event.target.value as number;
        setYear(value);
    };

    const updateLand = (event: SelectChangeEvent<unknown>) => {
        const bundesland_id = event.target.value as number;
        const land = bundeslander.find(b => b.id === bundesland_id) ?? null;
        setLand(land);
    }

    const render = (bundestagMitglieder: Mandat[]) => {
        if (loading) {
            return (
                <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                    <CircularProgress />
                </Box>
            );
        }

        return (
            <div>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Partei</TableCell>
                            <TableCell>wahlkreis</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {bundestagMitglieder.map((mandat, index) => (
                            <TableRow>
                                <TableCell>{index}</TableCell>
                                <TableCell>{mandat.nachname}, {mandat.vorname}</TableCell>
                                <TableCell>{mandat.partei}</TableCell>
                                <TableCell align={'right'}>{mandat.wahlkreis_id}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )
    }

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
            <FormControl>
                <InputLabel>Bundesland</InputLabel>
                <Select
                    value={land?.id}
                    label="Bundesland"
                    onChange={updateLand}
                    sx={{width: 200}}
                >
                    {bundeslander.map(b => (
                        <MenuItem value={b.id}>{b.id} {b.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            {mandate ? render(mandate) : ''}
        </div>
    )
}