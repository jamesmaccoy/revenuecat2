'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserContext } from '@/context/UserContext'
import { useSubscription } from '@/hooks/useSubscription'
import { useRevenueCat } from '@/providers/RevenueCat'
import { Purchases, Package } from '@revenuecat/purchases-js'
import { Button } from '@/components/ui/button'

export default function PremiumContentPage() {
  const router = useRouter()
  const { currentUser } = useUserContext()
  const { isSubscribed, isLoading, error } = useSubscription()
  const { isInitialized } = useRevenueCat()
  const [offerings, setOfferings] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isInitialized) {
      loadOfferings()
    }
  }, [isInitialized])

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

  const loadOfferings = async () => {
    try {
      const offerings = await Purchases.getSharedInstance().getOfferings()
      if (offerings.current && offerings.current.availablePackages.length > 0) {
        setOfferings(offerings.current.availablePackages)
      }
      setLoading(false)
    } catch (err) {
      console.error('Error loading offerings:', err)
      setLoading(false)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-6">Premium Content</h1>
        <p>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-6">Premium Content</h1>
        <p className="text-error">Error: {error.message}</p>
      </div>
    )
  }

  // Don't return null here - wait for the useEffect to handle redirects
  if (!currentUser || !isSubscribed) {
    return (
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-6">Premium Content</h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-6">Premium Content</h1>
      
      <div className="bg-card p-6 rounded-lg shadow-sm border border-border mb-8">
        <h2 className="text-2xl font-semibold mb-4">Welcome to Premium Content</h2>
        <p className="mb-4">
          Thank you for subscribing to our premium service! This content is only available to subscribers.
        </p>
        <p className="mb-4">
          Here you can access exclusive content, features, and benefits that are only available to our
          premium subscribers.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {offerings.map((pkg) => {
          const product = pkg.webBillingProduct
          return (
            <div key={pkg.identifier} className="bg-card p-6 rounded-lg shadow-sm border border-border">
              <h3 className="text-xl font-semibold mb-3">{product.displayName}</h3>
              <p className="mb-4">{product.description}</p>
              <p className="text-lg font-bold mb-4">
                {product.currentPrice.formattedPrice}
              </p>
              <Button
                variant="default"
                className="w-full"
                onClick={() => router.push('/subscribe')}
              >
                Manage Subscription
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
} 