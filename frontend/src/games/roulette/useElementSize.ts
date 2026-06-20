import { useEffect, useState, type RefObject } from 'react'

export function useElementHeight(ref: RefObject<HTMLElement | null>): number | undefined {
  const [height, setHeight] = useState<number | undefined>()

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const update = () => setHeight(el.getBoundingClientRect().height)
    update()

    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])

  return height
}

export function useSquareFitSize(ref: RefObject<HTMLElement | null>): number | undefined {
  const [size, setSize] = useState<number | undefined>()

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const update = () => {
      const { width, height } = el.getBoundingClientRect()
      setSize(Math.floor(Math.min(width, height)))
    }
    update()

    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])

  return size
}
