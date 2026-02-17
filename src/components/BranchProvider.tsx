'use client'

import { useEffect } from 'react'
import { ENABLE_BRANCH_IO } from '../lib/config'

let branchInitialized = false

export default function BranchProvider() {
  useEffect(() => {
    if (!ENABLE_BRANCH_IO) {
      console.log('Branch disabled')
      return
    }

    if (branchInitialized) {
      console.log('Branch already initialized')
      return
    }

    const initBranch = async () => {
      const branch = (await import('branch-sdk')).default

      console.log('Initializing Branch SDK...')

      branch.init(
        process.env.NEXT_PUBLIC_BRANCH_KEY!,
        (err: any, data: any) => {
          if (err) {
            console.error('Branch init failed', err)
          } else {
            console.log('Branch init success', data)
            branchInitialized = true
          }
        }
      )
    }

    initBranch()
  }, [])

  return null
}
