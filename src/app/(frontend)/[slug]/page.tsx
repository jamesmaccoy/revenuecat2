// Server Component
import React from 'react'
import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import { homeStatic } from '@/endpoints/seed/home-static'
import type { Page as PageType } from '@/payload-types'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    limit: 0,
  })

  return pages.docs.map(({ slug }) => ({ slug }))
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = 'home' } = await paramsPromise

  const payload = await getPayload({ config: configPromise })

  let page: PageType | null = null

  if (slug === 'home') {
    page = homeStatic
  } else {
    const result = await payload.find({
      collection: 'pages',
      where: {
        slug: {
          equals: slug,
        },
      },
    })

    if (result.docs[0]) {
      page = result.docs[0]
    }
  }

  if (!page) {
    return null
  }

  return (
    <article className="pt-16 pb-24">
      <PageClient page={page} draft={draft} />
    </article>
  )
}

// Client Component
'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useUserContext } from '@/context/UserContext'
import { useSubscription } from '@/hooks/useSubscription'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { RenderHero } from '@/heros/RenderHero'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import type { Page as PageType } from '@/payload-types'

export function PageClient({ page, draft }: { page: PageType; draft: boolean }) {
  const router = useRouter()
  const { currentUser } = useUserContext()
  const { isSubscribed, isLoading, error } = useSubscription()

  // Only redirect if we're certain about the subscription status
  React.useEffect(() => {
    if (!isLoading && !error) {
      if (!currentUser) {
        router.push('/login')
      } else if (!isSubscribed) {
        router.push('/subscribe')
      }
    }
  }, [currentUser, isSubscribed, isLoading, error, router])

  if (isLoading) {
    return <p>Loading...</p>
  }

  if (error) {
    return <p className="text-error">Error: {error.message}</p>
  }

  // Don't return null here - wait for the useEffect to handle redirects
  if (!currentUser || !isSubscribed) {
    return <p>Loading...</p>
  }

  return (
    <>
      <PayloadRedirects disableNotFound url={'/' + page.slug} />
      {draft && <LivePreviewListener />}
      <RenderHero {...page.hero} />
      <RenderBlocks blocks={page.layout} />
    </>
  )
}

export async function generateMetadata({ params: paramsPromise }): Promise<Metadata> {
  const { slug = 'home' } = await paramsPromise
  const page = await queryPageBySlug({
    slug,
  })

  return generateMeta({ doc: page })
}

const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
