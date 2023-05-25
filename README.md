# eslint-plugin-secure-authentication

<h2>Installation</h2>

```npm i eslint-plugin-secure-authentication```

<h2>Recommended configuration: </h2>

```
module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": ["plugin:secure-authentication/recommended"],
    "overrides": [
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": ["secure-authentication"],
    "rules": {
    }
};

