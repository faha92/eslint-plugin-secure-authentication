# eslint-plugin-react-weblint

<h2>Installation</h2>

```npm i eslint-plugin-secure-access```

<h2>Recommended configuration: </h2>

```
module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": ["plugin:secure-access/recommended"],
    "overrides": [
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": ["secure-access"],
    "rules": {
    }
};

