export type WordDictionary = ReadonlySet<string>

let dictionary: WordDictionary | null = null
let loadPromise: Promise<WordDictionary> | null = null

export function getWordDictionary(): WordDictionary | null {
  return dictionary
}

export function loadWordDictionary(): Promise<WordDictionary> {
  if (dictionary) return Promise.resolve(dictionary)
  if (loadPromise) return loadPromise

  loadPromise = fetch('/words.json')
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load dictionary: ${res.status}`)
      return res.json() as Promise<Record<string, number>>
    })
    .then((data) => {
      dictionary = new Set(Object.keys(data))
      return dictionary
    })
    .catch((err) => {
      loadPromise = null
      throw err
    })

  return loadPromise
}

export function isWordInDictionary(word: string, dict: WordDictionary): boolean {
  return dict.has(word.toLowerCase())
}
