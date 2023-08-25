import * as React from "react"
import { Notice } from "obsidian"
import { Draggable } from "react-draggable"

export default function Calendar()
{
    const [tasks, setTasks] = React.useState([
        {
            name: "Fahrschule",
            description: "Anmeldung abgeben",
            date: new Date(),
            completed: false,
            priority: 1
        },
        {
            name: "Lesen",
            description: "Game of Thrones ist auch wichtig",
            date: new Date(),
            completed: false,
            priority: 3
        },
        {
            name: "Benedict",
            description: "Geschenk aufbauen, Sondertransport organisieren, Ofterdingen evakuieren",
            date: new Date(),
            completed: true,
            priority: NaN
        }
    ])

    const taskJSX = tasks.map((task, index) => <Task task={task} onToggleCompleted={() => {
        const newTasks = tasks.slice()
        newTasks[index].completed = !newTasks[index].completed
        setTasks(newTasks)
    }}/>)

    return <>
        <div className="flex-col">
            {taskJSX}
        </div>
    </>
}

interface Task {
    name: string,
    description: string,
    date: Date,
    completed: boolean,
    priority: number
}

function Task({task, onToggleCompleted}: {task: Task, onToggleCompleted: () => void})
{
    return <div className="m-2 flex flex-col gap-3 rounded-xl bg-gray-900 hover:bg-blue-950 p-2">
        <p className="font-sans font-bold text-xl px-2"> {task.name} </p>
        <div className="flex gap-2 items-center">
            <button onClick={onToggleCompleted} className="w-6 h-6 text-green-400"> {task.completed ? "✓" : ""} </button>
            <div className="w-2/3 font-light text-sm text-gray-300"> {task.description} </div>
            <div className="flex flex-row w-1/4 gap-3">
                <div className="text-sm text-green-400"> {task.priority} </div>
                <div className="text-sm text-blue400"> {task.date.getHours()} : {task.date.getMinutes()} </div>
            </div>
        </div>
    </div>
}