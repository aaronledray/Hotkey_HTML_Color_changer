// obsidian.d.ts
declare module 'obsidian' {
    // Editor API that we actually use:


    export interface App {}

    


    export interface Component {}

    export class TextAreaComponent extends Component {
      setPlaceholder(placeholder: string): this;
      setValue(value: string): this;
      onChange(callback: (value: string) => any): this;
    }
    
    export class PluginSettingTab {
      constructor(app: App, plugin: Plugin);
      app: App;
      plugin: Plugin;
      containerEl: HTMLDivElement & {
        empty(): void;
        createEl(tag: string, options?: { text?: string }): HTMLElement;
      };
      display(): void;
    }

    
    export class Setting {
      constructor(containerEl: HTMLElement);
      setName(name: string): this;
      setDesc(desc: string): this;
      addTextArea(cb: (component: TextAreaComponent) => void): this;
      setDisabled(disabled: boolean): this;
    }
    
  
    
    export abstract class Plugin {
      app: App;
      addCommand(opts: any): void;
      addRibbonIcon(icon: string, title: string, cb: Function): HTMLElement;
      addSettingTab(tab: PluginSettingTab): void;
      loadData(): Promise<any>;
      saveData(data: any): Promise<void>;
    }
    
    export interface EditorPosition {
        line: number;
        ch: number;
      }
      
      export interface Editor {
        getSelection(): string;
        replaceSelection(text: string): void;
      
        getCursor(position?: 'from' | 'to'): EditorPosition;
        setSelection(from: EditorPosition, to: EditorPosition): void;
      }
      
  
    export interface MarkdownView {}
  
    // Only the Plugin methods you call:
    export abstract class Plugin {
      addCommand(options: { 
        id: string;
        name: string;
        editorCallback?: (editor: Editor, view: MarkdownView) => void;
        callback?: () => void;
        checkCallback?: (checking: boolean) => boolean;
      }): void;
      addRibbonIcon(icon: string, title: string, cb: (evt: MouseEvent) => any): HTMLElement;
    }
  
    // Notice constructor:
    export class Notice {
      constructor(message: string);
    }
  }
  