export interface Task {
    name: string,
    description: string,
    date: Date,
    completed: boolean,
    priority: number,
    duration: number, // duration in minutes
    id: number,
    isEvent: boolean,
    locked: boolean
}