// import Fuse from "fuse.js";
import { go, highlight } from "fuzzysort";
import stringify from "fast-stringify";

// // Based on: https://gist.github.com/evenfrost/1ba123656ded32fb7a0cd4651efd4db0
// let highlight = (
//     fuseSearchResult: any,
//     highlightClassName: string = "highlight"
// ) => {
//     let set = (obj: object, path: string, value: any) => {
//         let pathValue = path.split(".");
//         let i = 0,
//             len = pathValue.length - 1;

//         for (; i < len; i++) {
//             obj = obj[pathValue[i]];
//         }

//         obj[pathValue[i]] = value;
//     };

//     let generateHighlightedText = (
//         inputText: string,
//         regions: number[] = []
//     ) => {
//         let content = "";
//         let nextUnhighlightedRegionStartingIndex = 0;

//         regions.forEach((region) => {
//             let lastRegionNextIndex = region[1] + 1;

//             content += [
//                 inputText.substring(
//                     nextUnhighlightedRegionStartingIndex,
//                     region[0]
//                 ),
//                 `<span class="${highlightClassName}">`,
//                 inputText.substring(region[0], lastRegionNextIndex),
//                 "</span>",
//             ].join("");

//             nextUnhighlightedRegionStartingIndex = lastRegionNextIndex;
//         });

//         content += inputText.substring(nextUnhighlightedRegionStartingIndex);
//         return content;
//     };

//     return fuseSearchResult
//         .filter(({ matches }: any) => matches && matches.length)
//         .map(({ item, matches }: any) => {
//             let highlightedItem = Object.assign({}, item);

//             matches.forEach((match: any) => {
//                 set(
//                     highlightedItem,
//                     match.key,
//                     generateHighlightedText(match.value, match.indices)
//                 );
//             });

//             return highlightedItem;
//         });
// };

fetch("/searchindex.json")
    .then((response) => response.json())
    .then((searchindex) => {
        console.log("Search Index:", searchindex);

        // let searcher = new Fuse(searchindex as any, {
        //     keys: ["title", "description", "keywords"],
        //     // findAllMatches: true,
        //     includeMatches: true,
        //     threshold: 0.5,
        // });

        self.onmessage = ({ data }) => {
            let json = [], keys = ["title", "description", "keywords", "href"];
            let results = go(data, searchindex as any, {
                keys,
                allowTypo: true, // if you don't care about allowing typos
                // Create a custom combined score to sort by. -100 to the desc score makes it a worse match
                // scoreFn: (a) => Math.max(a[0] ? a[0].score : -1000, a[1] ? a[1].score - 100 : -1000)
            });

            let i = 0, len = results.length;
            for (; i < len; i++) {
                json[i] = keys.reduce((acc, key, x) => {
                    if (key == "href")
                        acc[key] = results[i].obj[key];
                    else
                        acc[key] = highlight(results[i][x], `<span class="highlight">`, `</span>`) ?? results[i].obj[key];
                    return acc;
                }, {});
            }

            // console.log(json)
            // let json = highlight(searcher.search(data));
            let result: string = stringify(json);
            self.postMessage(result);
        };
    });
