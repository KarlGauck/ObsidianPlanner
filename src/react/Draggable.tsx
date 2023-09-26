import * as React from "react"
import { useDraggable } from "@dnd-kit/core"
import { Task } from "src/logic/interfaces"
import { PropsWithChildren } from "react"

export function Draggable(props: PropsWithChildren<{task: Task, id: string}>)
{
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: props.id,
        data: {
            index: props.id
        }
    })

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
    } : undefined

    return <div ref={setNodeRef} {...listeners} {...attributes}>
        {props.children}
    </div>
}