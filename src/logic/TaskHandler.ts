import { Task } from "src/logic/interfaces"
import { planner } from "main"
import { TFile } from "obsidian"

interface TasklistData {
    filters: number[],
    activeSorts: number[],
    sortDirections: boolean[],
    isFilterMode: boolean
}

interface StorageData {
    tasklist: Task[],
    tasklistData: TasklistData
}

export class TaskHandler {
    m_tasklist: Task[];
    m_tasklistData: TasklistData;
    m_initialized: boolean;
    constructor() {
        this.m_tasklist = [];
        this.m_initialized = false;
    }
    create_task() {

    }
    delete_task(task: Task) {

    }

    async initialize() {
        this.load_data();
    }
    async load_data() {
        const folder = planner.vault.getAbstractFileByPath("obsidianPlanner");
        if (folder == null)
            planner.vault.createFolder("obsidianPlanner");

        if (planner.vault.getFiles().filter((file) => file.name == "data.md").length == 0) {
            planner.vault.create("obsidianPlanner/data.md", "");
            return;
        }

        const file = planner.vault.getAbstractFileByPath("obsidianPlanner/data.md");
        if (!file || !(file instanceof TFile) || await planner.vault.read(file) == "")
            return;
        const text = await planner.vault.read(file);
        let data = JSON.parse(text);
        this.m_tasklist = data['tasklist'];
        this.m_tasklistData = data['tasklistdata'];

        this.m_initialized = true;
    }
    saveData() {
        const file = planner.vault.getAbstractFileByPath("obsidianPlanner/data.md");
        if (file != undefined && file instanceof TFile) {
            let data: StorageData = {
                tasklist: this.m_tasklist,
                tasklistData: this.m_tasklistData
            };
            planner.vault.modify(file, JSON.stringify(data));
        }
        
        this.m_initialized = true;
    }
}