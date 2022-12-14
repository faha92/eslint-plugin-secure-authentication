# eslint-plugin-react-weblint

<h2>Installation</h2>

npm i eslint-plugin-react-weblint



<h2>Recommended configuration: </h2>
{
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:react-weblint/recommended"

    ],
    "overrides": [
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "react", "react-weblint"
    ],
    "rules": {
    }
}
