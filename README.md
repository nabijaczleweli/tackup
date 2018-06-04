# tackup [![Licence](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)
Continuously back up your browser tabs.

## Usage & funxion

The extension will, at each tab closed or opened event, save the current tab list with the timestamp to localstorage.
This was inspired by [Pirate](https://github.com/thecoshman)'s [tweet](https://twitter.com/thecoshman/status/991028360590618624), which is also my biggest fear.

After [installation](#Installation), you can configure the backup interval in the standard addon config place under `about:addons`:

![configuration screenshot](https://user-images.githubusercontent.com/6709544/39678244-2a8f8592-5189-11e8-90b8-9825f82be8fd.png)

Clicking on "See saved tab lists…" will take you to a page with tabset listings, sorted freshest-to-oldest.

## Installation

Get an `.xpi` from the [releases page](https://github.com/nabijaczleweli/tackup/releases) and install it
  (how to do *that* depends on your browser; in Firefox, a drag&drop on the window is sufficient
  (be warned, though: you might need to disable signature verification)).

For development purposes point `about:debugging`'s temporary add-on at the repo clone.

(Maybe official Mozilla addon page in future?)
