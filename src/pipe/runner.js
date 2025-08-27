import { spawn } from "child_process"
import { writeFileSync } from "fs"
import chalk from "chalk"

export class PipeRunner {
  constructor(config) {
    this.config = config
  }

  async search(query) {
    console.log(chalk.gray(`🔍 Searching for: ${query}`))

    return new Promise((resolve) => {
      const startTime = Date.now()

      // Simulate search with ripgrep
      const child = spawn("rg", ["--json", "-n", "-g", "!node_modules", "-e", query], {
        cwd: process.cwd(),
      })

      let output = ""
      const errors = []

      child.stdout.on("data", (data) => {
        output += data.toString()
      })

      child.stderr.on("data", (data) => {
        errors.push(data.toString())
      })

      child.on("close", (code) => {
        resolve({
          action: "search",
          success: code === 0,
          output,
          errors,
          elapsed: Date.now() - startTime,
        })
      })

      // Timeout fallback
      setTimeout(() => {
        child.kill()
        resolve({
          action: "search",
          success: false,
          output: "Search timeout",
          errors: ["Timeout"],
          elapsed: Date.now() - startTime,
        })
      }, 10000)
    })
  }

  async patch(diff) {
    console.log(chalk.gray("🔧 Applying patch..."))

    const startTime = Date.now()

    try {
      // Write diff to temporary file
      writeFileSync("temp.patch", diff)

      return new Promise((resolve) => {
        const child = spawn("git", ["apply", "--whitespace=fix", "temp.patch"], {
          cwd: process.cwd(),
        })

        let output = ""
        const errors = []

        child.stdout.on("data", (data) => {
          output += data.toString()
        })

        child.stderr.on("data", (data) => {
          errors.push(data.toString())
        })

        child.on("close", (code) => {
          resolve({
            action: "patch",
            success: code === 0,
            output,
            errors,
            elapsed: Date.now() - startTime,
          })
        })
      })
    } catch (error) {
      return {
        action: "patch",
        success: false,
        output: "",
        errors: [error.message],
        elapsed: Date.now() - startTime,
      }
    }
  }

  async test(command = "npm test") {
    console.log(chalk.gray(`🧪 Running tests: ${command}`))

    const startTime = Date.now()
    const [cmd, ...args] = command.split(" ")

    return new Promise((resolve) => {
      const child = spawn(cmd, args, {
        cwd: process.cwd(),
      })

      let output = ""
      const errors = []

      child.stdout.on("data", (data) => {
        output += data.toString()
      })

      child.stderr.on("data", (data) => {
        errors.push(data.toString())
      })

      child.on("close", (code) => {
        resolve({
          action: "test",
          success: code === 0,
          output,
          errors,
          elapsed: Date.now() - startTime,
        })
      })

      // Test timeout
      setTimeout(() => {
        child.kill()
        resolve({
          action: "test",
          success: false,
          output: "Test timeout",
          errors: ["Timeout"],
          elapsed: Date.now() - startTime,
        })
      }, 60000)
    })
  }

  async commit(message) {
    console.log(chalk.gray(`📝 Committing: ${message}`))

    const startTime = Date.now()

    return new Promise((resolve) => {
      const child = spawn("git", ["commit", "-am", message], {
        cwd: process.cwd(),
      })

      let output = ""
      const errors = []

      child.stdout.on("data", (data) => {
        output += data.toString()
      })

      child.stderr.on("data", (data) => {
        errors.push(data.toString())
      })

      child.on("close", (code) => {
        resolve({
          action: "commit",
          success: code === 0,
          output,
          errors,
          elapsed: Date.now() - startTime,
        })
      })
    })
  }
}
