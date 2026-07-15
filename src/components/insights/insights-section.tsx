"use client"

import { useMemo, useState } from "react"
import { Search, Download, type LucideIcon } from "lucide-react"
import { DashboardSection } from "@/components/dashboard/section"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { MeetingOption } from "@/lib/data/insights"

type StatusOption = { value: string; label: string }
type Column<T> = { header: string; render: (row: T) => React.ReactNode }

const PER_PAGE_OPTIONS = [10, 25, 50]

function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
  const csv = [headers, ...rows].map((row) => row.map(escape).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function InsightsSection<T>({
  icon,
  title,
  rows,
  searchPlaceholder,
  getSearchText,
  getDate,
  statusOptions,
  getStatus,
  meetings,
  getMeetingId,
  columns,
  csvHeaders,
  getCsvRow,
}: {
  icon: LucideIcon
  title: string
  rows: T[]
  searchPlaceholder: string
  getSearchText: (row: T) => string
  getDate: (row: T) => string | null
  statusOptions: StatusOption[]
  getStatus: (row: T) => string
  meetings?: MeetingOption[]
  getMeetingId?: (row: T) => string | null
  columns: Column<T>[]
  csvHeaders: string[]
  getCsvRow: (row: T) => (string | number)[]
}) {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [meetingFilter, setMeetingFilter] = useState("all")
  const [perPage, setPerPage] = useState(10)
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (search && !getSearchText(row).toLowerCase().includes(search.toLowerCase())) return false
      if (status !== "all" && getStatus(row) !== status) return false
      const date = getDate(row)
      if (fromDate && (!date || date < fromDate)) return false
      if (toDate && (!date || date > toDate)) return false
      if (meetingFilter !== "all" && getMeetingId) {
        if (getMeetingId(row) !== meetingFilter) return false
      }
      return true
    })
  }, [rows, search, status, fromDate, toDate, meetingFilter, getSearchText, getStatus, getDate, getMeetingId])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)

  return (
    <DashboardSection title={title.toUpperCase()} icon={icon}>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder={searchPlaceholder}
              className="pl-9"
            />
          </div>
          <button
            onClick={() => downloadCsv(`${title.toLowerCase()}.csv`, csvHeaders, filtered.map(getCsvRow))}
            disabled={filtered.length === 0}
            className="flex shrink-0 items-center gap-1 text-sm font-medium text-accent-foreground hover:underline disabled:pointer-events-none disabled:opacity-40"
          >
            <Download className="size-4" /> Download CSV
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Filter By</span>
            <div className="flex gap-1 rounded-md border p-1">
              <button
                onClick={() => {
                  setStatus("all")
                  setPage(1)
                }}
                className={cn(
                  "rounded px-2.5 py-1 font-medium",
                  status === "all" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted",
                )}
              >
                All Statuses
              </button>
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setStatus(opt.value)
                    setPage(1)
                  }}
                  className={cn(
                    "rounded px-2.5 py-1 font-medium",
                    status === opt.value
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {meetings && (
            <select
              value={meetingFilter}
              onChange={(e) => {
                setMeetingFilter(e.target.value)
                setPage(1)
              }}
              className="h-8 rounded-md border bg-transparent px-2 text-sm"
            >
              <option value="all">Filter by meeting...</option>
              {meetings.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value)
                setPage(1)
              }}
              className="w-40"
            />
            <Input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value)
                setPage(1)
              }}
              className="w-40"
              placeholder="To date"
            />
          </div>
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value))
              setPage(1)
            }}
            className="h-8 rounded-md border bg-transparent px-2 text-sm"
          >
            {PER_PAGE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} per page
              </option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            This organization currently has no {title.toLowerCase()} based on any filtering criteria.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                    {columns.map((col) => (
                      <th key={col.header} className="px-4 py-2">
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((row, i) => (
                    <tr key={i} className="border-b last:border-b-0">
                      {columns.map((col) => (
                        <td key={col.header} className="px-4 py-3">
                          {col.render(row)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-end gap-3 text-sm">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="text-accent-foreground hover:underline disabled:pointer-events-none disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="text-accent-foreground hover:underline disabled:pointer-events-none disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardSection>
  )
}
