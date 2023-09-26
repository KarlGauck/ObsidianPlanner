import * as React from "react"
import { Notice } from "obsidian"
import { useApp } from "../../hooks"
import { Task } from "src/logic/interfaces"
import { time } from "console"

export default function TaskList({propTasks, onChange}: {propTasks: Array<Task>, onChange: (tasks: Array<Task>) => void})
{
    const [tasks, setTasks] = React.useState<Array<Task>>(propTasks)

    const taskJSX = tasks.map((task, index) => <ChangableTask key={index} task={task} 
        onChange={(task) => {
            const newTasks = tasks.slice()
            newTasks[index] = task
            setTasks(newTasks)
            onChange(newTasks)
        }}
        onDelete={() => {
            const newTasks = tasks.slice()
            newTasks.remove(newTasks[index])
            setTasks(newTasks)
            onChange(newTasks)
        }}     
    />)

    function submitTask(task: Task)
    {
        const newTasks = tasks.slice()
        newTasks.push(task)
        setTasks(newTasks)
        onChange(newTasks)
    }

    const emptyTaskForm: Task = {
        name: "",
        description: "",
        date: new Date(),
        completed: false,
        priority: 3,
        duration: 1,
        id: 0,
        isEvent: false
    }
    
    return <div className="grid content-between h-full gap-5">
        <div className="flex-col max-h-200 overflow-auto scroll-smooth">
            {taskJSX.length == 0 ? <p className="text-center">Keine Tasks vorhanden</p> : taskJSX}
        </div>
        <TaskForm initialTask={emptyTaskForm} onSubmit={submitTask} darkBackground={false}/>
    </div>
}

function Task({task, onToggleCompleted, onEdit, onDelete}:
     {task: Task, onToggleCompleted: () => void, onEdit: () => void, onDelete: () => void})
{
    return <div className="m-2 flex flex-col gap-3 rounded-xl bg-gray-900 hover:bg-blue-950 p-2">
        <div className="flex">
            <p className="font-sans font-bold text-xl px-2 w-full"> {task.name} </p>
            <div className="flex gap-2">
                <button onClick={onEdit} className="w-6 h-6">🖉</button>
                <button onClick={onDelete} className="w-6 h-6 text-green-400"> 🗑️ </button>
            </div>
        </div>
        <div className="flex gap-2 items-center">
            <button onClick={onToggleCompleted} className="w-6 h-6 text-green-400"> {task.completed ? "✓" : ""} </button>
            <div className="w-2/3 font-light text-sm text-gray-300"> {task.description} </div>
            <div className="flex flex-row w-1/4 gap-3">
                <div className="text-sm text-green-400"> {task.priority} </div>
                <div className="flex flex-col">
                    <p className="text-sm text-blue-200 font-thin"> {new Date(task.date).toLocaleDateString()} </p>
                    <p className="text-sm text-blue-200 font-thin"> {new Date(task.date).toLocaleTimeString()} </p>
                </div>
            </div>
        </div>
    </div>
}

function TaskForm({initialTask, onSubmit, darkBackground} : {initialTask: Task, onSubmit: (task: Task) => void, darkBackground: boolean})
{
    const [task, setTask] = React.useState(initialTask)

    function changeName(event: React.ChangeEvent<HTMLInputElement>)
    {
        let newTask = Object.assign({}, task)
        newTask.name = event.target.value
        setTask(newTask)
    }

    function changeDescription(event: React.ChangeEvent<HTMLTextAreaElement>)
    {
        let newTask = Object.assign({}, task)
        newTask.description = event.target.value
        setTask(newTask)
    }

    function changeDay(event: React.ChangeEvent<HTMLInputElement>)
    {
        let newTask = Object.assign({}, task)
        const date = new Date(event.target.value)
        newTask.date = date
        setTask(newTask)
    }

    function changeTime(event: React.ChangeEvent<HTMLInputElement>)
    {
        let newTask = Object.assign({}, task)
        const [hour, minute] = event.target.value.split(":")
        newTask.date.setHours(parseInt(hour))
        newTask.date.setMinutes(parseInt(minute))
        newTask.date.setSeconds(0)
        setTask(newTask)
    }

    function changePriority(event: React.ChangeEvent<HTMLSelectElement>)
    {
        let newTask = Object.assign({}, task)
        newTask.priority = parseInt(event.target.value)
        setTask(newTask)
    }

    function padLeft(text: string, length: number, padding: string)
    {
        const difference = length - text.length
        if (difference < 0)
            return text
        let newText = text
        for (let i = 0; i < difference; i++)
            newText = padding + newText
        return newText
    }

    let timeString = new Date(task.date).toLocaleTimeString()
    timeString = timeString.slice(0, timeString.lastIndexOf(":"))

    const date = new Date(task.date)
    const day = date.getDate().toString();
    const month = (date.getMonth() + 1).toString();
    const year = date.getFullYear().toString();
    let dateString = padLeft(year, 4, "0") + "-" + padLeft(month, 2, "0") + "-" + padLeft(day, 2, "0")

    return <div className={"flex flex-col gap-3 rounded-xl " + (darkBackground ? "bg-gray-900 hover:bg-blue-950" : "bg-gray-800") + " p-5 m-2"}>
        <div>
            <p>Name: </p>
            <input type="text" onChange={changeName} value={task.name} className="w-full"/>
        </div>
        <div>
            <p>Description: </p>
            <textarea name="description" id="description" cols={3} onChange={changeDescription} value={task.description} className="w-full p-2"></textarea>
        </div>
        <div className="flex gap-5">
            <div>
                <p> Due date: </p>
                <input type="date" value={dateString} onChange={changeDay}/>
            </div>
            <div>
                <p> Time: </p>
                <input type="time" onChange={changeTime} value={timeString} className="border-solid rounded-lg bg-zinc-900 h-8"/>
            </div>
            <div>
                <p> Priority: </p>
                <select name="priorities" id="priorities" value={task.priority} onChange={changePriority}>
                    <option value="3"> HIGH [3] </option>
                    <option value="2"> MEDIUM [2] </option>
                    <option value="1"> LOW [1] </option>
                </select>
            </div>
        </div>
        <div className="flex w-full gap-2">
            <button onClick={() => {setTask(initialTask)}} className="w-full"> Reset </button>
            <button onClick={() => {onSubmit(Object.assign({}, task))}} className="w-full"> Ok </button>
        </div>
    </div>
}

function ChangableTask({task, onChange, onDelete}: {task: Task, onChange: (task: Task) => void, onDelete: () => void})
{
    const [isEditMode, setIsEditMode] = React.useState(false)

    function submitChange(task: Task)
    {
        setIsEditMode(false)
        onChange(task)
    }

    function toggleCompleted()
    {
        const newTask = Object.assign({}, task)
        newTask.completed = !newTask.completed
        onChange(newTask)
    }

    const editJSX = <div>
        <TaskForm initialTask={task} onSubmit={submitChange} darkBackground={true}></TaskForm>
    </div>

    const displayJSX = <div>
        <Task task={task} onToggleCompleted={toggleCompleted} onEdit={() => {setIsEditMode(true)}} onDelete={onDelete}></Task>
    </div>

    if (isEditMode)
        return editJSX
    return displayJSX
}