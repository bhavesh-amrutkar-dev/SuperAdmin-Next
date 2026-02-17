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
      try {
        const branch = (await import('branch-sdk')).default

        console.log('Initializing Branch SDK...')

        const timeout = setTimeout(() => {
          console.warn('Branch init timeout')
        }, 5000)

        branch.init(process.env.NEXT_PUBLIC_BRANCH_KEY!, (err: any, data: any) => {
          clearTimeout(timeout)

          if (err) {
            console.warn('Branch init failed', err)
          } else {
            console.log('Branch init success', data)
            branchInitialized = true
          }
        })
      } catch (error) {
        console.warn('Branch import failed', error)
      }
    }


    initBranch()
  }, [])

  return null
}
