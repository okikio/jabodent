import { Service } from "../framework/api";

export class Search extends Service {
  protected worker: Worker;
  protected input: HTMLElement;
  protected results: HTMLElement;
  public init() {
    super.init();
    this.worker = new Worker("js/FuzzySearch.min.js");
    this.input = document.querySelector(".search-input");
    this.results = document.querySelector(".search-results");
  }
  public initEvents() {
      this.input.addEventListener("keyup", () => {
          let { value } = this.input;
          console.log(value);
          this.worker.postMessage(value);
      });
    // receive data from a worker
    this.worker.onmessage = ({ data }) => {
        this.removeResults();
        for (let i = 0, len = data.length; i < len; i ++) {
            this.addResult(data[i]);
        }
    //   console.log(data);
    };
  }
  public stopEvents() {
    this.worker.terminate();
    this.worker = undefined;
  }

  public addResult(data) {
      let el = document.createElement("span");
      el.textContent = JSON.stringify(data)
      this.results.appendChild(el);
  }

  public removeResults() {
    let firstChild = this.results.firstChild;

    while( firstChild ) {
        this.results.removeChild( firstChild );
        firstChild = this.results.firstChild;
    }
  } 
}
