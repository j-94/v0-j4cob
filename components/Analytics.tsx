"use client"

import { useEffect } from "react"

export default function Analytics() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      const script = document.createElement("script")
      script.defer = true
      script.src = "/_vercel/insights/script.js"
      document.head.appendChild(script)
    }
  }, [])
  return null
}
