export interface WordDefinition {
  partOfSpeech: string
  definition: string
}

export interface WordDefinitionLookup {
  phonetic: string | null
  definitions: WordDefinition[]
}

interface ApiDefinition {
  definition?: string
}

interface ApiMeaning {
  partOfSpeech?: string
  definitions?: ApiDefinition[]
}

interface ApiEntry {
  phonetic?: string
  phonetics?: Array<{ text?: string }>
  meanings?: ApiMeaning[]
}

const DICTIONARY_API_BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en'

export function parseDictionaryEntries(entries: ApiEntry[]): WordDefinitionLookup {
  const definitions: WordDefinition[] = []
  let phonetic: string | null = null

  for (const entry of entries) {
    if (!phonetic) {
      phonetic = entry.phonetic ?? entry.phonetics?.find((item) => item.text)?.text ?? null
    }

    for (const meaning of entry.meanings ?? []) {
      const partOfSpeech = meaning.partOfSpeech ?? 'unknown'
      for (const item of meaning.definitions ?? []) {
        if (!item.definition) continue
        definitions.push({
          partOfSpeech,
          definition: item.definition,
        })
      }
    }
  }

  return { phonetic, definitions }
}

export async function fetchWordDefinitions(
  word: string,
  fetchImpl: typeof fetch = fetch,
): Promise<WordDefinitionLookup> {
  const response = await fetchImpl(`${DICTIONARY_API_BASE}/${encodeURIComponent(word.toLowerCase())}`)

  if (response.status === 404) {
    return { phonetic: null, definitions: [] }
  }

  if (!response.ok) {
    throw new Error(`Failed to load definition: ${response.status}`)
  }

  const entries = (await response.json()) as ApiEntry[]
  return parseDictionaryEntries(entries)
}
