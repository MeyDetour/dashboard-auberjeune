import {useEffect, useState} from "react";
import FillingStats from "./FillingStats.jsx";

import "../assets/dashboard.css"
import BookingsChart from "./bookingsChart.jsx";

export default function Dashboard() {
    const queryParameters = new URLSearchParams(window.location.search)
    const token = queryParameters.get("token")
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)
    useEffect(() => {
        async function getData() {
            try {
                console.log("send request data")
                const res = await fetch("https://auberjeune-api.meydetour.com/api/bookings/state", {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    method: "GET"
                })
                const resJSON = await res.json()
                console.log(res.json)
                if (!res.ok) {
                    if (res.status === 401) {
                        throw Error(`Invalid token : ${res.status}`)
                    }
                    throw Error(`Failed to fetch data from API: ${res.status}`)
                }
                if (res.status === 200) {
                    setData(resJSON)
                    setError(null)
                }


            } catch (e) {
                console.log("An error in request :", e)
                setError(e.message)
            }
        }

        if (token) {
            getData()
        } else {
            console.error("no token")
            setError("No token found")
        }
    }, [token])
    if (!data) return <div>Loading...</div>
    console.log(data)
    return (
        <div className="dashboard">
            {error ?
                <span className={"error"}>{error}</span>
                :
<>  <FillingStats data={data}></FillingStats>
    <BookingsChart data={data}></BookingsChart>
</>

            }
        </div>
    )
}
