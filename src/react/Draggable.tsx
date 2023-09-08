import * as React from "react"
import { useDraggable } from "@dnd-kit/core"
import { Task } from "src/logic/interfaces"
import { PropsWithChildren } from "react"

export function Draggable(props: PropsWithChildren<{task: Task, id: number}>)
{
    const { attributes, listeners, setNodeRef } = useDraggable({
        id: props.id 
    })

    return <div ref={setNodeRef} {...listeners} {...attributes}>
        {props.children}
    </div>
}