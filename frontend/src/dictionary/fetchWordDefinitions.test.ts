import { describe, expect, it } from 'vitest'
import { fetchWordDefinitions, parseDictionaryEntries } from './fetchWordDefinitions'

const craneFixture = [
  {
    word: 'crane',
    phonetic: '/kɹeɪn/',
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: [
          { definition: 'Any bird of the family Gruidae.' },
          { definition: 'A mechanical lifting machine or device.' },
        ],
      },
      {
        partOfSpeech: 'verb',
        definitions: [{ definition: 'To extend (one\'s neck).' }],
      },
    ],
  },
  {
    word: 'crane',
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: [{ definition: 'The cranium.' }],
      },
    ],
  },
]

describe('parseDictionaryEntries', () => {
  it('flattens meanings into part-of-speech definitions', () => {
    const result = parseDictionaryEntries(craneFixture)

    expect(result.phonetic).toBe('/kɹeɪn/')
    expect(result.definitions).toEqual([
      { partOfSpeech: 'noun', definition: 'Any bird of the family Gruidae.' },
      { partOfSpeech: 'noun', definition: 'A mechanical lifting machine or device.' },
      { partOfSpeech: 'verb', definition: "To extend (one's neck)." },
      { partOfSpeech: 'noun', definition: 'The cranium.' },
    ])
  })

  it('returns empty definitions for empty input', () => {
    expect(parseDictionaryEntries([])).toEqual({ phonetic: null, definitions: [] })
  })
})

describe('fetchWordDefinitions', () => {
  it('returns empty definitions on 404', async () => {
    const fetchImpl = async () =>
      new Response(null, { status: 404 })

    await expect(fetchWordDefinitions('zzzzq', fetchImpl)).resolves.toEqual({
      phonetic: null,
      definitions: [],
    })
  })

  it('throws on non-404 HTTP errors', async () => {
    const fetchImpl = async () =>
      new Response(null, { status: 500 })

    await expect(fetchWordDefinitions('crane', fetchImpl)).rejects.toThrow(
      'Failed to load definition: 500',
    )
  })

  it('parses successful responses', async () => {
    const fetchImpl = async () =>
      new Response(JSON.stringify(craneFixture), { status: 200 })

    const result = await fetchWordDefinitions('crane', fetchImpl)
    expect(result.definitions).toHaveLength(4)
    expect(result.phonetic).toBe('/kɹeɪn/')
  })
})
