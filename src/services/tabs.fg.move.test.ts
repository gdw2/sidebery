import { afterEach, describe, expect, test } from 'vitest'
import * as Containers from 'src/services/containers'
import { DEFAULT_CONTAINER, DEFAULT_CONTAINER_ID } from 'src/defaults'
import * as Utils from 'src/utils'
import { TESTING_MOVE as TESTING } from 'src/services/tabs.fg.move'

const { getDropContainerId, needsReopenInContainer } = TESTING

describe('Tabs.move: getDropContainerId()', () => {
  afterEach(() => {
    Containers.reactive.byId = {}
  })

  test('no container rule', () => {
    expect(getDropContainerId({ dropTabCtx: 'none' })).toBeUndefined()
  })

  test('default container', () => {
    expect(getDropContainerId({ dropTabCtx: DEFAULT_CONTAINER_ID })).toBe(DEFAULT_CONTAINER_ID)
  })

  test('existing container', () => {
    const ctr = Utils.clone(DEFAULT_CONTAINER)
    ctr.id = ctr.cookieStoreId = 'ctr1'
    Containers.reactive.byId[ctr.id] = ctr
    expect(getDropContainerId({ dropTabCtx: 'ctr1' })).toBe('ctr1')
  })

  test('removed container', () => {
    expect(getDropContainerId({ dropTabCtx: 'ctr1' })).toBeUndefined()
  })
})

describe('Tabs.move: needsReopenInContainer()', () => {
  const tab = (override?: Partial<{ panelId: ID; pinned: boolean; cookieStoreId: string }>) => {
    return { panelId: 'p1', pinned: false, cookieStoreId: DEFAULT_CONTAINER_ID, ...override }
  }

  test('tab is already in the panel container', () => {
    expect(needsReopenInContainer([tab()], 'p2', DEFAULT_CONTAINER_ID)).toBe(false)
  })

  test('tab is in another container', () => {
    expect(needsReopenInContainer([tab()], 'p2', 'ctr1')).toBe(true)
  })

  test('one of the tabs is in another container', () => {
    const tabs = [tab(), tab({ cookieStoreId: 'ctr1' })]
    expect(needsReopenInContainer(tabs, 'p2', 'ctr1')).toBe(true)
  })

  test('no container rule', () => {
    expect(needsReopenInContainer([tab()], 'p2', undefined)).toBe(false)
  })

  test('tab is already in the target panel', () => {
    expect(needsReopenInContainer([tab()], 'p1', 'ctr1')).toBe(false)
  })

  test('pinned tab', () => {
    expect(needsReopenInContainer([tab({ pinned: true })], 'p2', 'ctr1')).toBe(false)
  })

  test('no tabs', () => {
    expect(needsReopenInContainer([], 'p2', 'ctr1')).toBe(false)
  })
})
