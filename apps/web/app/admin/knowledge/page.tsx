'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import {
  KNOWLEDGE_CATEGORIES,
  ALL_KNOWLEDGE_CATEGORIES,
  type KnowledgeCategoryKey,
} from '@/lib/constants/knowledge-categories'
import {
  getSupportedKnowledgeExtensions,
  parseKnowledgeFile,
} from '@/lib/utils/file-parsers'
import { cn } from '@/lib/utils'
import { Loader2, RefreshCw, Trash2, Upload } from 'lucide-react'

interface KnowledgeChunkItem {
  id: string
  source_file: string
  category: string
  tier: number
  title: string | null
  content: string
  metadata: Record<string, unknown> | null
  created_at: string | null
  updated_at: string | null
  is_active: boolean
}

interface KnowledgeStats {
  total: number
  active: number
  inactive: number
  byCategory: Record<KnowledgeCategoryKey, number>
}

interface KnowledgeListResponse {
  chunks: KnowledgeChunkItem[]
  total: number
  page: number
  limit: number
  stats: KnowledgeStats
}

interface UploadResponse {
  inserted: number
  failed: number
  errors: string[]
}

type StatusFilter = 'all' | 'active' | 'inactive'

type Notice = {
  type: 'success' | 'error'
  message: string
}

const DEFAULT_STATS: KnowledgeStats = {
  total: 0,
  active: 0,
  inactive: 0,
  byCategory: Object.fromEntries(
    ALL_KNOWLEDGE_CATEGORIES.map((c) => [c.key, 0])
  ) as Record<KnowledgeCategoryKey, number>,
}

function formatDate(value: string | null): string {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function toStatusParam(status: StatusFilter): string {
  if (status === 'active') return 'true'
  if (status === 'inactive') return 'false'
  return 'all'
}

export default function KnowledgeUploadAdminPage() {
  const [chunks, setChunks] = useState<KnowledgeChunkItem[]>([])
  const [stats, setStats] = useState<KnowledgeStats>(DEFAULT_STATS)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | KnowledgeCategoryKey>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedUploadCategory, setSelectedUploadCategory] = useState<KnowledgeCategoryKey>('styling_rules')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [notice, setNotice] = useState<Notice | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const categoryInfo = useMemo(() => {
    return new Map(ALL_KNOWLEDGE_CATEGORIES.map((category) => [category.key, category]))
  }, [])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  const selectedCount = selectedIds.size
  const allOnPageSelected = chunks.length > 0 && chunks.every((chunk) => selectedIds.has(chunk.id))

  const supportedExtensions = getSupportedKnowledgeExtensions()
    .map((extension) => `.${extension}`)
    .join(',')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 300)

    return () => window.clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    void loadKnowledge()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, categoryFilter, statusFilter])

  async function loadKnowledge() {
    try {
      setIsLoading(true)
      setNotice(null)

      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        is_active: toStatusParam(statusFilter),
      })

      if (categoryFilter !== 'all') {
        params.set('category', categoryFilter)
      }

      if (search) {
        params.set('search', search)
      }

      const response = await fetch(`/api/admin/knowledge?${params.toString()}`)
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.error ?? 'Failed to load knowledge data')
      }

      const data = payload as KnowledgeListResponse
      setChunks(data.chunks)
      setTotal(data.total)
      setStats(data.stats ?? DEFAULT_STATS)
      setSelectedIds((previous) => {
        const validIds = new Set(data.chunks.map((chunk) => chunk.id))
        const next = new Set<string>()
        for (const id of previous) {
          if (validIds.has(id)) next.add(id)
        }
        return next
      })
    } catch (error) {
      setNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to load knowledge data',
      })
    } finally {
      setIsLoading(false)
    }
  }

  function handleFilePicked(file: File | null) {
    if (!file) return
    setSelectedFile(file)
    setNotice(null)
  }

  async function handleUpload() {
    if (!selectedFile) {
      setNotice({ type: 'error', message: 'Please select a file first' })
      return
    }

    try {
      setIsUploading(true)
      setUploadProgress(5)
      setNotice(null)

      const parsedChunks = await parseKnowledgeFile(selectedFile)
      setUploadProgress(35)

      if (parsedChunks.length === 0) {
        throw new Error('No content extracted from this file')
      }

      const response = await fetch('/api/admin/knowledge/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chunks: parsedChunks,
          category: selectedUploadCategory,
          sourceFile: selectedFile.name,
        }),
      })

      const payload = await response.json()
      setUploadProgress(85)

      if (!response.ok) {
        throw new Error(payload?.error ?? 'Upload failed')
      }

      const uploadResult = payload as UploadResponse
      const summary = `Upload complete: ${uploadResult.inserted} inserted, ${uploadResult.failed} failed`
      const hasErrors = uploadResult.errors.length > 0

      setNotice({
        type: hasErrors ? 'error' : 'success',
        message: hasErrors
          ? `${summary}. ${uploadResult.errors.slice(0, 3).join(' | ')}`
          : summary,
      })

      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      setUploadProgress(100)
      setPage(1)
      await loadKnowledge()
    } catch (error) {
      setNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to upload file',
      })
    } finally {
      window.setTimeout(() => setUploadProgress(0), 350)
      setIsUploading(false)
    }
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    try {
      const response = await fetch('/api/admin/knowledge/toggle', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, is_active: isActive }),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.error ?? 'Failed to update status')
      }

      setChunks((previous) => previous.map((chunk) => (
        chunk.id === id
          ? {
              ...chunk,
              is_active: isActive,
              updated_at: new Date().toISOString(),
            }
          : chunk
      )))

      await loadKnowledge()
    } catch (error) {
      setNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to update status',
      })
    }
  }

  async function handleDeleteSelected() {
    if (selectedIds.size === 0) return

    const confirmed = window.confirm(`Delete ${selectedIds.size} selected chunk(s)?`)
    if (!confirmed) return

    try {
      const response = await fetch('/api/admin/knowledge', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.error ?? 'Failed to delete selected chunks')
      }

      setNotice({
        type: 'success',
        message: `Deleted ${payload.deleted ?? 0} chunk(s)`,
      })
      setSelectedIds(new Set())
      await loadKnowledge()
    } catch (error) {
      setNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete selected chunks',
      })
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <h1 className="text-2xl font-semibold">Knowledge Admin Upload</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload CSV, PDF, DOCX, XLSX files and manage RAG knowledge chunks.
          </p>

          <input
            id="knowledge-file-input"
            ref={fileInputRef}
            type="file"
            name="knowledge-file"
            accept={supportedExtensions}
            className="mt-4 block w-full max-w-sm text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:bg-card file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground hover:file:bg-muted"
            onChange={(event) => {
              handleFilePicked(event.target.files?.[0] ?? null)
              event.target.value = ''
            }}
          />

          <div
            className={cn(
              'mt-5 rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors',
              isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 bg-background',
            )}
            onDragEnter={(event) => {
              event.preventDefault()
              event.stopPropagation()
              setIsDragging(true)
            }}
            onDragOver={(event) => {
              event.preventDefault()
              event.stopPropagation()
              setIsDragging(true)
            }}
            onDragLeave={(event) => {
              event.preventDefault()
              event.stopPropagation()
              if (event.currentTarget.contains(event.relatedTarget as Node)) return
              setIsDragging(false)
            }}
            onDrop={(event) => {
              event.preventDefault()
              event.stopPropagation()
              setIsDragging(false)
              const droppedFile = event.dataTransfer?.files?.[0] ?? null
              if (droppedFile) handleFilePicked(droppedFile)
            }}
          >
            {isDragging ? (
              <p className="text-sm font-medium text-primary">Drop file here</p>
            ) : selectedFile ? (
              <div className="flex items-center justify-center gap-3">
                <Upload aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{selectedFile.name}</span>
                <button
                  type="button"
                  className="text-xs text-muted-foreground underline hover:text-foreground"
                  onClick={() => {
                    setSelectedFile(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <Upload aria-hidden="true" className="h-4 w-4 text-muted-foreground/60" />
                <span className="text-sm text-muted-foreground">
                  Drag &amp; drop a file here, or use the file picker below (CSV, PDF, DOCX, XLSX)
                </span>
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center gap-3">
            <select
              aria-label="Upload category"
              className="h-9 rounded-lg border bg-background px-3 text-sm"
              value={selectedUploadCategory}
              onChange={(event) => setSelectedUploadCategory(event.target.value as KnowledgeCategoryKey)}
            >
              {KNOWLEDGE_CATEGORIES.map((category) => (
                <option key={category.key} value={category.key}>
                  {category.icon} {category.label}
                </option>
              ))}
            </select>

            <Button
              size="sm"
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              loading={isUploading}
              icon={!isUploading ? <Upload className="h-3.5 w-3.5" /> : undefined}
            >
              Upload
            </Button>
          </div>

          {uploadProgress > 0 && (
            <div className="mt-4">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-[width] duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground tabular-nums">{uploadProgress}%</p>
            </div>
          )}

          {notice && (
            <div
              className={cn(
                'mt-4 rounded-lg border p-3 text-sm',
                notice.type === 'success'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                  : 'border-red-300 bg-red-50 text-red-800'
              )}
            >
              {notice.message}
            </div>
          )}
        </section>

        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-background p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Chunks</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{stats.total}</p>
            </div>
            <div className="rounded-lg border bg-background p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Active</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-emerald-700">{stats.active}</p>
            </div>
            <div className="rounded-lg border bg-background p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Inactive</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-red-700">{stats.inactive}</p>
            </div>
            <div className="rounded-lg border bg-background p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Current Result</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{total}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {ALL_KNOWLEDGE_CATEGORIES.map((category) => {
              const count = stats.byCategory[category.key] ?? 0
              if (count === 0) return null
              return (
                <div key={category.key} className="rounded-lg border bg-background p-2 text-sm">
                  <p className="font-medium">{category.icon} {category.label}</p>
                  <p className="text-muted-foreground">{count}</p>
                </div>
              )
            })}
          </div>
        </section>

        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3">
            <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search title or content\u2026"
                aria-label="Search knowledge chunks"
                className="w-full"
              />

              <select
                aria-label="Filter by category"
                className="h-10 rounded-lg border bg-background px-3 text-sm"
                value={categoryFilter}
                onChange={(event) => {
                  setCategoryFilter(event.target.value as 'all' | KnowledgeCategoryKey)
                  setPage(1)
                }}
              >
                <option value="all">All categories</option>
                {ALL_KNOWLEDGE_CATEGORIES.map((category) => (
                  <option key={category.key} value={category.key}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>

              <select
                aria-label="Filter by status"
                className="h-10 rounded-lg border bg-background px-3 text-sm"
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as StatusFilter)
                  setPage(1)
                }}
              >
                <option value="all">All statuses</option>
                <option value="active">Active only</option>
                <option value="inactive">Inactive only</option>
              </select>

              <Button
                variant="outline"
                onClick={() => void loadKnowledge()}
                icon={<RefreshCw aria-hidden="true" className="h-4 w-4" />}
              >
                Refresh
              </Button>
            </div>

            {selectedCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{selectedCount} selected</span>
                <button
                  type="button"
                  onClick={() => void handleDeleteSelected()}
                  className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
                >
                  <Trash2 aria-hidden="true" className="h-3 w-3" />
                  Delete
                </button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/60 text-left">
                <tr>
                  <th className="px-3 py-2">
                    <Checkbox
                      aria-label="Select all on this page"
                      checked={allOnPageSelected}
                      onCheckedChange={() => {
                        setSelectedIds((previous) => {
                          const next = new Set(previous)
                          if (allOnPageSelected) {
                            chunks.forEach((chunk) => next.delete(chunk.id))
                          } else {
                            chunks.forEach((chunk) => next.add(chunk.id))
                          }
                          return next
                        })
                      }}
                    />
                  </th>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Source File</th>
                  <th className="px-3 py-2">Created</th>
                  <th className="px-3 py-2">Active</th>
                  <th className="px-3 py-2 w-10"></th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> Loading\u2026
                      </span>
                    </td>
                  </tr>
                ) : chunks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">
                      No knowledge chunks found
                    </td>
                  </tr>
                ) : (
                  chunks.map((chunk) => {
                    const category = categoryInfo.get(chunk.category as KnowledgeCategoryKey)
                    const isExpanded = expandedId === chunk.id

                    return (
                      <FragmentRow
                        key={chunk.id}
                        chunk={chunk}
                        categoryLabel={category?.label ?? chunk.category}
                        categoryIcon={category?.icon ?? '📄'}
                        isSelected={selectedIds.has(chunk.id)}
                        onToggleSelected={() => {
                          setSelectedIds((previous) => {
                            const next = new Set(previous)
                            if (next.has(chunk.id)) {
                              next.delete(chunk.id)
                            } else {
                              next.add(chunk.id)
                            }
                            return next
                          })
                        }}
                        isExpanded={isExpanded}
                        onToggleExpanded={() => {
                          setExpandedId((previous) => (previous === chunk.id ? null : chunk.id))
                        }}
                        onToggleActive={(checked) => void handleToggleActive(chunk.id, checked)}
                        onDelete={() => {
                          const confirmed = window.confirm(`Delete "${chunk.title ?? 'Untitled'}"?`)
                          if (!confirmed) return
                          void (async () => {
                            try {
                              const response = await fetch('/api/admin/knowledge', {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ ids: [chunk.id] }),
                              })
                              const payload = await response.json().catch(() => ({}))
                              if (!response.ok) throw new Error(payload?.error ?? 'Delete failed')
                              setNotice({ type: 'success', message: `Deleted "${chunk.title ?? 'chunk'}"` })
                              await loadKnowledge()
                            } catch (error) {
                              setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Delete failed' })
                            }
                          })()
                        }}
                      />
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing page {page} of {totalPages} ({total} rows)
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((previous) => Math.max(1, previous - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((previous) => Math.min(totalPages, previous + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

interface FragmentRowProps {
  chunk: KnowledgeChunkItem
  categoryLabel: string
  categoryIcon: string
  isSelected: boolean
  isExpanded: boolean
  onToggleSelected: () => void
  onToggleExpanded: () => void
  onToggleActive: (checked: boolean) => void
  onDelete: () => void
}

function FragmentRow({
  chunk,
  categoryLabel,
  categoryIcon,
  isSelected,
  isExpanded,
  onToggleSelected,
  onToggleExpanded,
  onToggleActive,
  onDelete,
}: FragmentRowProps) {
  return (
    <>
      <tr
        className={cn(
          'cursor-pointer border-t transition-[background-color] hover:bg-muted/40',
          !chunk.is_active && 'opacity-50',
        )}
        onClick={onToggleExpanded}
      >
        <td className="px-3 py-2" onClick={(event) => event.stopPropagation()}>
          <Checkbox aria-label={`Select ${chunk.title ?? 'chunk'}`} checked={isSelected} onCheckedChange={onToggleSelected} />
        </td>
        <td className="max-w-[320px] px-3 py-2">
          <p className="truncate font-medium">{chunk.title ?? 'Untitled'}</p>
        </td>
        <td className="px-3 py-2">{categoryIcon} {categoryLabel}</td>
        <td className="max-w-[240px] px-3 py-2">
          <p className="truncate text-muted-foreground">{chunk.source_file}</p>
        </td>
        <td className="px-3 py-2 text-muted-foreground">{formatDate(chunk.created_at)}</td>
        <td className="px-3 py-2" onClick={(event) => event.stopPropagation()}>
          <Switch
            aria-label={`Toggle active for ${chunk.title ?? 'chunk'}`}
            checked={chunk.is_active}
            onCheckedChange={onToggleActive}
            className={cn(!chunk.is_active && 'data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600')}
          />
        </td>
        <td className="px-3 py-2" onClick={(event) => event.stopPropagation()}>
          <button
            type="button"
            aria-label={`Delete ${chunk.title ?? 'chunk'}`}
            onClick={onDelete}
            className="rounded p-1 text-muted-foreground/60 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
          >
            <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        </td>
      </tr>

      {isExpanded && (
        <tr className="border-t bg-muted/20">
          <td colSpan={7} className="px-3 py-3">
            <div className="grid gap-3 lg:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Content Preview
                </p>
                <pre className="max-h-52 overflow-auto whitespace-pre-wrap rounded-md border bg-background p-3 text-xs">
                  {chunk.content}
                </pre>
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Metadata
                </p>
                <pre className="max-h-52 overflow-auto whitespace-pre-wrap rounded-md border bg-background p-3 text-xs">
                  {JSON.stringify(
                    {
                      id: chunk.id,
                      tier: chunk.tier,
                      source_file: chunk.source_file,
                      created_at: chunk.created_at,
                      updated_at: chunk.updated_at,
                      metadata: chunk.metadata,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
