import {useEffect, useRef, useState} from "react";
import * as d3 from "d3";
import "../assets/bookingChart.css"

let todayDate = new Date();
let firstDay = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
let lastDay = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0);
const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

function getArrayOfRandomNumber(number, min, max) {
    return Array.from({length: number}, () => Math.floor(Math.random() * (max - min + 1)) + min)
}

export default function BookingsChart({data}) {
    const [timeSelected, setTimeSelected] = useState("thisYear");
    const [title, setTitle] = useState("Months of years");
    const [relativeTimeIndex, setRelativeTimeIndex] = useState(0);
    const [isUsingFakeData, setIsUsingFakeData] = useState(true);
    // `relativeTimeIndex` représente le décalage temporel en mois par rapport au mois actuel.
    // Exemple :
    // - `relativeTimeIndex = 0` → Mois actuel
    // - `relativeTimeIndex = -2` → Deux mois en arrière
    // - `relativeTimeIndex = 3` → Trois mois dans le futur
    // - `relativeTimeIndex = -12` → Même mois l'année précédente


    const svgRef = useRef(null);

    //date


    useEffect(() => {
            function run() {
                if (!data || !svgRef.current) return;
                let svg = d3.select(svgRef.current);
                svg.selectAll("*").remove();
                let width = svgRef.current.getBoundingClientRect().width
                const height = svgRef.current.getBoundingClientRect().height
                let margin = {top: 20, right: 30, bottom: 40, left: 30};


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
                    {
                        const newDate = new Date(todayDate);
                        newDate.setMonth(todayDate.getMonth() + relativeTimeIndex);
                        firstDay = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
                        lastDay = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0);

                        range = [1, lastDay.getDate()]
                        if (isUsingFakeData) {
                            dataToStudy = getArrayOfRandomNumber(lastDay.getDate(), 5, 13)
                        }else{
                            dataToStudy = data.bookingsThisMonth[Math.abs(relativeTimeIndex)].data
                        }

                        setTitle("Bookings of  " + monthNames[newDate.getMonth()] + " " + newDate.getFullYear());
                        break;
                    }

                    case "thisYear": //each month of this year
                        //aply relativeTimeIndex ( decalage to get previous and next year)
                        //remove 1year or add 1 year
                        // if relativeTimeIndex == 0 nothing changes
                    {
                        const newDate = new Date(todayDate);
                        newDate.setFullYear(todayDate.getFullYear() + relativeTimeIndex)
                        range = [1, 12]
                        if (isUsingFakeData) {
                            dataToStudy = getArrayOfRandomNumber(12, 5, 25)
                        }else{
                            dataToStudy = data.bookingsThisYear[parseInt(newDate.getFullYear())]
                        }

                        setTitle("Bookings of year " + newDate.getFullYear());
                        break;
                    }
                    case "this10Years": //each year with year-10
                        //aply relativeTimeIndex ( decalage to get previous and next year)
                        //remove 10year or add 10 year
                        // if relativeTimeIndex == 0 nothing changes
                    {
                        const newDate = new Date(todayDate);

                        newDate.setFullYear(todayDate.getFullYear() + relativeTimeIndex * 10)
                        // if it's this10Years we wand to go -10 or +10 year
                        // inital : 2010/2020 we dont want 2011-2021 but 2020-2030
                        range = [1, 11]
                        if (isUsingFakeData) {
                            dataToStudy = getArrayOfRandomNumber(11, 15, 123)
                        }else{
                            dataToStudy = data.bookingsThis10Years[newDate.getFullYear()]
                        }
                        setTitle("Bookings theses years ( " +  (parseInt( newDate.getFullYear() )- 10) + ", " + newDate.getFullYear() + ")");
                        break;
                    }

                }
                console.log(dataToStudy)
                const max = Math.max(...dataToStudy) === 0 ? 1 : Math.max(...dataToStudy)

                // add axis
                const xScale = d3.scaleLinear()
                    .domain(range)
                    .range([margin.left, width - margin.right]);
                const yScale = d3.scaleLinear()
                    .domain([0, max * 1.1])
                    .range([height - margin.bottom, margin.top])


                //  add axis
                switch (timeSelected) {
                    case "thisMonth": //each days of this month
                        svg.append("g")
                            .attr("transform", `translate(0,${height - margin.bottom})`)
                            .attr("class","ticksX")
                            .call(d3.axisBottom(xScale).ticks(range[1]));
                        break;

                    case "thisYear": //each month of this year
                        svg.append("g")
                            .attr("transform", `translate(0,${height - margin.bottom})`)
                            .attr("class","ticksX")
                            .call(d3.axisBottom(xScale).ticks(range[1]).tickFormat(function (d, i) {
                                return monthNames[i]
                            }));
                        break;
                    case "this10Years": //each year with year-10
                        svg.append("g")
                            .attr("transform", `translate(0,${height - margin.bottom})`)
                            .attr("class","ticksX")
                            .call(d3.axisBottom(xScale).ticks(range[1]).tickFormat(function (d, i) {
                                return todayDate.getFullYear() - 10 + i
                            }));
                        break;

                }


                svg.append("g")
                    .attr("transform", `translate(${margin.left},0)`)
                    .attr("class","ticksY")
                    .call(d3.axisLeft(yScale).ticks( max%5 ===0 ? max / 5 : max > 20 ? max/3 : max/1))



                //grid
                // ========================  add horizontal line
                let y = 5
                do {
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


                //add indication
                svg.append("text")
                    .text("Place the mouse on points to see values !")
                    .attr("x", width/10)
                    .attr("y", height/8)
                    .attr("r", 3)
                    .attr("fill", "var(--grey-text")
                    .attr("class", "bookingChartIndications")

            }


            if (svgRef.current) {
                window.addEventListener("resize", run);
                run();
            }

        }, [data, timeSelected, svgRef, relativeTimeIndex, isUsingFakeData]
    )


    return (
        <>
            <div className={"bookingChart whiteContainerWithBordure"}>
                <div className={"bookingChartHeaderOfChoice"}>
                    <span onClick={() => setTimeSelected("thisMonth")}
                          className={timeSelected === "thisMonth" && "focus"}>This Month</span>
                    <span onClick={() => setTimeSelected("thisYear")}
                          className={timeSelected === "thisYear" && "focus"}>This Year</span>
                    <span onClick={() => setTimeSelected("this10Years")}
                          className={timeSelected === "this10Years" && "focus"}>This last 10 years</span>
                </div>
                <div className={"bookingChartHeaderInChart"}>

                    <svg onClick={() => setRelativeTimeIndex(relativeTimeIndex - 1)}
                         className={"noselect"} width="24" height="24" viewBox="0 0 24 24" fill="none"
                         xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M19 21.0004V3.0004C18.9994 2.81816 18.9492 2.63953 18.8546 2.48373C18.7601 2.32793 18.6248 2.20086 18.4634 2.11621C18.3021 2.03155 18.1206 1.99252 17.9387 2.0033C17.7568 2.01408 17.5813 2.07428 17.431 2.1774L4.431 11.1774C3.892 11.5504 3.892 12.4484 4.431 12.8224L17.431 21.8224C17.5809 21.9266 17.7566 21.9877 17.9388 21.999C18.121 22.0104 18.3029 21.9716 18.4646 21.8869C18.6263 21.8022 18.7618 21.6747 18.8561 21.5184C18.9505 21.3622 19.0003 21.183 19 21.0004Z"
                            fill="black" style={{fill: "black", fillOpacity: 1}}/>
                    </svg>


                    <span> {title} </span>
                    { relativeTimeIndex < 0 &&
                        <svg className={"noselect"}
                             onClick={() => setRelativeTimeIndex(relativeTimeIndex + 1 > 0 ? 0 : relativeTimeIndex + 1)} width="24" height="24"
                             viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M5 2.9996L5 20.9996C5.00057 21.1818 5.05084 21.3605 5.14538 21.5163C5.23992 21.6721 5.37517 21.7991 5.53655 21.8838C5.69794 21.9684 5.87936 22.0075 6.06129 21.9967C6.24321 21.9859 6.41874 21.9257 6.569 21.8226L19.569 12.8226C20.108 12.4496 20.108 11.5516 19.569 11.1776L6.569 2.1776C6.41906 2.07342 6.24343 2.01233 6.06121 2.00096C5.87898 1.98959 5.69712 2.02838 5.53539 2.11311C5.37367 2.19784 5.23825 2.32527 5.14386 2.48156C5.04947 2.63785 4.99971 2.81702 5 2.9996Z"
                                fill="black" style={{fill: "black", fillOpacity: 1}}/>
                        </svg>
                    }


                </div>


                <svg ref={svgRef}></svg>

                <div className={"activeFakeData"}>
                    <label className="switch">
                    <input type="checkbox" checked={isUsingFakeData}   onChange={(e) => setIsUsingFakeData(e.target.checked)}/>
                    <span className="slider round"></span>
                </label>
                    Use fake data
                </div>

            </div>

        </>


    );
}
