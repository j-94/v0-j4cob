"use client"

import Form from "next/form"
import { useRouter, useSearchParams } from "next/navigation"
import type React from "react"
import { useTransition, useMemo } from "react"
import SearchStatus from "./SearchStatus"
import { cn } from "@/utils/cn"

type SearchFormClassNames = {
  root: string
  label: string
  input: string
}

type Props = {
  classNames?: Partial<SearchFormClassNames>
}

function debouncePromise(fn: (e: React.ChangeEvent<HTMLInputElement>) => void, time: number) {
  let timer: NodeJS.Timeout | string | number | undefined = undefined

  return function debounced(arg: React.ChangeEvent<HTMLInputElement>) {
    if (timer) clearTimeout(timer)

    return new Promise((resolve) => {
      timer = setTimeout(() => resolve(fn(arg)), time)
    })
  }
}

export default function SearchForm({ classNames = {} }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get("query") || ""
  const [isPending, startTransition] = useTransition()

  const onChangeDebounced = useMemo(
    () =>
      debouncePromise(async (e: React.ChangeEvent<HTMLInputElement>) => {
        startTransition(() => {
          const newSearchParams = new URLSearchParams(searchParams.toString())
          newSearchParams.delete("page")
          if (e.target.value && typeof e.target.value === "string" && e.target.value.length > 0)
            newSearchParams.set("query", e.target.value)
          else newSearchParams.delete("query")
          router.push(`?${newSearchParams.toString()}`, {
            scroll: false,
          })
        })
      }, 350),
    [searchParams, router],
  )

  return (
    <Form
      action="/"
      className={cn("ais-SearchForm", classNames.root)}
      data-pending={isPending ? "" : undefined}
      role="search"
    >
      <label className={cn("ais-SearchForm-label", classNames.label)} htmlFor="search">
        Search AI Tools
      </label>
      <input
        autoComplete="off"
        id="search"
        onChange={onChangeDebounced}
        defaultValue={query}
        className={cn("ais-SearchForm-input", classNames.input)}
        name="query"
        placeholder="Search for AI tools, categories, or use cases..."
        type="search"
      />
      <SearchStatus searching={isPending} />
    </Form>
  )
}

export function SearchFormSkeleton({ classNames = {} }: Props) {
  return (
    <Form action="/" className={cn("ais-SearchForm", classNames.root)} role="search">
      <label className={cn("ais-SearchForm-label", classNames.label)} htmlFor="search">
        Search AI Tools
      </label>
      <input
        autoComplete="off"
        id="search"
        defaultValue=""
        className={cn("ais-SearchForm-input ais-SearchForm-input--disabled", classNames.input)}
        name="query"
        placeholder="Search for AI tools, categories, or use cases..."
        type="search"
        disabled={true}
      />
    </Form>
  )
}
