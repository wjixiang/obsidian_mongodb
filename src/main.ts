import { App, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { dbsync } from './sync';


export interface MyPluginSettings {
	server_url: string,
	server_port: string,
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	server_url: 'http://127.0.0.1',
	server_port: '3000',
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings; 

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'synchronize-to-mongoDB',
			name: 'synchronize to mongoDB',
			callback: () => {
				new Notice("start to sync all files toward MongoDB",2000)
				new dbsync(this.app,this.settings).initSync()
			}
		});
		
	
		this.addSettingTab(new SampleSettingTab(this.app, this));

	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('server url')
			.setDesc('Input url of obsidian_MongoDB_server')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.server_url)
				.onChange(async (value) => {
					this.plugin.settings.server_url = value;
					await this.plugin.saveSettings();
				}));
		
		new Setting(containerEl)
			.setName('server port')
			.setDesc('Input port of server')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.server_port)
				.onChange(async (value) => {
					this.plugin.settings.server_port = value;
					await this.plugin.saveSettings();
				}));

	}
}
