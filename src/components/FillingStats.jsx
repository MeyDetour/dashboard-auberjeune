
import "../assets/fillingStats.css"
export default function FillingStats({data}) {



    if (!data) return <span>No data</span>
    return (
        <div className="fillingWidget">

            <div className="top">
                <div className="toCome whiteContainerWithBordure">
                    <span>To come</span>
                    <div>
                        <span> {data.clientsToCome ? data.clientsToCome : 0}</span>
                        <span>Clients</span>
                    </div>
                </div>
                <div className="departure whiteContainerWithBordure">
                    <span>Departure</span>
                    <div>
                        <span> {data.clientsDeparture ? data.clientsDeparture : 0}</span>
                        <span>Clients</span>
                    </div>
                </div>
            </div>

            <div className="bottom whiteContainerWithBordure">
                <span>Filling</span>
                <div>

                    <span>Morning</span>
                    <div className="advencement">
                        {data.morningFillingPercentage ?
                            <div style={{width: data.morningFillingPercentage.toString() + "%"}}></div>
                            :
                             <div style={{width: 0+"%"}}></div>
                        }
                    </div>

                    <span>Evening</span>
                    <div className="advencement">
                        {data.nightFillingPercentage ?
                            <div style={{width: data.nightFillingPercentage.toString() + "%"}}></div>
                            :
                             <div style={{width: 0+"%"}}></div>
                        }
                    </div>

                    <span>Private room</span>
                    <div className="advencement">
                        {data.privateRoomFillingPercentage ?
                            <div style={{width: data.privateRoomFillingPercentage.toString() + "%"}}></div>
                            :
                             <div style={{width: 0+"%"}}></div>
                        }
                    </div>

                    <span>Global</span>
                    <div className="advencement">
                        {data.globalFillingPercentage ?
                            <div style={{width: data.globalFillingPercentage.toString() + "%"}}></div>
                            :
                             <div style={{width: 0+"%"}}></div>
                        }
                    </div>
                </div>

            </div>


        </div>
    )
}
