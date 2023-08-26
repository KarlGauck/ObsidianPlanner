import {ItemView, WorkspaceLeaf} from "obsidian"
import * as React from "react"
import * as ReactDom from "react-dom"
import TaskList from "./TaskList"
import { createRoot } from "react-dom/client"
import { AppContext } from "./context"

export const VIEW_TYPE_CALENDAR = "calendar_view"

export class CalendarView extends ItemView
{
    constructor(leaf: WorkspaceLeaf)
    {
        super(leaf)
    }

    getViewType(): string 
    {
        return VIEW_TYPE_CALENDAR     
    }

    getDisplayText(): string 
    {
        return "Calendar"     
    }

    protected async onOpen(): Promise<void> 
    {
        const root = createRoot(this.containerEl.children[1])
        root.render(
            <AppContext.Provider value={this.app}>
                <TaskList/>
            </AppContext.Provider>
        )     
    }
}