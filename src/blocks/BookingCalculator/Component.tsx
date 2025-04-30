'use client'

import React, { useState, useEffect } from 'react'
import { Purchases } from '@revenuecat/purchases-js'
import { differenceInDays } from 'date-fns'
import { useSubscription } from '@/hooks/useSubscription'

export const BookingCalculator: React.FC<{
  title: string
  description: string
}> = (props) => {
  const { title, description } = props
  const { isSubscribed } = useSubscription()
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

  useEffect(() => {
    if (fromDate && toDate && selectedPackage) {
      const days = differenceInDays(toDate, fromDate)
      const price = selectedPackage.webBillingProduct.currentPrice.amount
      setTotalPrice(days * price)
    } else {
      setTotalPrice(null)
    }
  }, [fromDate, toDate, selectedPackage])

  if (!isSubscribed) {
    return null
  }

  return (
    <div className="bg-card p-6 rounded-lg shadow-sm border border-border mb-8">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <p className="text-muted-foreground mb-6">{description}</p>
      
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
  )
} 