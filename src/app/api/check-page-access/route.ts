import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json({ requiresSubscription: false }, { status: 400 })
    }

    const payload = await getPayload({ config })
    
    // Check if the page exists and requires subscription
    const page = await payload.find({
      collection: 'pages',
      where: {
        slug: {
          equals: slug,
        },
      },
      depth: 0,
    })

    if (!page.docs.length) {
      return NextResponse.json({ requiresSubscription: false }, { status: 404 })
    }

    const requiresSubscription = page.docs[0].requiresSubscription || false

    return NextResponse.json({ requiresSubscription })
  } catch (error) {
    console.error('Error checking page access:', error)
    return NextResponse.json({ requiresSubscription: false }, { status: 500 })
  }
} 