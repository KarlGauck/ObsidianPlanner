import * as React from "react"
import { Task } from "src/logic/interfaces"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import * as Icons from "@fortawesome/free-solid-svg-icons"
// import * as Storage from "src/logic/storage"
import { DndContext, DragOverlay, useDndMonitor, useDraggable, useDroppable } from "@dnd-kit/core"
import { Notice } from "obsidian"
import { Draggable } from "src/react/Draggable"
import { taskHandler } from "main"

export const ItemTypes = {
    KNIGHT: 'knights'
}

function getWeekOfDate(date: Date)
{
    let startDate = new Date(date.getFullYear(), 0, 1);
    var days = Math.floor((date.getTime() - startDate.getTime()) /(24 * 60 * 60 * 1000));
    return Math.ceil(days / 7);
}

export default function TaskList({onChange, tasklist}: {onChange: (tasks: Array<Task>) => void, tasklist: Task[]})
{
    const isReRender = React.useRef(false)

    const filterTags = ["done", "passed", "today", "this week"]
    const sortingTags = ["date", "priority", "custom"]
    console.log("Is initialized: xd" + taskHandler.m_initialized)

    //const [tasks, setTasks] = React.useState<Array<Task>>([])
    const [customOrder, setCustomOrder] = React.useState(Array<number>())
    const [filter, setFilter] = React.useState(Array(filterTags.length).fill(0))
    const [sorts, setSorts] = React.useState<Array<number>>([])
    const [sortDirection, setSortDirection] = React.useState<boolean[]>(Array(sortingTags.length).fill(true))
    const [isFilterMode, setIsFilterMode] = React.useState(true)

    const [dragId, setDragId] = React.useState(0)
    const [dragging, setIsDragging] = React.useState(false)

    function setTaskPosition(taskIndex: number, position: number) {
        let newArray = getSortedTasks().map((array) => array[1] as number)
        newArray.remove(taskIndex)
        newArray = [...newArray.slice(0, position), taskIndex, ...newArray.slice(position)]
        setCustomOrder(newArray)
    }

    function getSortedTasks()
    {
        return tasklist.map((task, index) => [task, index]).sort((i1, i2) => {
            const t1 = i1[0] as Task
            const t2 = i2[0] as Task
            const ind1 = i1[1] as number
            const ind2 = i2[1] as number

            for (let i = 0; i < sorts.length; i++)
            {
                let val = 0

                switch (sorts[i])
                {
                    case 0:
                        val = new Date(t1.date).getTime() - new Date(t2.date).getTime()
                        break
                    case 1:
                        val = t1.priority - t2.priority
                        break
                    case 2:
                        val = customOrder.indexOf(ind2) - customOrder.indexOf(ind1)
                }

                if (val == 0)
                    continue

                if (sortDirection[sorts[i]])
                    val *= -1

                return val
            }

            return 0
        })
    }

    function getFilteredTasks()
    {
        return getSortedTasks().filter((array, index) => {
            const task = array[0] as Task
                
            for (let i = 0; i < filter.length; i++)
            {
                let filterValue = true
                const now = new Date()
                const date = new Date(task.date)
                getWeekOfDate(now)

                switch(i) {
                    case 0:
                        filterValue = task.completed
                        break
                    case 1:
                        filterValue = new Date(task.date).getTime() < now.getTime()
                        break
                    case 2:
                        filterValue = date.getFullYear() == now.getFullYear() && date.getDate() == now.getDate()
                        break
                    case 3:
                        //console.log("test: " + filter[i])
                        filterValue = date.getFullYear() == now.getFullYear() && getWeekOfDate(date) == getWeekOfDate(now)
                        //console.log(filterValue)
                        break
                }

                if (filter[i] == 2)
                    filterValue = !filterValue

                if (filter[i] && !filterValue)
                    return false
            }
            return true
        })
    }

    function getTaskJSX(index: number, task: Task)
    {
        return (
            <Draggable id={index} task={task}>
                <ChangeableTask key={index} id={index} task={task} 
                onChange={(task) => {
                    // const newTasks = tasks.slice()
                    // newTasks[index] = task
                    // setTasks(newTasks)

                    taskHandler.change_task(task);
                }}
                onDelete={() => {
                    // const newTasks = tasks.slice()
                    // newTasks.remove(newTasks[index])
                    // setTasks(newTasks)

                    taskHandler.delete_task(task);
                }}     
            />
            </Draggable>
        );
    }

    React.useEffect(() => {
        async function getData()
        {
            if (isReRender.current) 
            {
                taskHandler.set_task_list_data ({
                    filters: filter,
                    activeSorts: sorts,
                    sortDirections: sortDirection,
                    isFilterMode: isFilterMode
                })
            }
            else {
                const data = await taskHandler.get_task_list_data()
                console.log("INITIAL RENDER")
                console.log(data)
                setFilter(data.filters)
                setSorts(data.activeSorts)
                setSortDirection(data.sortDirections)
                setIsFilterMode(data.isFilterMode)
                setCustomOrder(Array.from(Array(tasklist.length).keys()))
                isReRender.current = true    
            }
        }
        getData()
    }, [tasklist, filter, sorts, sortDirection, isFilterMode])

    const taskJSX = getFilteredTasks().map((array) => {
        const index = array[1] as number
        const task = array[0] as Task

        return getTaskJSX(index, task) 
    })

    useDndMonitor({
        onDragStart(event) {
            setIsDragging(true)
            setDragId(event.active.data.current?.index)
        },
        onDragEnd(event) {
            setIsDragging(false)
        },
        /*onDragOver(event) {
            console.log(event.over?.data.current?.index)
            setTaskPosition(event.active.data.current?.index, event.over?.data.current?.index)
        }*/
    })

    function submitTask(task: Task)
    {
        task.id = taskHandler.create_task().id;
        taskHandler.change_task(task);
    }

    const emptyTaskForm: Task = {
        name: "",
        description: "",
        date: new Date(),
        completed: false,
        priority: 3,
        duration: 1,
        id: 0
    }
    
    return <div className="grid content-between h-full gap-5">
        <div className={"flex-col overflow-auto scroll-smooth"}>
            <div className="flex w-full items-center px-2">
                {
                    isFilterMode ? 
                    <FontAwesomeIcon onClick={() => {setIsFilterMode(false)}} icon={Icons.faFilter} className="ring-1 ring-white rounded-md p-2 hover:ring-gray-500"/> :
                    <FontAwesomeIcon onClick={() => {setIsFilterMode(true)}} icon={Icons.faArrowDownWideShort} className="ring-1 ring-white rounded-md p-2 hover:ring-gray-500"/>
                }
                {
                    isFilterMode ?
                    <FilterSelection tags={filterTags} states={filter} onChange={setFilter}></FilterSelection> :
                    <SortSelection
                        tags={sortingTags} active={sorts} sortDirection={sortDirection} onActiveChange={setSorts} onDirectionChange={setSortDirection}
                    ></SortSelection>
                }
            </div>
            <div>
                {taskJSX.length == 0 ? <p className="text-center">Keine Tasks vorhanden</p> : taskJSX}
            </div>
        </div>
        <TaskForm initialTask={emptyTaskForm} onSubmit={submitTask} darkBackground={false}/>
    </div>
}

function Task({task, id, onToggleCompleted, onEdit, onDelete}:
     {task: Task, id: number, onToggleCompleted: () => void, onEdit: () => void, onDelete: () => void})
{
    return <div className="group p-1" /*style={style}*/>
        <div className="flex flex-col gap-3 rounded-xl bg-gray-900 hover:bg-blue-950 p-2">
            <div className="flex">
                <p className={"text-center font-bold group-hover:hidden w-6 h-6 " + (task.completed ? "text-green-400" : "")}> {task.completed ? "✓" : "•"} </p>
                <p className="font-sans font-bold text-xl px-2 w-full"> {task.name} </p>
                <div className="flex gap-2">
                    <button onClick={onEdit} className="w-6 h-6">🖉</button>
                    <button onClick={onDelete} className="w-6 h-6 border-double"> ️🗑 </button>
                </div>
            </div>
            <div className="hidden group-hover:flex gap-2 items-center transition-all">
                <div className="flex w-full">
                    <button onClick={onToggleCompleted} className={"w-6 h-6 " + (task.completed ? "text-green-400" : "")}> {task.completed ? "✓" : "•"} </button>
                    <pre className="w-2/3 font-light font-sans text-left text-sm text-gray-300 whitespace-pre-wrap"> {task.description} </pre>
                </div>
                <div className="flex flex-row w-1/4 gap-3">
                    <div className="text-sm text-green-400"> {task.priority} </div>
                    <div className="flex flex-col">
                        <p className="text-sm text-blue-200 font-thin"> {new Date(task.date).toLocaleDateString()} </p>
                        <p className="text-sm text-blue-200 font-thin"> {new Date(task.date).toLocaleTimeString()} </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
}

function FilterSelection({tags, states, onChange}: {tags: string[], states: number[], onChange: (states: number[]) => void })
{
    function toggleTag(index: number)
    {
        let newStates = states.slice()
        newStates[index] = (newStates[index] + 1) % 3
        onChange(newStates)
    }

    const buttons = tags.map((tag, index) => <div 
            key={index}
            onClick={() => {toggleTag(index)}}
            className={"flex ring-1 ring-opacity-10 ring-white gap-1 rounded-full whitespace-nowrap py-1 px-4 group bg-gray-800 bg-opacity-0 hover:ring-opacity-20 " + (states[index] && "bg-opacity-100")}>
                {states[index] == 2 ? <p className="font-bold text-red-800">
                    !
                </p> : <></>}
                {tags[index]} 
        </div>
    )

    return <div className="flex m-2 p-1 overflow-scroll no-scrollbar gap-3 items-center">
        {buttons}
    </div>
}

function SortSelection({tags, active, sortDirection, onActiveChange, onDirectionChange}:
     {tags: Array<string>, active: number[], sortDirection: boolean[],
         onActiveChange: (active: number[]) => void, onDirectionChange: (direction: boolean[]) => void})
{
    function removeActive(index: number)
    {
        let newActive = active.slice()
        newActive.remove(index)
        onActiveChange(newActive)
    }

    function addActive(index: number)
    {
        let newActive = active.slice()
        newActive.push(index)
        onActiveChange(newActive)
    }

    function toggleDirection(index: number)
    {
        let newDirection = sortDirection.slice()
        newDirection[index] = !newDirection[index]
        onDirectionChange(newDirection)
    }

    function getElement(tag: string, index: number, active: boolean) {
        return <div key={index} 
            onClick={() => {toggleDirection(index)}}
            className="flex rounded-full whitespace-nowrap p-1 px-3 ring-1 ring-opacity-10 ring-white gap-2 items-center group hover:ring-opacity-20">
            {
                active ? 
                <FontAwesomeIcon style={{ opacity: "0.8" }} 
                    className="hover:scale-125 transition-all"
                    icon={sortDirection[index] ? Icons.faArrowDownLong : Icons.faArrowUpLong}
                ></FontAwesomeIcon> : <></>
            }
            
            {tag} 

            <FontAwesomeIcon icon={active ? Icons.faTrashCan : Icons.faPlus} style={{ opacity: "0.8" }} 
                onClick={
                    active ? 
                    () => {removeActive(index)} : 
                    () => {addActive(index)}
                }
                className="flex scale-75 hover:scale-90 transition-all"
            ></FontAwesomeIcon>
        </div>
    }

    const activeFilterJSX = active.map((num) => getElement(tags[num], num, true))
    console.log(active)
    const unactiveFilterJSX = tags.map((tag, index) => [tag, index])
        .filter((array, index) => !(active.includes(index)))
        .map((array) => {
            console.log(array)
            return getElement(array[0] as string, array[1] as number, false)
        })
    
    return <div className="flex items-center w-full h-full">
        <div className="flex m-3 gap-3 items-center w-full">
            {activeFilterJSX}
        </div>
        <div className="flex m-3 gap-3 items-center">
            {unactiveFilterJSX}
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

    const date = new Date(task.date);
    const day = date.getDate().toString();
    const month = (date.getMonth() + 1).toString();
    const year = date.getFullYear().toString();
    let dateString = padLeft(year, 4, "0") + "-" + padLeft(month, 2, "0") + "-" + padLeft(day, 2, "0");

    return <div className={"flex flex-col gap-3 rounded-xl " + (darkBackground ? "bg-gray-900 hover:bg-blue-950" : "bg-gray-800") + " p-5 m-2"}>
        <div>
            <input placeholder="Name" type="text" onChange={changeName} value={task.name} className="w-full"/>
        </div>
        <div>
            <textarea placeholder="Description" name="description" id="description" cols={3} onChange={changeDescription} value={task.description} className="w-full p-2"></textarea>
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

function ChangeableTask({task, id, onChange, onDelete}: {task: Task, id: number, onChange: (task: Task) => void, onDelete: () => void})
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
        <Task task={task} id={id} onToggleCompleted={toggleCompleted} onEdit={() => {setIsEditMode(true)}} onDelete={onDelete}></Task>
    </div>

    if (isEditMode)
        return editJSX
    return displayJSX
}