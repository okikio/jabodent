import Fuse from "fuse.js";

const people = [
  {
    title: "Title 1",
    description: "Description 1",
  },
  {
    title: "Tlite 2",
    description: "Desction 2",
  },
];

const searcher = new Fuse(people, {
  keys: ["title", "description"],
});

let result: string;
self.onmessage = ({ data }) => {
  result = JSON.stringify(searcher.search(data));
  self.postMessage(result);
};
