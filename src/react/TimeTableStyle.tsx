
import { css } from '@emotion/react'

export const styling = {
    CalendarWrapper: css({
        display: "flex",
        flexDirection: "row"
    }),
    WeekWrapper: css({
        height: "100%",
        display: "flex",
        flexDirection: "row",
    }),
    DayWrapper: css({
        height: "100%",
        borderStyle: "solid",
        borderWidth: "0 3px",
        borderColor: "InactiveBorder",
        marginRight: "-3px"
    }),
    DayName: css({
        fontSize: "small",
        position: "absolute",
        bottom: 3,
        background: "InactiveBorder",
        padding: "1px 7px",
        marginBottom: "4px",
        borderRadius: "5px"
    }),
    DayNameToday: css({
        backgroundColor: "orange"
    }),
    TimeStampWrapper: css({
        display: "flex",
        justifyContent: "space-around",
        height: "100%",
        width: "20px",
        writingMode: "vertical-lr",
        paddingTop: "3px",
        marginLeft: "-12px",
        fontSize: "14px",
        fontWeight: "bold"
    }),
    EventWrapper: css({
        backgroundColor: "darkred",
        padding: "2px 5px",
        borderRadius: "12px",
        margin: "0 7px",
        position: "sticky"
    }),
    EventWrapperDragged: css({
        backgroundColor: "darkblue",
        padding: "2px 5px",
        borderRadius: "12px",
        margin: "0 7px",
        position: "sticky"
    }),
    EventHeading: css({
        padding: 3,
        borderBottom: "solid 2px white"
    }),
    EventTime: css({
        margin: 3
    }),
}