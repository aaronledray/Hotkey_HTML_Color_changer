export default class MySimplePlugin extends Plugin {
  async onload() {
    console.log("My Simple Plugin loaded");
  }
  
  onunload() {
    console.log("My Simple Plugin unloaded");
  }
}
