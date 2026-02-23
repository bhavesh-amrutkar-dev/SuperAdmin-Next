'use client'

import { Button } from '@/src/components/ui/button'

export default function BranchTestPage() {
    const generateLink = async () => {
        const branch = (await import('branch-sdk')).default

        branch.link(
            {
                channel: 'test',
                campaign: 'test_campaign',
                data: {
                    custom_param: 'hello_world',
                },
            },
            (err: any, url: string) => {
                if (err) {
                    console.error(err)
                } else {
                    // console.log('Generated Branch URL:', url)
                    alert(url)
                }
            }
        )
    }

    return (
        <div style={{ padding: 40 }}>
            <Button onClick={generateLink} className='bg-blue-500 text-white hover:cursor-pointer'>
                Generate Branch Test Link
            </Button>
        </div>
    )
}
