import { readFileSync } from "fs"
import yaml from "yaml"

export async function loadConfig() {
  try {
    const configFile = readFileSync("project.yaml", "utf8")
    return yaml.parse(configFile)
  } catch (error) {
    console.error("Failed to load project.yaml:", error.message)
    process.exit(1)
  }
}
