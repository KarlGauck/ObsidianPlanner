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

let GlobalId = 0;
function make_task() {
    let task: Task = {
        completed: false,
        date: new Date(),
        description: "",
        duration: 1,
        id: GlobalId,
        name: "no name",
        priority: 0
    };
    GlobalId++;
    return task;
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
        let newTask: Task = make_task();
        this.m_tasklist = Array.from(this.m_tasklist);
        this.m_tasklist.push(newTask);
        this.react_apply_change();
        return newTask;
    }
    delete_task(task: Task) {
        this.m_tasklist.remove(task);
        this.react_apply_change();
    }
    change_task(task: Task) {
        for (let i = 0; i < this.m_tasklist.length; i++) {
            if (this.m_tasklist[i].id == task.id) {
                this.m_tasklist[i] = task;
            }
        }

        this.react_apply_change();
    }

    react_apply_change() {
        this.m_tasklist = Array.from(
            this.m_tasklist
        );

        this.save_data();
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
        console.log(data);

        this.m_initialized = true;
    }
    save_data() {
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

    set_task_list_data(tasklistData: TasklistData) {
        this.m_tasklistData = tasklistData;
        this.save_data();
    }

    async get_task_list_data() {
        if (!this.m_initialized) {
            await this.load_data();
        }
        return this.m_tasklistData;
    }
}