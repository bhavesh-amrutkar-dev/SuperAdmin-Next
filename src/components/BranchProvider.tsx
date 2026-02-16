'use client'

import { useEffect } from 'react'
import { ENABLE_BRANCH_IO } from '../lib/config'

export default function BranchProvider() {
  useEffect(() => {
    if (!ENABLE_BRANCH_IO) return;

    // Check if script already exists to prevent duplicates
    if (document.getElementById('branch-sdk-script')) {
      return;
    }

    const script = document.createElement('script')
    script.id = 'branch-sdk-script'
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

    // Cleanup: remove script on unmount
    return () => {
      const existingScript = document.getElementById('branch-sdk-script');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    }
  }, [])

  return null
}
