/* eslint-disable @typescript-eslint/no-explicit-any */
import { openDB } from "idb";

const dbName = `mkFileShareDB`

const stores = ['files'] as const
async function getDB() {
  return openDB(dbName, (stores.length + 1),{
    upgrade(db) {
      stores.map(store => {
        if (!db.objectStoreNames.contains(store)) {
          const storem = db.createObjectStore(store, { keyPath: 'id' })
          if (store=='files') {
            storem.createIndex('folder_name', ['folder','name'], { unique: false })
            storem.createIndex('folder', 'folder', { unique: false })
            storem.createIndex('name', 'name', { unique: false })
          }
        }
      })
    },
  })
}

type Store = typeof stores[number];

export const indexedDBStorage = {
  async getItem(key: string, store: Store) {
    const db = await getDB()
    return db.get((store), key)
  },
  async setItem(key: any, value: any, store: Store) {
    const db = await getDB()
    return db.put((store),value, key?key:undefined)
  },
  async put(value: any, store: Store) {
    return this.setItem(null,value,store)
  },
  async removeItem(key: string, store: Store) {
    const db = await getDB()
    return db.delete((store), key)
  },
  async uploadFile(key: string, src: any, store: Store) {
    try {
      if (!src) {
        return {
          success: false,
          message: 'Src is required'
        }
      }
      const response = await fetch(`/api/music/audio?url=${src}`, {
        method: 'GET',
        // body:JSON.stringify({url:src})
      })
      const blob = await response.blob()
      const res=await this.put({blob,id:key},(store))
      return {
        success: true,
        data: res
      }
    } catch (err) {
      return {
        success: false,
        err: err
      }
    }
  },
  async getFile(key: string, store?: Store) {
    const db = await getDB()
    const blob = await db.get((store || 'audios'), key)
    if (!blob || !store) return null
    return URL.createObjectURL(blob?blob?.blob:blob)
  },
  async getStore(store: Store, filter?: any) {
    const db = await getDB()
    let result: any[] = []
    if (filter) {
      const key = Object.keys(filter)[0]
      result = await db.getAllFromIndex(store, key, filter[key])
    } else {
      result = await db.getAll(store)
    }
    return result
  },
}
