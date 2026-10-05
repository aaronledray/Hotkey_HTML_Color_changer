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

function parseColorList(value: string): string[] {
	return value
		.split(',')
		.map((color) => color.trim())
		.filter((color) => color === 'null' || isValidCssColor(color));
}

function getSelectionEnd(start: { line: number; ch: number }, text: string) {
	const lines = text.split('\n');
	return {
		line: start.line + lines.length - 1,
		ch: lines.length === 1 ? start.ch + lines[0].length : lines[lines.length - 1].length,
	};
}

function updateInlineColor(selection: string, styleType: 'color' | 'background-color', colors: string[]): string {
	const spanMatch = selection.match(/^<span\b([^>]*)>([\s\S]*)<\/span>$/i);
	if (!spanMatch) {
		return colors[0] === 'null'
			? selection
			: `<span style="${styleType}:${colors[0]};">${selection}</span>`;
	}

	const attributes = spanMatch[1];
	const innerText = spanMatch[2];
	const styleMatch = attributes.match(/\bstyle\s*=\s*(["'])([\s\S]*?)\1/i);
	if (!styleMatch) {
		return colors[0] === 'null'
			? selection
			: `<span style="${styleType}:${colors[0]};"${attributes}>${innerText}</span>`;
	}

	const declarations = styleMatch[2]
		.split(';')
		.map((declaration) => declaration.trim())
		.filter(Boolean);
	const propertyIndex = declarations.findIndex((declaration) => {
		const separator = declaration.indexOf(':');
		return separator !== -1 && declaration.slice(0, separator).trim().toLowerCase() === styleType;
	});
	const currentColor = propertyIndex === -1
		? undefined
		: declarations[propertyIndex].slice(declarations[propertyIndex].indexOf(':') + 1).trim();
	const currentIndex = currentColor === undefined ? -1 : colors.indexOf(currentColor);
	const nextColor = colors[(currentIndex + 1) % colors.length];

	if (nextColor === 'null') {
		if (propertyIndex !== -1) {
			declarations.splice(propertyIndex, 1);
		}
	} else if (propertyIndex === -1) {
		declarations.push(`${styleType}:${nextColor}`);
	} else {
		declarations[propertyIndex] = `${styleType}:${nextColor}`;
	}

	if (declarations.length === 0) {
		return innerText;
	}

	const updatedStyle = declarations.join('; ');
	const updatedAttributes = styleMatch[0].replace(styleMatch[2], updatedStyle);
	const updatedSpan = attributes.replace(styleMatch[0], updatedAttributes);
	return `<span${updatedSpan}>${innerText}</span>`;
}



export default class ColorCyclePlugin extends Plugin {
	settings!: ColorCyclePluginSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'cycle-html-text-color',
			name: 'Cycle HTML Text Color on Selection',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const colors = parseColorList(this.settings.textColors);

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
				const colors = parseColorList(this.settings.highlightColors);

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
		const newText = updateInlineColor(selection, styleType, colors);

		editor.replaceSelection(newText);

		const start = cursor;
		const end = getSelectionEnd(start, newText);
		editor.setSelection(start, end);
	}

	onunload() {
		// clean up if needed
	}

	async loadSettings() {
		const data: unknown = await this.loadData();
		const savedSettings = data && typeof data === 'object'
			? data as Record<string, unknown>
			: {};

		this.settings = {
			textColors: typeof savedSettings.textColors === 'string'
				? savedSettings.textColors
				: DEFAULT_SETTINGS.textColors,
				highlightColors: typeof savedSettings.highlightColors === 'string'
					? savedSettings.highlightColors
					: DEFAULT_SETTINGS.highlightColors,
		};
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

	// Obsidian 1.13+ uses the declarative definitions for settings search.
	getSettingDefinitions() {
		return [
			{
				name: "Text Colors",
				desc: "Comma-separated list of text colors, such as black, red, #00ffcc, null.",
				control: {
					type: "textarea" as const,
					key: "textColors",
					placeholder: "e.g., red, green, #0044ff, null",
					rows: 3,
				},
			},
			{
				name: "Highlight Colors",
				desc: "Comma-separated list of highlight colors, such as yellow, cyan, #fa8072, null.",
				control: {
					type: "textarea" as const,
					key: "highlightColors",
					placeholder: "e.g., yellow, cyan, #fa8072, #ccff00, null",
					rows: 3,
				},
			},
		];
	}

	// Legacy settings UI for Obsidian versions before 1.13.
	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Text Colors")
			.setDesc("Comma-separated list of text colors, such as black, red, #00ffcc, null.")
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
			.setDesc("Comma-separated list of highlight colors, such as yellow, cyan, #fa8072, null.")
			.addTextArea((textArea) => {
				textArea
					.setPlaceholder("e.g., yellow, cyan, #fa8072, #ccff00, null")
					.setValue(this.plugin.settings.highlightColors)
					.onChange(async (value: string) => {
						this.plugin.settings.highlightColors = value;
						await this.plugin.saveSettings();
					});
			});
	}
}
