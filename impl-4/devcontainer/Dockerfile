FROM mcr.microsoft.com/devcontainers/base:ubuntu
SHELL ["/bin/bash", "-lc"]
RUN apt-get update && apt-get install -y curl git ca-certificates && rm -rf /var/lib/apt/lists/*

# Install Node (for npm fallback/tools)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs

# Install Claude Code (native latest)
RUN curl -fsSL https://claude.ai/install.sh | bash
RUN claude --version || true
