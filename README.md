# 🧰 Intlify CLI

CLI Tooling for i18n development

## 💿 Installation

### npm

```sh
npm install -g @intlify/cli
```

### yarn
```sh
yarn global add @intlify/cli
```

### yarn
```sh
yarn global add @intlify/cli
```

## 🌟 Features
- the i18n resources compilation
- the attributes annotation for i18n custom block
- the i18n custom block formatting

## 🚀 Usage

```
Usage: intlify <command> [options]

Commands:
  intlify compile   compile the i18n resources                     [aliases: cp]
  intlify annotate  annotate the attributes                        [aliases: at]
  intlify format    format for single-file components              [aliases: ft]

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
```

## 🙈 Ignoring

For `annotate` or `format` commands, you can ignore with using `.intlifyignore` or `--ignore` for files passed at the end of the options or `--source` option

### `.intlifyignore`

To exclude files from iles passed at the end of the options or `--source` option, create a `.itnlifyignore` file in the root of your project. `.intlifyignore` uses [gitignore syntax](https://git-scm.com/docs/gitignore#_pattern_format).

example:
```
# Ignore node_modules
node_modules

# ignore  artifacts
build
coverage
```

tt’s recommended to have a `.intlifyignore` in your project! This way you can run `intlify format —source /path/to/**/*.vue —type custom-block` . to make sure that everything is executed (without mangling files you don’t want, or choking on generated files).

### `--ignore` option

If you can't use `.intlifyignore` for some reason and want to specify a different file, you can use the `--ignore` option to achieve this.

```sh
# ignore with `.gitignore`
intlify format —source /path/to/**/*.vue —type custom-block --ignore .gitignore
```

## 🤝 API

About details, See the [API References](https://github.com/intlify/cli/blob/main/api.md)


## 🌏 I18n

Intlify cli is supporting for I18n.

If you would like to localiize Intlify CLI, you can contribute i18n resource to [locales](https://github.com/intlify/cli/blob/main/locales) directory.

## 📜 Changelog
Details changes for each release are documented in the [CHANGELOG.md](https://github.com/intlify/cli/blob/main/CHANGELOG.md).


## ❗ Issues
Please make sure to read the [Issue Reporting Checklist](https://github.com/intlify/cli/blob/main/.github/CONTRIBUTING.md#issue-reporting-guidelines) before opening an issue. Issues not conforming to the guidelines may be closed immediately.

## ©️ License

[MIT](http://opensource.org/licenses/MIT)
