// import { Task } from "src/logic/interfaces"
// import { planner } from "main"
// import { TFile } from "obsidian"

// interface storage {
//     taskListData: taskListData
// }

// export interface taskListData {
//     tasks: Task[],
//     filters: number[],
//     activeSorts: number[],
//     sortDirections: boolean[],
//     isFilterMode: boolean
// }

// export let initialized = false

// let data: storage = {
//     taskListData: {
//         tasks: [],
//         filters: [],
//         activeSorts: [],
//         sortDirections: [],
//         isFilterMode: true
//     }
// }

// export async function loadData()
// {
//     initialized = true
    
//     const folder = planner.vault.getAbstractFileByPath("obsidianPlanner")
//     if (folder == null)
//         this.app.vault.createFolder("obsidianPlanner")
//     if (planner.vault.getFiles().filter((file) => file.name == "data.md").length == 0) {
//         this.app.vault.create("obsidianPlanner/data.md", "")
//         return
//     }

//     const file = planner.vault.getAbstractFileByPath("obsidianPlanner/data.md")
//     if (!file || !(file instanceof TFile) || await planner.vault.read(file) == "")
//         return
//     const text = await planner.vault.read(file) 
//     data = JSON.parse(text)
//     initialized = true
// }

// function saveData()
// {
//     const file = this.app.vault.getAbstractFileByPath("obsidianPlanner/data.md")
//     if (file != undefined && file instanceof TFile)
//         this.app.vault.modify(file, JSON.stringify(data))
//     initialized = true
// }

// export function setTaskListData(tasksListData: taskListData)
// {
//     data.taskListData = tasksListData
//     saveData()
// }

// export async function getTaskListData()
// {
//     if (!initialized)
//         await loadData()
//     return data.taskListData
// }
