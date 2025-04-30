'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserContext } from '@/context/UserContext'
import { useSubscription } from '@/hooks/useSubscription'
import { Purchases } from '@revenuecat/purchases-js'
import { differenceInDays } from 'date-fns'

export default function PremiumContentPage() {
  const router = useRouter()
  const { currentUser } = useUserContext()
  const { isSubscribed, isLoading, error } = useSubscription()
  const [offerings, setOfferings] = useState<any[]>([])
  const [selectedPackage, setSelectedPackage] = useState<any>(null)
  const [fromDate, setFromDate] = useState<Date | null>(null)
  const [toDate, setToDate] = useState<Date | null>(null)
  const [totalPrice, setTotalPrice] = useState<number | null>(null)

  useEffect(() => {
    const loadOfferings = async () => {
      try {
        const offerings = await Purchases.getSharedInstance().getOfferings()
        if (offerings.current && offerings.current.availablePackages.length > 0) {
          setOfferings(offerings.current.availablePackages)
        }
      } catch (err) {
        console.error('Error loading offerings:', err)
      }
    }

    if (isSubscribed) {
      loadOfferings()
    }
  }, [isSubscribed])

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

  useEffect(() => {
    if (fromDate && toDate && selectedPackage) {
      const days = differenceInDays(toDate, fromDate)
      const price = selectedPackage.webBillingProduct.currentPrice.amount
      setTotalPrice(days * price)
    } else {
      setTotalPrice(null)
    }
  }, [fromDate, toDate, selectedPackage])

  if (isLoading) {
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
        <h2 className="text-2xl font-semibold mb-4">Booking Calculator</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">From Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              onChange={(e) => setFromDate(new Date(e.target.value))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">To Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              onChange={(e) => setToDate(new Date(e.target.value))}
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select Package</label>
          <select
            className="w-full p-2 border rounded"
            onChange={(e) => {
              const pkg = offerings.find(p => p.identifier === e.target.value)
              setSelectedPackage(pkg)
            }}
          >
            <option value="">Select a package</option>
            {offerings.map((pkg) => (
              <option key={pkg.identifier} value={pkg.identifier}>
                {pkg.webBillingProduct.displayName} - {pkg.webBillingProduct.currentPrice.formattedPrice}
              </option>
            ))}
          </select>
        </div>

        {totalPrice !== null && (
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Total Price</h3>
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: selectedPackage?.webBillingProduct.currentPrice.currency || 'USD'
              }).format(totalPrice)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Based on {differenceInDays(toDate!, fromDate!)} days at {selectedPackage?.webBillingProduct.currentPrice.formattedPrice} per day
            </p>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <h3 className="text-xl font-semibold mb-3">Exclusive Feature 1</h3>
          <p>
            This is an exclusive feature that is only available to premium subscribers. It provides
            additional value and benefits.
          </p>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <h3 className="text-xl font-semibold mb-3">Exclusive Feature 2</h3>
          <p>
            This is another exclusive feature that is only available to premium subscribers. It provides
            additional value and benefits.
          </p>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <h3 className="text-xl font-semibold mb-3">Exclusive Feature 3</h3>
          <p>
            This is yet another exclusive feature that is only available to premium subscribers. It provides
            additional value and benefits.
          </p>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <h3 className="text-xl font-semibold mb-3">Exclusive Feature 4</h3>
          <p>
            This is one more exclusive feature that is only available to premium subscribers. It provides
            additional value and benefits.
          </p>
        </div>
      </div>
    </div>
  )
} 