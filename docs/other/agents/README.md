# Working with coding assistants

[Documentation overview](../../README.md)

This directory holds documentation about development with coding assistants. This file is a guide; repository instructions in any `AGENTS.md` files remain in their applicable locations.

When requesting a change, describe the goal, visible behavior and relevant file or screen. Have the assistant read existing code and documentation first. Keep changes small enough to understand and review yourself.

Useful starting points:

- [Architecture and resources](../architecture/architectuur.md).
- [Game packs and sessions](../architecture/spelpakketten.md).
- [Servers, builds and tests](../installation/README.md).
- [Historical investigations and measurements](../../archive/README.md).

Edit source files and regenerate `public_html/speel.html` when the change needs to work in the offline version. Check behavior with an appropriate existing test and in the browser. Update documentation and links when files or instructions change.

Write documentation under `docs/other/` in English and student-facing documentation under `docs/student/` in Dutch. Keep code identifiers, file paths and literal Dutch interface labels unchanged where needed to locate them in the application.
