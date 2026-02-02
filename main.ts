import { App, Editor, MarkdownView, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface ColorCyclePluginSettings {
	textColors: string;
	highlightColors: string;
}

const DEFAULT_SETTINGS: ColorCyclePluginSettings = {
	textColors: 'black, blue, red, green, null',
	highlightColors: 'yellow, cyan, #fa8072, #ccff00, null'
};


// Validate a single CSS color by testing on a dummy element
function isValidCssColor(color: string): boolean {
	const s = new Option().style;
	s.color = '';
	s.color = color;
	return !!s.color;
}



export default class ColorCyclePlugin extends Plugin {
	settings!: ColorCyclePluginSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'cycle-html-text-color',
			name: 'Cycle HTML Text Color on Selection',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const rawList = this.settings.textColors.split(',').map(c => c.trim());
				const colors = rawList.filter(c => c === 'null' || isValidCssColor(c));

				if (colors.length === 0) {
					new Notice("No valid text colors configured.");
					return;
				}
				this.cycleColor(editor, 'color', colors);
			}
		});

		this.addCommand({
			id: 'cycle-html-highlight-color',
			name: 'Cycle HTML Highlight (Background Color) on Selection',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const rawList = this.settings.highlightColors.split(',').map(c => c.trim());
				const colors = rawList.filter(c => c === 'null' || isValidCssColor(c));

				if (colors.length === 0) {
					new Notice("No valid highlight colors configured.");
					return;
				}
				this.cycleColor(editor, 'background-color', colors);
			}
		});


		this.addSettingTab(new ColorCycleSettingTab(this.app, this));
	}

	private cycleColor(editor: Editor, styleType: 'color' | 'background-color', colors: string[]) {
		const selection = editor.getSelection();
		if (!selection) {
			new Notice("Please select some text.");
			return;
		}

		const cursor = editor.getCursor("from");
		const regex = new RegExp(`<span\\s+style="${styleType}:\\s*(.+?);?\\s*">([\\s\\S]+?)<\\/span>`);
		const match = selection.match(regex);

		let newText: string;
		let innerText: string;

		if (match) {
			const currentColor = match[1].trim();
			innerText = match[2];
			const currentIndex = colors.indexOf(currentColor);
			const nextColor = colors[(currentIndex + 1) % colors.length];
			newText = nextColor === 'null' ? innerText : `<span style="${styleType}:${nextColor};">${innerText}</span>`;
		} else {
			innerText = selection;
			newText = `<span style="${styleType}:${colors[0]};">${innerText}</span>`;
		}

		editor.replaceSelection(newText);

		const start = cursor;
		const end = {
			line: start.line,
			ch: start.ch + newText.length
		};
		editor.setSelection(start, end);
	}

	onunload() {
		// clean up if needed
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class ColorCycleSettingTab extends PluginSettingTab {
	plugin: ColorCyclePlugin;

	constructor(app: App, plugin: ColorCyclePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: "HTML Painter Hotkey Settings" });

		new Setting(containerEl)
			.setName("Text Colors")
			.setDesc("Comma-separated list of text colors (e.g., black, red, #00ffcc, null)")
			.addTextArea((textArea) => {
				textArea
				  .setPlaceholder("e.g., red, green, #0044ff, null")
				  .setValue(this.plugin.settings.textColors)
				  .onChange(async (value: string) => {
					this.plugin.settings.textColors = value;
					await this.plugin.saveSettings();
				  });
			  });



		new Setting(containerEl)
		.setName("Highlight Colors")
		.setDesc("Comma-separated list of highlight (background) colors (e.g., yellow, #ffff00, null)")
		.addTextArea((textArea) => {
		textArea
			.setPlaceholder("e.g., yellow, cyan, #fa8072, #ccff00, null")
			.setValue(this.plugin.settings.highlightColors)
			.onChange(async (value: string) => {
			this.plugin.settings.highlightColors = value;
			await this.plugin.saveSettings();
			});
		});




		new Setting(containerEl)
			.setName("Hotkeys")
			.setDesc("Assign hotkeys under Settings → Hotkeys → Search 'HTML Painter'")
			.setDisabled(true);
	}
}
