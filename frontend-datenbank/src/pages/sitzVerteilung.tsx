import { PieChart } from '@mui/x-charts/PieChart';

export default function SitzVerteilung() {

    return (
        <PieChart
            series={[
                {
                    data: [
                        {id: 0, value: 39, label: 'Linke'},
                        {id: 1, value: 206, label: 'SPD'},
                        {id: 2, value: 118, label: 'Grüne'},
                        {id: 3, value: 1, label: 'SSW'},
                        {id: 4, value: 91, label: 'FDP'},
                        {id: 5, value: 197, label: 'Union'},
                        {id: 6, value: 83, label: 'AfD'},
                    ],
                    startAngle: -90,
                    endAngle: 90,
                },
            ]}
            width={500}
            height={200}
        />
    )
}