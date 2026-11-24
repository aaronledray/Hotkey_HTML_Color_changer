/// <reference path="./obsidian.d.ts" />
import { Editor, MarkdownView, Notice, Plugin } from 'obsidian';

// Colors and regex as before


const colors = ['black', 'blue', 'red', 'green', null];  // null = strip wrapper
const colorSpanRegex = /<span\s+style="color:\s*(.+?);?\s*">([\s\S]+?)<\/span>/;

export default class MyPlugin extends Plugin {
  onload() {
    

	this.addCommand({
		id: 'cycle-html-color',
		name: 'Cycle HTML Color on Selection',
		editorCallback: (editor: Editor, view: MarkdownView) => {
		  const selection = editor.getSelection();
		  if (!selection) {
			new Notice("Please select some text first.");
			return;
		  }
	  
		  const cursor = editor.getCursor("from");
		  const match = selection.match(colorSpanRegex);
		  let newText: string;
		  let innerText: string;
	  
		  if (match) {
			const currentColor = match[1].trim();
			innerText = match[2];
			const currentIndex = colors.indexOf(currentColor);
			const nextColor = colors[(currentIndex + 1) % colors.length];
			if (nextColor === null) {
			  newText = innerText;
			} else {
			  newText = `<span style="color:${nextColor};">${innerText}</span>`;
			}
		  } else {
			innerText = selection;
			newText = `<span style="color:${colors[0]};">${innerText}</span>`;
		  }
	  
		  editor.replaceSelection(newText);
	  
		  // Reselect new content
		  const start = cursor;
		  const end = {
			line: start.line,
			ch: start.ch + newText.length
		  };
		  editor.setSelection(start, end);
		}
	  });  // ✅ this closing line is what TS was asking for
	  

    // Example ribbon icon to prove addRibbonIcon exists
    this.addRibbonIcon('dice','Test Notice', () => {
      new Notice('Ribbon is working!');
    });
  }
}
