import {useEffect, useRef, useState} from "react";
import * as d3 from "d3";
import "../assets/bookingChart.css"

let date = new Date();
let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

function getRandomNumber(number,min,max){
 return  Array.from({length: number}, () => Math.floor(Math.random() *( max-min+1) )+min)
}

export default function BookingsChart({data}) {
    const [timeSelected, setTimeSelected] = useState("thisYear");
    const [title, setTitle] = useState("Months of years");
    const [relativeTimeIndex, setRelativeTimeIndex] = useState(3);
    // `relativeTimeIndex` représente le décalage temporel en mois par rapport au mois actuel.
    // Exemple :
    // - `relativeTimeIndex = 0` → Mois actuel
    // - `relativeTimeIndex = -2` → Deux mois en arrière
    // - `relativeTimeIndex = 3` → Trois mois dans le futur
    // - `relativeTimeIndex = -12` → Même mois l'année précédente


    const svgRef = useRef(null);
    data.bookingsThisYear =  Array.from({length:5},()=>getRandomNumber(12))
    data.bookingsThis10Years =  Array.from({length:5},()=>getRandomNumber(10))
    data.bookingsThisMonth = Array.from({length:5},()=>getRandomNumber(30))



    //date


    useEffect(() => {
            function run() {
                if (!data || !svgRef.current) return;
                let svg = d3.select(svgRef.current);
                svg.selectAll("*").remove();

                let width = svgRef.current.getBoundingClientRect().width
                const height = svgRef.current.getBoundingClientRect().height
                let margin = {top: 20, right: 30, bottom: 20, left: 40};


                let range;
                let dataToStudy;
                switch (timeSelected) {
                    default:
                        range = [1, 12];
                        dataToStudy = [];
                        setTitle("No data")
                        break
                    case "thisMonth": //each days of this month


                        //aply relativeTimeIndex ( decalage to get previous and next month)
                        //remove 1month or add 1 month
                        // if relativeTimeIndex == 0 nothing changes
                        date.setMonth(date.getMonth() + relativeTimeIndex)
                        firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
                        lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

                        range = [firstDay.getDay(), lastDay.getDay()]
                        dataToStudy = data.bookingsThisMonth[relativeTimeIndex]
                        setTitle("Bookings of  " + monthNames[date.getMonth()]);
                        break;

                    case "thisYear": //each month of this year
                        //aply relativeTimeIndex ( decalage to get previous and next year)
                        //remove 1year or add 1 year
                        // if relativeTimeIndex == 0 nothing changes
                        date.setFullYear(date.getFullYear() + relativeTimeIndex)
                        range = [1, 12]
                        dataToStudy = data.bookingsThisYear[relativeTimeIndex]
                        setTitle("Bookings of year " + date.getFullYear());
                        break;
                    case "this10Years": //each year with year-10
                        //aply relativeTimeIndex ( decalage to get previous and next year)
                        //remove 10year or add 10 year
                        // if relativeTimeIndex == 0 nothing changes
                        date.setFullYear(date.getFullYear() + relativeTimeIndex * 10)
                        // if it's this10Years we wand to go -10 or +10 year
                        // inital : 2010/2020 we dont want 2011-2021 but 2020-2030
                        range = [date.getFullYear() - 10, date.getFullYear()]
                        dataToStudy = data.bookingsThis10Years[relativeTimeIndex]
                        setTitle("Bookings theses years ( " + date.getFullYear() - 10 + ", " + new Date().getFullYear() + ")");
                        break;

                }
                console.log(dataToStudy)
                const max = Math.max(...dataToStudy);

                console.log(range)
                // add axis
                const xScale = d3.scaleLinear()
                    .domain(range)
                    .range([margin.left, width - margin.right]);
                const yScale = d3.scaleLinear()
                    .domain([0, max * 1.1])
                    .range([height - margin.bottom, margin.top])


                //  add axis
                svg.append("g")
                    .attr("transform", `translate(0,${height - margin.bottom})`)
                    .call(d3.axisBottom(xScale).ticks(range[1]).tickFormat(function (d, i) {
                        return monthNames[i]
                    }));

                svg.append("g")
                    .attr("transform", `translate(${margin.left},0)`)
                    .call(d3.axisLeft(yScale).ticks(max / 5));

                //grid
                // ========================  add horizontal line
                let y = 5
                do {
                    console.log(y)
                    svg.append("line")
                        .attr("x1", margin.left)
                        .attr("y1", yScale(y))
                        .attr("x2", width - margin.right)
                        .attr("y2", yScale(y))
                        .attr("stroke-width", 1)
                        .attr("stroke", "var(--stroke");
                    y += 5
                } while (y < max + 5)
                dataToStudy.forEach((d, index) => {
                    if (index === 0) return
                    // add vertical line
                    svg.append("line")
                        .attr("x1", xScale(index))
                        .attr("y1", margin.top)
                        .attr("x2", xScale(index))
                        .attr("y2", height - margin.bottom)
                        .attr("stroke-width", 1)
                        .attr("stroke", "var(--stroke");

                })


                // ======================= add circles
                dataToStudy.forEach((d, index) => {
                    svg.append("circle")
                        .attr("cx", xScale(index + 1))
                        .attr("cy", yScale(d))
                        .attr("r", 3)
                        .attr("fill", "var(--orange")
                        .attr("class", "bookingChartCircle")
                    svg.append("circle")
                        .attr("cx", xScale(index + 1))
                        .attr("cy", yScale(d))
                        .attr("r", 10)
                        .attr("fill", "transparent")
                        .attr("class", "bookingChartCircleHover");

                    svg.append("text")
                        .text(d)
                        .attr("x", xScale(index + 1) - 10)
                        .attr("y", yScale(d) - 10)
                        .attr("r", 3)
                        .attr("fill", "var(--orange")
                        .attr("class", "bookingChartLabel")
                })

                svg.append("text")
                    .text("Place the mouse on points to see values !")
                    .attr("x", margin.left * 2)
                    .attr("y", margin.top * 4)
                    .attr("r", 3)
                    .attr("fill", "var(--grey-text")
                    .attr("class", "bookingChartIndications")

                // add area
                const areaGenerator = d3.area()
                    .x((d, i) => xScale(i + 1))
                    .y0(yScale(0))
                    .y1(d => yScale(d))
                    .curve(d3.curveCatmullRom);

                svg.append("path")
                    .datum(dataToStudy)
                    .attr("fill", "#ffa500bf")
                    .attr("opacity", 0.7)
                    .attr("d", areaGenerator);

            }


            if (svgRef.current) {
                console.log(svgRef.current);
                window.addEventListener("resize", run);
                run();
            }

        }, [data, timeSelected, svgRef]
    )


    return (
        <>
            <div className={"bookingChart whiteContainerWithBordure"}>
                <div className={"bookingChartHeader"}>
                    <span
                        onClick={() => setRelativeTimeIndex(relativeTimeIndex - 1)}
                        className={"noselect"}>Previous</span>
                    <span> {title} </span><span
                    className={"noselect"}
                    onClick={() => setRelativeTimeIndex (relativeTimeIndex + 1)}>Next</span>
                </div>


                <svg ref={svgRef}></svg>
            </div>

        </>


    );
}
