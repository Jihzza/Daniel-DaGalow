import { useCallback } from 'react'

/**
 * Returns a function you can call with an element’s id,
 * and it will smooth‑scroll to that element (if it exists).
 */
export default function useScrollTo() {
  return useCallback((id) => {
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])
}
