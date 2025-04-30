import type { Block } from 'payload'

export const BookingCalculator: Block = {
  slug: 'bookingCalculator',
  interfaceName: 'BookingCalculatorBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: 'Booking Calculator',
    },
    {
      name: 'description',
      type: 'text',
      required: true,
      defaultValue: 'Calculate the total price for your booking based on the duration and selected package.',
    },
  ],
  labels: {
    plural: 'Booking Calculators',
    singular: 'Booking Calculator',
  },
} 