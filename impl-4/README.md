impl-4 — Remote Workspace (choose one: Devcontainer or Coder)

Pick the subfolder you use (devcontainer/ or coder/).

Devcontainer
- Open the folder in VS Code → Reopen in Container.
- Claude Code is installed at build time inside the container.
- Safe-YOLO note: Auto-accept is allowed here only (disposable env).

Coder
- Push the template (coder/main.tf) with `coder templates push`.
- Create a workspace; provide API key via a secure parameter.
