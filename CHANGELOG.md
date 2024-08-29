# Change Log

All notable changes to the "pmd-cpd" extension will be documented in this file.

## Release Notes

### 0.2.0

#### New

- Add command `Scan Source for Duplicates` to run PMD CPD on source (required PMD binary in path)
- Add extension settings, see [README](./README.md)
  - Language
  - Minimum Duplicate Tokens
  - Minor Issue Token Threshold
  - Major Issue Token Threshold
  - On Start Behavior
  - Source Directory
- Add status bar item for toggling visibility of duplicate code highlighting
- Update duplicate hover over item to show clearer information. e.g. `This file at line 100` or `scr/file.eg:100`

#### Fixed

- Removed duplication of listing in the tree navigation
- Fixed range selection and highlighting to correct row and column indexes
- Display relative paths over full system paths

### 0.1.0 Initial release

- Rework of https://github.com/opendcs/codeanalysis-gutters to be specific to PMD CPD.
