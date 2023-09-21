import {ItemView, TFile, WorkspaceLeaf, Notice, App } from "obsidian"
import * as React from "react"
import { createRoot } from "react-dom/client"

import { TimeTable } from "./TimeTableReact"
import { taskHandler } from "main"

export const VIEW_TYPE_TIMETABLE = "timetable_view"

export class TimeTableView extends ItemView
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
        return VIEW_TYPE_TIMETABLE
    }

    getDisplayText(): string 
    {
        return "Calendar"     
    }

    protected async onOpen(): Promise<void> 
    {
        const root = createRoot(this.containerEl.children[1]);
        await root.render(
            <TimeTable tasks={taskHandler.m_tasklist}/>
        )
    }
}