import { useState, useRef } from 'react'

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
}

export function CodeBlock({ code, language = 'bash', filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Try modern clipboard API first
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      return
    } catch (err) {
      console.warn('Clipboard API failed, trying fallback:', err)
    }

    // Fallback: use textarea select and execCommand
    try {
      if (textareaRef.current) {
        textareaRef.current.value = code
        textareaRef.current.select()
        const successful = document.execCommand('copy')
        if (successful) {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        }
      }
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  // Escape HTML entities to prevent XSS
  const escapedCode = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return (
    <div className="relative my-4">
      {/* Hidden textarea for fallback copy */}
      <textarea
        ref={textareaRef}
        className="absolute -z-10 w-[1px] h-[1px] opacity-0"
        readOnly
        aria-hidden="true"
      />

      {/* Header bar with filename and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border border-b-0 border-slate-700 rounded-t-xl">
        {filename && (
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-xs text-slate-400 font-mono ml-2">{filename}</span>
          </div>
        )}
        {!filename && <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
        </div>}
        <button
          type="button"
          onClick={handleCopy}
          onMouseDown={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-medium transition-all border border-slate-700 cursor-pointer pointer-events-auto"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <pre className="bg-slate-950 rounded-b-xl p-4 overflow-x-auto border border-t-0 border-slate-800 max-h-96">
        <code
          className="text-xs text-slate-300 font-mono whitespace-pre block"
        >
          {escapedCode}
        </code>
      </pre>
    </div>
  )
}
