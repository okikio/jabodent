import Fuse from "fuse.js";

const people = [
  {
    name: {
      firstName: "Jesse",
      lastName: "Bowen",
    },
    state: "Seattle",
  },
  {
    name: {
      firstName: "Brown Jses",
      lastName: "Bowen ",
    },
    state: "Califonia",
  },
];

const searcher = new Fuse(people, {
  keys: ["name.firstName", "state"],

  // @ts-ignore
  caseSensitive: true,
});

let result: object[];
self.onmessage = ({ data }) => {
  result = searcher.search(data);
  self.postMessage(result);
};
// console.log(result);
// send data from a worker to a JavaScript file
