module.exports = {
    overrides: [
        {
            files: ["*.jsx", "*.ts", "*.tsx"],
            extends: "standard-with-typescript",
            parserOptions: {
                project: "./tsconfig.json"
            },
            rules: {
                "@typescript-eslint/no-invalid-void-type": "warn",
                "@typescript-eslint/strict-boolean-expressions": "off",
                "@typescript-eslint/ban-ts-comment": "off",
                "@typescript-eslint/no-confusion-void-expression": "off",
                "@typescript-eslint/explicit-function-return-type": "off",
                "no-secrets/no-secrets":["error",{"tolerance":3.9}]
            },
            plugins:["no-secrets"],
        }
    ]
};
