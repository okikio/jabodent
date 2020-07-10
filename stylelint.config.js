module.exports = {
    plugins: ["stylelint-scss"],
    rules: {
        "at-rule-empty-line-before": [
            "always",
            {
                ignoreAtRules: ["else"],
            },
        ],
        "block-opening-brace-space-before": "always",
        "block-closing-brace-newline-after": [
            "always",
            {
                ignoreAtRules: ["if", "else"],
            },
        ],
        "at-rule-name-space-after": "always",
        "rule-empty-line-before": "always",
        "scss/at-else-closing-brace-newline-after": "always-last-in-chain",
        "scss/at-else-closing-brace-space-after": "always-intermediate",
        "scss/at-else-empty-line-before": "never",
        "scss/at-if-closing-brace-newline-after": "always-last-in-chain",
        "scss/at-if-closing-brace-space-after": "always-intermediate",
        // "at-rule-no-unknown": [
        //     true,
        //     {
        //         ignoreAtRules: [
        //             "tailwind",
        //             "apply",
        //             "variants",
        //             "responsive",
        //             "screen",
        //         ],
        //     },
        // ],
        "declaration-block-trailing-semicolon": null,
        "no-descending-specificity": null,
    },
};
