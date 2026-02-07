# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This is a megarepo of ~280 popular React Native community libraries, included as git submodules under `libraries/`. It exists so the React Native team can grep across the ecosystem to find usages of core APIs when evaluating changes, without the noise of React Native forks that pollute GitHub code search.

## Repository Structure

- `libraries/<github-org>/<repo-name>/` — git submodules of popular React Native libraries (>10k weekly npm downloads)
- `index.js` — script that fetches the library list from the React Native Directory API and adds/updates submodules
- `.github/workflows/update.yml` — daily GitHub Action that runs `yarn update` to sync submodules

## Commands

- `yarn update` — fetches the latest library list from reactnative.directory and updates all git submodules (runs `index.js`)
- Clone with submodules: `git clone --depth 1 --recurse-submodules --shallow-submodules <repo-url>`
- Update submodules manually: `git submodule update --depth 1 --recursive --init --force`

## Common Usage

The primary workflow is searching across all library code for API usage patterns:

```sh
grep -r --include=\*.{m,mm,h,swift} "bridge.uiManager" libraries/
grep -r --include=\*.{ts,tsx,js,jsx} "useAnimatedStyle" libraries/
```

## Key Details

- All submodules are shallow clones (depth 1) — no git history
- The library list is sourced from the React Native Directory API filtered to `isPopular: true` and `weekDownloads > 10000`
- Submodules are organized by GitHub org/user, not by package name
- GitHub doesn't index submodule contents, so searches must be done locally
