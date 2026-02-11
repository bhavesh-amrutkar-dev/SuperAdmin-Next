'use client'

import { useEffect } from 'react'

export default function BranchProvider() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdn.branch.io/branch-latest.min.js'
    script.async = true
    document.head.appendChild(script)

    script.onload = () => {
      // @ts-ignore
      if (window.branch) {
        // @ts-ignore
        window.branch.init(process.env.NEXT_PUBLIC_BRANCH_KEY)
      }
    }
  }, [])

  return null
}
