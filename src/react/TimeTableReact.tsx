import * as React from "react"
import { useState, useRef, useEffect } from "react"

import { Task } from "../logic/interfaces"
import { styling } from "./TimeTableStyle"
import { taskHandler } from "main";
//import { getTaskListData, loadData, taskListData } from "src/logic/storage";

const DeltaTimeStamp = 30;
const TotalHeight = 3000;
const StartHour = 0;
const EndHour = 23;
const TimeSectionDelta = TotalHeight / (EndHour + DeltaTimeStamp / 60 + 0.5);
const TimeSectionStart = 0.25 * TimeSectionDelta;

function add_day(date: Date, days: number) {
    date.setDate(date.getDate() + days);
    return date;
}

export function TimeTable({tasks}:{tasks: Task[]}) {
    const [start, setStart] = useState(new Date());
    const now = new Date();
    const [taskHandlerReloadDummy, taskHandlerReload] = useState(0);
    const taskHandlerReloadCallback = () => {
        taskHandlerReload(taskHandlerReloadDummy + 1);
    };
    taskHandler.add_reload_callback(taskHandlerReloadCallback);
    
    const scrollCallback = (event: any) => {
        if (event.deltaY > 0 && event.shiftKey) {
            setStart(clone_date(add_day(start, 1)));
        }
        if (event.deltaY < 0 && event.shiftKey) {
            setStart(clone_date(add_day(start, -1)));
        }
    };

    useEffect(() => {
        window.addEventListener("scroll", scrollCallback);
        return () => window.removeEventListener("scroll", scrollCallback);
    }, []);

    return (
        <>
            <Calendar tasks={taskHandler.m_tasklist} startDay={start} now={now} dayNum={5} timeDiff={60} scroll={scrollCallback}/>
        </>
    );
}

function Calendar({tasks, startDay, now, dayNum, timeDiff, scroll}:{tasks: Task[], startDay: Date, now: Date, dayNum: number, timeDiff: number, scroll: (event: any)=>void}) {
    return (
        <div css={styling.CalendarWrapper} style={{ height: TotalHeight }} id="CALENDAR" onWheel={scroll}>
            <TimeStamps/>
            <Week tasks={tasks} startDay={startDay} now={now} dayNum={5} timeDiff={60}/>
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
    };
    useEffect(() => {
        resize();
    }, []);
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
        dayDate = add_day(dayDate, 1);
    }
    return (
        <div css={styling.WeekWrapper}>
            { days.map((day, index) => { return <Day key={index} index={index} data={day}/> }) }
        </div>
    );
}

const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
function Day({data, index}:{data:Day, index:number}) {
    let timestampStyle = [styling.DayName];
    if (data.isToday) timestampStyle.push(styling.DayNameToday);

    console.log(data.date.toLocaleDateString(), data.tasks);
    return (
        <>
            <div css={styling.DayWrapper} style={{ width: data.dayWidth + "px", maxHeight: "100%" }}>
                { data.tasks.map((task, i) => { return <BetterEvent key={data.date.getTime() + i} index={index + "_" + i} task={task}/> }) }
            </div>
            <div css={timestampStyle} style={{ left: "calc(" + (data.dayWidth - 3) * index + "px + 34px)" }}>
                { weekday[data.date.getDay()].slice(0, 3) + " " + data.date.toLocaleDateString() }
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

    const getOffset = (date: Date) => {
        return TimeSectionStart + TimeSectionDelta * time_to_dec(date.getHours(), date.getMinutes());
    }

    const [Task, setTask] = useState(task);
    const [offset, setOffset] = useState(getOffset(task.date));

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
    const onDragStart = (event: any) => {
        setDragStartPos(event.screenY);
        setIsDragged(true);

        var crt = document.createElement("div");
        crt.style.display = "none";
        document.body.appendChild(crt);
        event.dataTransfer.setDragImage(crt, 0, 0);
    }
    const onDrag = (event: any) => {
        setOffset(offset + event.screenY - DragStartPos);
        setDragStartPos(event.screenY);
        applyTime();
    }
    const onDragEnd = (event: any) => {
        setOffset(offset + event.screenY - DragStartPos);
        setIsDragged(false);
        applyTime();
        taskHandler.change_task(Task);
    }

    let styles = [styling.EventWrapper];
    if (IsDragged)
        styles.push(styling.EventWrapperDragged);

    return (
        <div draggable="true"
            id={id} css={styles}
            style={{ transform: "translateY(" + offset + "px)", marginBottom: -height, zIndex: IsDragged ? 10 : 0 }}
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