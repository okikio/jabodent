import Fuse from "fuse.js";
import stringify from "fast-stringify";

// Based on: https://gist.github.com/evenfrost/1ba123656ded32fb7a0cd4651efd4db0
const highlight = (
    fuseSearchResult: any,
    highlightClassName: string = "highlight"
) => {
    const set = (obj: object, path: string, value: any) => {
        const pathValue = path.split(".");
        let i = 0,
            len = pathValue.length - 1;

        for (; i < len; i++) {
            obj = obj[pathValue[i]];
        }

        obj[pathValue[i]] = value;
    };

    const generateHighlightedText = (
        inputText: string,
        regions: number[] = []
    ) => {
        let content = "";
        let nextUnhighlightedRegionStartingIndex = 0;

        regions.forEach((region) => {
            const lastRegionNextIndex = region[1] + 1;

            content += [
                inputText.substring(
                    nextUnhighlightedRegionStartingIndex,
                    region[0]
                ),
                `<span class="${highlightClassName}">`,
                inputText.substring(region[0], lastRegionNextIndex),
                "</span>",
            ].join("");

            nextUnhighlightedRegionStartingIndex = lastRegionNextIndex;
        });

        content += inputText.substring(nextUnhighlightedRegionStartingIndex);
        return content;
    };

    return fuseSearchResult
        .filter(({ matches }: any) => matches && matches.length)
        .map(({ item, matches }: any) => {
            const highlightedItem = Object.assign({}, item);

            matches.forEach((match: any) => {
                set(
                    highlightedItem,
                    match.key,
                    generateHighlightedText(match.value, match.indices)
                );
            });

            return highlightedItem;
        });
};

fetch("/searchindex.json")
    .then((response) => response.json())
    .then((searchindex) => {
        console.log("Search Index:", searchindex);

        const searcher = new Fuse(searchindex as any, {
            keys: ["title", "description", "keywords"],
            // findAllMatches: true,
            includeMatches: true,
            threshold: 0.6,
        });
        self.onmessage = ({ data }) => {
            let json = highlight(searcher.search(data));
            let result: string = stringify(json);
            self.postMessage(result);
        };
    });
