import { App, Editor, Menu, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { CalendarView, VIEW_TYPE_CALENDAR } from "./CalendarView"

export default class ObsidianPlanner extends Plugin 
{

	async onload() 
	{
		this.registerView(
			VIEW_TYPE_CALENDAR,
			(leaf) => new CalendarView(leaf)
		)

		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			this.activateView()
		});
	}

	onunload() 
	{

	}

	async activateView()
	{
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_CALENDAR)

		await this.app.workspace.getRightLeaf(false).setViewState({
			type: VIEW_TYPE_CALENDAR,
			active: true
		})

		this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType(VIEW_TYPE_CALENDAR)[0]
		)
	}
	
}