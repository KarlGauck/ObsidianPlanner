import * as React from "react"
import { useState, useRef, useEffect } from "react"

import { Task } from "../logic/interfaces"
import { styling } from "./TimeTableStyle"
//import { getTaskListData, loadData, taskListData } from "src/logic/storage";

const DeltaTimeStamp = 30;
const TotalHeight = 3000;
const StartHour = 0;
const EndHour = 23;
const TimeSectionDelta = TotalHeight / (EndHour + DeltaTimeStamp / 60 + 0.5);
const TimeSectionStart = 0.25 * TimeSectionDelta;

export function TimeTable({tasks}:{tasks: Task[]}) {
    console.log("rendering timetable");
    const now = new Date("Wed Sep 13 2023 21:15:57 GMT+0200 (Central European Summer Time)");
    
    return (
        <>
            <Calendar tasks={tasks} startDay={now} now={now} dayNum={5} timeDiff={60}/>
        </>
    );
}

function Calendar({tasks, startDay, now, dayNum, timeDiff}:{tasks: Task[], startDay: Date, now: Date, dayNum: number, timeDiff: number}) {
    return (
        <div css={styling.CalendarWrapper} style={{ height: TotalHeight }} id="CALENDAR">
            <TimeStamps/>
            <Week tasks={tasks} startDay={now} now={now} dayNum={5} timeDiff={60}/>
        </div>
    );
}
interface Day {
    tasks: Task[],
    date: Date,
    isToday: boolean,
    // style things
    dayWidth: number,
}
function same_day(a: Date, b: Date) : boolean {
    return a.getFullYear() == b.getFullYear()
        && a.getMonth()    == b.getMonth()
        && a.getDate()     == b.getDate();
}
function clone(v: any) {
    return JSON.parse(JSON.stringify(v));
}
function clone_day(v: Day) {
    let cloned = clone(v);
    v.date = new Date(v.date);
    return v;
}
function clone_date(v: Date) {
    return new Date(clone(v));
}
function Week({tasks, startDay, now, dayNum, timeDiff}:{tasks: Task[], startDay: Date, now: Date, dayNum: number, timeDiff: number}) {
    // style specific things
    const [viewportWidth, setViewportWidth] = useState(0);
    const resize = () => {
        let el = document.getElementById("CALENDAR");
        if (el) {
            setViewportWidth(el.clientWidth);
        }
        queryResize();
    };
    const queryResize = () => { setTimeout(() => { resize() }, 100) };
    new Promise(() => { queryResize() });
    const dayWidth = viewportWidth / dayNum;

    let dayDate = clone_date(startDay);

    // day specific data
    let days: Day[] = Array(dayNum);
    for (let i = 0; i < dayNum; i++) {
        // tasks
        let dayTasks: Task[] = [];
        if (tasks != undefined) {
            for (const task of tasks) {
                if (same_day(task.date, dayDate)) {
                    dayTasks.push(task);
                }
            }
        }
        // date of day
        const day: Day = {
            tasks: dayTasks,
            date: dayDate,
            isToday: same_day(now, dayDate),
            dayWidth: dayWidth
        }
        days[i] = clone_day(day);
        dayDate.setDate(dayDate.getDate() + 1);
    }
    return (
        <div css={styling.WeekWrapper}>
            { days.map((day, index) => { return <Day key={index} index={index} data={day}/> }) }
        </div>
    );
}

const testToday = "Wed Sep 20 2023 21:15:57 GMT+0200 (Central European Summer Time)";

const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
function Day({data, index}:{data:Day, index:number}) {
    return (
        <>
            <div css={styling.DayWrapper} style={{ width: data.dayWidth + "px", maxHeight: "100%" }}>
                { data.tasks.map((task, i) => { return <BetterEvent key={i} index={index + "_" + i} task={task}/> }) }
            </div>
            <div css={styling.DayName} style={{ left: "calc(" + (data.dayWidth - 3) * index + "px + 34px)" }}>
                { weekday[data.date.getDay()] }
            </div>
        </>
    );
}
function BetterEvent({task, index}:{task:Task, index:string}) {
    const [height, setHeight] = useState(0);
    const id = "EVENT_CARD_" + index;
    setTimeout(() => {
        let el = document.getElementById(id);
        if (el)
            setHeight(el.clientHeight);
    }, 200);

    const [Task, setTask] = useState(task);
    const getOffset = (date: Date) => {
        return TimeSectionStart + TimeSectionDelta * time_to_dec(date.getHours(), date.getMinutes());
    }

    const [offset, setOffset] = useState(getOffset(Task.date));

    const applyTime = () => {
        let newTask: Task = clone(Task);
        newTask.date = new Date(newTask.date);
        let decTime = (offset - TimeSectionStart) / TimeSectionDelta;
        newTask.date.setHours(Math.floor(decTime));
        newTask.date.setMinutes((decTime - Math.floor(decTime)) * 60);
        setTask(newTask);
    }
    const [DragStartPos, setDragStartPos] = useState(0);
    const [IsDragged, setIsDragged] = useState(false);
    const onDragStart = (event: Event) => {
        setDragStartPos(event.screenY);
        setIsDragged(true);
    }
    const onDrag = (event: Event) => {
        setOffset(offset + event.screenY - DragStartPos);
        setDragStartPos(event.screenY);
    }
    const onDragEnd = (event: Event) => {
        setOffset(offset + event.screenY - DragStartPos);
        setIsDragged(false);
        console.log(task.id);
    }

    let styles = [styling.EventWrapper];
    if (IsDragged)
        styles.push(styling.EventWrapperDragged);

    return (
        <div draggable="true"
            id={id} css={styles}
            style={{ transform: "translateY(" + offset + "px)", marginBottom: -height, zIndex: IsDragged ? 10 : 0}}
            onDragStart={onDragStart} onDrag={onDrag} onDragEnd={onDragEnd}
        >
            <div css={styling.EventHeading}>{Task.name}</div>
            <div css={styling.EventTime}>{ pad(Task.date.getHours()) + ":" + pad(Task.date.getMinutes()) }</div>
        </div>
    );
}

function pad(num: number) {
    if (num < 10)
        return "0" + num;
    return num;
}

function get_times(delta: number) {
    let times = [];
    let hour = StartHour;
    let minute = 0;
    while (hour <= EndHour) {
        times.push(pad(hour) + ":" + pad(minute));
        minute += delta;
        while (minute >= 60) {
            minute -= 60;
            hour++;
        }
    }
    return times;
}

function time_to_dec(h: number, m: number) {
    return h + m / 60;
}

function TimeStamps() {
    return (
        <div css={styling.TimeStampWrapper}>
            { get_times(DeltaTimeStamp).map((time, index) => <div key={index}>{time}</div>) }
        </div>
    );
}
function TimeSection() {

}