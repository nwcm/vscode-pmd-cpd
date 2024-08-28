# PMD Copy Paste Detection VSCode Extension

A tool to highlight lines of duplicated code flagged by PMD CPD CLI

## Features

- Show [PMD-CPD](https://pmd.github.io/latest/pmd_userdocs_cpd.html) duplication information.
  - searches repository for xml files and checks if they contain a "pmd-cpd" root.
  - hover text has links to other files with the duplicate code.
  - highlights minor,major,critical based on number of tokens (not yet user configurable.)

## Requirements

- [PMD CLI 7.0.0](https://github.com/pmd/pmd/releases/latest) or higher
- Output to `reports/cpd.xml` 
  - `pmd cpd --minimum-tokens 100 --format xml --language apex --dir force-app\main > reports/cpd.xml`

## Extension Settings

No settings at this time.

## Known Issues

- Likely a few

