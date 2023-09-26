import * as React from "react"
import { useState, useEffect, useReducer } from "react"

import { Task } from "../logic/interfaces"
import { styling } from "./TimeTableStyle"
import { taskHandler } from "main";
//import { getTaskListData, loadData, taskListData } from "src/logic/storage";

function add_day(date: Date, days: number) {
    date.setDate(date.getDate() + days);
    return date;
}

interface CalendarSizing {
    DeltaTimeStamp: number, TotalHeight: number, StartHour: number, EndHour: number
}
function default_calendar_sizing(): CalendarSizing {
    return {
        DeltaTimeStamp: 30,
        TotalHeight: 3000,
        StartHour: 5,
        EndHour: 23
    }
}
function error_calendar_sizing() : CalendarSizing {
    return {
        DeltaTimeStamp: 360,
        TotalHeight: 3000,
        StartHour: 0,
        EndHour: 24
    }
}
function time_section_delta(calendarSizing: CalendarSizing): number {
    return calendarSizing.TotalHeight / (calendarSizing.EndHour + calendarSizing.DeltaTimeStamp / 60 + 0.5);
}
function time_section_start(calendarSizing: CalendarSizing): number {
    return 0.25 * time_section_delta(calendarSizing);
}
function decode_string(buf: number[]): string {
    let str: string = "";
    buf.forEach((ch) => {
        str += String.fromCharCode(ch);
    });
    return str;
}
function equal(a: CalendarSizing, b: CalendarSizing): boolean {
    return a.DeltaTimeStamp == b.DeltaTimeStamp &&
           a.EndHour        == b.EndHour &&
           a.StartHour      == b.StartHour &&
           a.TotalHeight    == b.TotalHeight;
}

const fs = require('fs');
const ConfigFileName = 'timetable_config.json';
function write_config_file(calendarSizing: CalendarSizing, callback: () => void) {
    fs.writeFile(ConfigFileName, JSON.stringify(calendarSizing), (err: any) => { if (err) throw err; callback(); });
}
function read_config_file(callback: (c: CalendarSizing) => void) {
    let ret;
    fs.readFile(ConfigFileName, (err: any, data: any) => {
        if (err) {
            throw err;
            return undefined;
        }
        if (!data || data.length == 0)
            return;
        ret = JSON.parse(decode_string(data));
        callback(ret);
    });
}
function validate(calendarSizing: CalendarSizing): CalendarSizing {
    calendarSizing.DeltaTimeStamp = Math.clamp(calendarSizing.DeltaTimeStamp, 15, 60);
    calendarSizing.StartHour = Math.clamp(calendarSizing.StartHour, 0, 22);
    calendarSizing.EndHour = Math.clamp(calendarSizing.EndHour, calendarSizing.StartHour - 1, 23);
    calendarSizing.TotalHeight = Math.clamp(calendarSizing.TotalHeight, 750, 6000);

    return calendarSizing;
}

let eventReloadStack: (()=>void)[] = [];

export function TimeTable({tasks}:{tasks: Task[]}) {
    const [start, setStart] = useState(new Date());
    const now = new Date();

    // reload callback
    const [taskHandlerReloadDummy, taskHandlerReload] = useState(0);
    const taskHandlerReloadCallback = () => {
        taskHandlerReload(clone(taskHandlerReloadDummy + 1));
    };
    taskHandler.add_reload_callback(taskHandlerReloadCallback);

    // calendar size stuff
    const [calendarSizing, setCalendarSizing] = useState(error_calendar_sizing());

    // and here comes the ultimate hell of inception
    read_config_file((checkData) => {
        let configFileExists = true;
        if (!checkData)
            configFileExists = false;

        const changeConfigState = () => {
            if (equal(calendarSizing, error_calendar_sizing())) {
                read_config_file((data) => {
                    if (data) {
                        setCalendarSizing(data);
                    }
                });
            } else {
                write_config_file(calendarSizing, () => {});
            }
        }
            
        if (!configFileExists) {
            write_config_file(default_calendar_sizing(), changeConfigState);
        } else {
            changeConfigState();
        }
    });
    
    const scrollCallback = (event: any) => {
        if (event.shiftKey) {
            setStart(clone_date(add_day(start, event.deltaY > 0 ? 1 : -1)));
        }
        if (event.ctrlKey) {
            if (event.deltaY < 0) {
                let cs = calendarSizing;
                cs.DeltaTimeStamp /= 2;
                cs.TotalHeight *= 2;
                setCalendarSizing(clone(validate(cs)));
            } else {
                let cs = calendarSizing;
                cs.DeltaTimeStamp *= 2;
                cs.TotalHeight /= 2;
                setCalendarSizing(clone(validate(cs)));
            }
            eventReloadStack.forEach((ers) => { ers(); });
        }
    };

    useEffect(() => {
        window.addEventListener("scroll", scrollCallback);
        return () => window.removeEventListener("scroll", scrollCallback);
    }, []);

    return (
        <>
            <Calendar calendarSizing={calendarSizing} tasks={taskHandler.m_tasklist} startDay={start} now={now} dayNum={5} timeDiff={60} scroll={scrollCallback}/>
        </>
    );
}

function Calendar({tasks, startDay, now, dayNum, timeDiff, scroll, calendarSizing}:{calendarSizing: CalendarSizing, tasks: Task[], startDay: Date, now: Date, dayNum: number, timeDiff: number, scroll: (event: any)=>void}) {
    return (
        <div css={styling.CalendarWrapper} style={{ height: calendarSizing.TotalHeight }} id="CALENDAR" onWheel={scroll}>
            <TimeStamps calendarSizing={calendarSizing}/>
            <Week tasks={tasks} startDay={startDay} now={now} dayNum={5} timeDiff={60} calendarSizing={calendarSizing}/>
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
function Week({tasks, startDay, now, dayNum, timeDiff, calendarSizing}:{tasks: Task[], startDay: Date, now: Date, dayNum: number, timeDiff: number, calendarSizing: CalendarSizing}) {
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
            { days.map((day, index) => { return <Day key={index} index={index} data={day} calendarSizing={calendarSizing}/> }) }
        </div>
    );
}

const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
function Day({data, index, calendarSizing}:{data:Day, index:number, calendarSizing: CalendarSizing}) {
    let timestampStyle = [styling.DayName];
    if (data.isToday) timestampStyle.push(styling.DayNameToday);
    return (
        <>
            <div css={styling.DayWrapper} style={{ width: data.dayWidth + "px", maxHeight: "100%" }}>
                { data.tasks.map((task, i) => { return <BetterEvent key={data.date.getTime() + i} index={index + "_" + i} task={task} calendarSizing={calendarSizing}/> }) }
            </div>
            <div css={timestampStyle} style={{ left: "calc(" + (data.dayWidth - 3) * index + "px + 34px)" }}>
                { weekday[data.date.getDay()].slice(0, 3) + " " + data.date.toLocaleDateString() }
            </div>
        </>
    );
}

function BetterEvent({task, index, calendarSizing}:{task:Task, index:string, calendarSizing: CalendarSizing}) {
    const [height, setHeight] = useState(0);
    const id = "EVENT_CARD_" + index;

    const [, updateState] = React.useState({});
    const forceUpdate = React.useCallback(() => updateState({}), []);

    useEffect(() => {
        let el = document.getElementById(id);
        if (el)
            setHeight(el.clientHeight);

        eventReloadStack.push(() => {
            forceUpdate();
            setOffset(getOffset(task.date));
        });
    });

    let timeSectionStart = time_section_start(calendarSizing);
    let timeSectionDelta = time_section_delta(calendarSizing);

    const getOffset = (date: Date) => {
        return timeSectionStart + timeSectionDelta * time_to_dec(date.getHours(), date.getMinutes());
    }

    const [Task, setTask] = useState(task);
    const [offset, setOffset] = useState(getOffset(task.date));
    if (offset != getOffset(task.date)) {
        setOffset(getOffset(task.date));
    }

    const applyTime = () => {
        let newTask: Task = clone(Task);
        newTask.date = new Date(newTask.date);
        let decTime = (offset - timeSectionStart) / timeSectionDelta;
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

function get_times(calendarSizing: CalendarSizing) {
    let times = [];
    let hour = calendarSizing.StartHour;
    let minute = 0;
    while (hour <= calendarSizing.EndHour) {
        times.push(pad(hour) + ":" + pad(minute));
        minute += calendarSizing.DeltaTimeStamp;
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

function TimeStamps({calendarSizing}: {calendarSizing: CalendarSizing}) {
    return (
        <div css={styling.TimeStampWrapper}>
            { get_times(calendarSizing).map((time, index) => <div key={index}>{time}</div>) }
        </div>
    );
}