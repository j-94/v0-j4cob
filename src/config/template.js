export function renderTemplate(template, vars = {}) {
  return template.replace(/{{(\w+)}}/g, (_, key) => {
    const value = vars[key]
    return value !== undefined ? String(value) : ""
  })
}
