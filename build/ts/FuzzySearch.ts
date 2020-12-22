import { go, highlight } from "fuzzysort";
import stringify from "fast-stringify";

fetch("/searchindex.json")
    .then((response) => response.json())
    .then((searchindex) => {
        console.log("Search Index:", searchindex);

        let waitForMessage = false;
        self.onmessage = ({ data }) => {
            try {
                if (!waitForMessage) {
                    let timer: number | void;
                    let json = [], keys = ["title", "description", "keywords", "href"];

                    waitForMessage = true;

                    // set a timeout to un-throttle
                    timer = self.setTimeout(() => {
                        let results = go(data, searchindex as any, {
                            keys,
                            allowTypo: true, // if you don't care about allowing typos
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

                        let result: string = stringify(json);
                        self.postMessage(result);

                        waitForMessage = false;
                        timer = self.clearTimeout(timer as number);
                    }, 250);
                }
            } catch (err) {
                console.warn(err);
            }
        };
    });
