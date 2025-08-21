terraform {
  required_providers { coder = { source = "coder/coder" } }
}
provider "coder" {}

data "coder_workspace" "me" {}
data "coder_provisioner" "me" {}

data "coder_parameter" "anthropic_api_key" {
  name         = "anthropic_api_key"
  display_name = "Anthropic API key"
  description  = "Provide an API key from console.anthropic.com"
  sensitive    = true
}

resource "coder_agent" "dev" {
  os   = "linux"
  arch = data.coder_provisioner.me.arch
  env  = { ANTHROPIC_API_KEY = data.coder_parameter.anthropic_api_key.value }
  startup_script = <<-EOT
set -euxo pipefail
if ! command -v claude >/dev/null 2>&1; then
  curl -fsSL https://claude.ai/install.sh | bash
fi
claude --version || true
EOT
}

module "claude_code" {
  source   = "registry.coder.com/coder/claude-code/coder"
  version  = "2.1.0"
  agent_id = coder_agent.dev.id
  folder   = "/home/coder/project"
  install_claude_code = false
}
