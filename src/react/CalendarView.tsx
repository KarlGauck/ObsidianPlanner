import {ItemView, TFile, WorkspaceLeaf, Notice, App } from "obsidian"
import * as React from "react"
import TaskList from "./TaskList"
import { createRoot } from "react-dom/client"
import { AppContext } from "../../context"
import { Task } from "src/logic/interfaces"
import { DndContext } from "@dnd-kit/core"
import { taskHandler } from "main"

export const VIEW_TYPE_CALENDAR = "calendar_view"


export class CalendarView extends ItemView
{

    constructor(leaf: WorkspaceLeaf)
    {
        super(leaf)
    }

    onLayoutReady() {
        console.log("onLayoutReady:", this);
    }

    getViewType(): string 
    {
        return VIEW_TYPE_CALENDAR     
    }

    getDisplayText(): string 
    {
        return "Calendar"     
    }

    tasksChanged = (tasks: Array<Task>) => {
        const file = this.app.vault.getAbstractFileByPath("obsidianPlanner/tasks.md")
        if (file != undefined && file instanceof TFile)
            this.app.vault.modify(file, JSON.stringify(tasks))
    }

    getTasks = async (): Promise<Array<Task>> => {
        const file = this.app.vault.getAbstractFileByPath("obsidianPlanner/tasks.md")
        if (file == undefined || !(file instanceof TFile))
            return []
        try {
            return JSON.parse(await this.app.vault.read(file))
        }
        catch (error) {}
        return []
    }

    protected async onOpen(): Promise<void> 
    {
        const tasks = await this.getTasks()

        const root = createRoot(this.containerEl.children[1])
        await root.render(
            <AppContext.Provider value={this.app}>
                <DndContext>
                    <TaskList onChange={this.tasksChanged} tasklist={taskHandler.m_tasklist}/>
                </DndContext>   
            </AppContext.Provider>
        )     
    }
}