# react-native-libraries

This repository is a megarepo that includes the code for the top React Native community library repositories. The primary use case is for the React Native team to look for usages of core APIs across the ecosystem in order to decide on changes we might want to make.

Ideally GitHub code search would be usable for us, however it often finds callsites within forks of React Native that can't be excluded from search because they aren't properly marked as a fork.

## Usage
Check out this repo and grep over the `libraries` folder. Make sure to clone submodules too. You also don't need the history of any part of this repo or the submodules, so skip those.

```
git clone --depth 1 --recurse-submodules --shallow-submodules git@github.com:TheSavior/react-native-libraries.git
```

*Ideally you'd be able to use GitHub code search on this specific repo, however GitHub doesn't search through sub modules.*

## Updates
This repository automatically updates the library code via GitHub Workflow every day.

## Thanks
This repository relies on the React Native directory's API, and we are thankful to @Simek for building that with an API!