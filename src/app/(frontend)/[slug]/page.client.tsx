'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSubscription } from '@/hooks/useSubscription'
import type { Page as PageType } from '@/payload-types'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { RenderHero } from '@/heros/RenderHero'
import { RenderBlocks } from '@/blocks/RenderBlocks'

interface PageClientProps {
  page: PageType
  draft: boolean
}

export default function PageClient({ page, draft }: PageClientProps) {
  const router = useRouter()
  const { isSubscribed, isLoading, error } = useSubscription()
  /* Force the header to be dark mode while we have an image behind it */
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('light')
  }, [setHeaderTheme])

  React.useEffect(() => {
    if (!isLoading && !error) {
      if (!isSubscribed) {
        router.push('/subscribe')
      }
    }
  }, [isSubscribed, isLoading, error, router])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  if (!isSubscribed) {
    return null
  }

  return (
    <div>
      <h1>{page.title}</h1>
      <PayloadRedirects disableNotFound url={'/' + page.slug} />
      {draft && <LivePreviewListener />}
      <RenderHero {...page.hero} />
      <RenderBlocks blocks={page.layout} />
    </div>
  )
}
