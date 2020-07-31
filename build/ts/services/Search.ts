import { Service } from "../framework/api";

export class Search extends Service {
  protected worker: Worker;
  protected input: HTMLElement;
  protected results: HTMLElement;
  protected value: string = "";
  public init() {
    super.init();
    this.input = document.querySelector(".search-input");
    if (this.input) {
      this.results = document.querySelector(".search-results");
      this.worker = new Worker("js/FuzzySearch.min.js");
    }
  }
  public initEvents() {
    if (this.input) {
      this.input.addEventListener("keyup", () => {
        const { value } = this.input as HTMLInputElement;
        this.value = value;
        this.worker.postMessage(value);
      });
      // receive data from a worker
      this.worker.onmessage = (event) => {
        this.removeResults();
        const data = JSON.parse(event.data);
        if (data.length < 1 && this.value.length === 0) {
          this.noResults();
        } else {
          for (let i = 0, len = data.length; i < len; i++) {
            this.addResult(data[i]);
          }
        }
      };
    }
  }

  public stopEvents() {
    this.worker.terminate();
    this.worker = undefined;
  }

  public noResults() {
    this.results.textContent = "No results.";
  }

  public addResult(data: {
    item: { title: string; description: string };
    refIndex: number;
  }) {
    const { title, description } = data.item;
    let el = document.createElement("div");
    el.className = "search-result p-5";
    el.innerHTML = `
      <h5 class="font-title text-xl search-result-title pb-2 mb-4">${title}</h5>
      <p>${description}</p>`;
    this.results.appendChild(el);
  }

  public removeResults() {
    let firstChild = this.results.firstChild;

    while (firstChild) {
      this.results.removeChild(firstChild);
      firstChild = this.results.firstChild;
    }
  }
}
