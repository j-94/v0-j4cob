export async function slow(delay = 1000) {
  await new Promise((resolve) => {
    return setTimeout(resolve, delay)
  })
}
