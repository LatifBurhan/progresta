/**
 * Unit tests for LocationLink component
 * Feature: overtime-location-tracking
 */

import { render, screen } from '@testing-library/react'
import { LocationLink } from './LocationLink'

describe('LocationLink Component', () => {
  describe('Rendering behavior', () => {
    it('should render link with both clock in and clock out coordinates', () => {
      render(
        <LocationLink
          clockInLat={-6.2088}
          clockInLng={106.8456}
          clockOutLat={-6.2146}
          clockOutLng={106.8451}
        />
      )

      const link = screen.getByRole('link', { name: /lihat lokasi/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href')
      expect(link.getAttribute('href')).toContain('maps.google.com')
      expect(link.getAttribute('href')).toContain('markers=')
    })

    it('should render link with only clock in coordinates', () => {
      render(
        <LocationLink
          clockInLat={-6.2088}
          clockInLng={106.8456}
          clockOutLat={null}
          clockOutLng={null}
        />
      )

      const link = screen.getByRole('link', { name: /lihat lokasi/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href')
      expect(link.getAttribute('href')).toContain('maps.google.com')
    })

    it('should render link with only clock out coordinates', () => {
      render(
        <LocationLink
          clockInLat={null}
          clockInLng={null}
          clockOutLat={-6.2146}
          clockOutLng={106.8451}
        />
      )

      const link = screen.getByRole('link', { name: /lihat lokasi/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href')
    })

    it('should return null when no coordinates are provided', () => {
      const { container } = render(
        <LocationLink
          clockInLat={null}
          clockInLng={null}
          clockOutLat={null}
          clockOutLng={null}
        />
      )

      expect(container.firstChild).toBeNull()
    })

    it('should return null when only latitude is provided', () => {
      const { container } = render(
        <LocationLink
          clockInLat={-6.2088}
          clockInLng={null}
          clockOutLat={null}
          clockOutLng={null}
        />
      )

      expect(container.firstChild).toBeNull()
    })

    it('should return null when only longitude is provided', () => {
      const { container } = render(
        <LocationLink
          clockInLat={null}
          clockInLng={106.8456}
          clockOutLat={null}
          clockOutLng={null}
        />
      )

      expect(container.firstChild).toBeNull()
    })
  })

  describe('Link attributes', () => {
    it('should have target="_blank" attribute', () => {
      render(
        <LocationLink
          clockInLat={-6.2088}
          clockInLng={106.8456}
          clockOutLat={null}
          clockOutLng={null}
        />
      )

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('target', '_blank')
    })

    it('should have rel="noopener noreferrer" attribute', () => {
      render(
        <LocationLink
          clockInLat={-6.2088}
          clockInLng={106.8456}
          clockOutLat={null}
          clockOutLng={null}
        />
      )

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('should apply custom className', () => {
      render(
        <LocationLink
          clockInLat={-6.2088}
          clockInLng={106.8456}
          clockOutLat={null}
          clockOutLng={null}
          className="custom-class"
        />
      )

      const link = screen.getByRole('link')
      expect(link).toHaveClass('custom-class')
    })
  })

  describe('Icon rendering', () => {
    it('should render location icon SVG', () => {
      render(
        <LocationLink
          clockInLat={-6.2088}
          clockInLng={106.8456}
          clockOutLat={null}
          clockOutLng={null}
        />
      )

      const link = screen.getByRole('link')
      const svg = link.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveClass('w-4', 'h-4')
    })
  })

  describe('URL generation integration', () => {
    it('should generate correct URL format for two locations', () => {
      render(
        <LocationLink
          clockInLat={-6.2088}
          clockInLng={106.8456}
          clockOutLat={-6.2146}
          clockOutLng={106.8451}
        />
      )

      const link = screen.getByRole('link')
      const href = link.getAttribute('href')
      
      expect(href).toContain('https://www.google.com/maps/search/?api=1')
      expect(href).toContain('markers=-6.2088,106.8456')
      expect(href).toContain('markers=-6.2146,106.8451')
    })

    it('should generate correct URL format for single location', () => {
      render(
        <LocationLink
          clockInLat={-6.2088}
          clockInLng={106.8456}
          clockOutLat={null}
          clockOutLng={null}
        />
      )

      const link = screen.getByRole('link')
      const href = link.getAttribute('href')
      
      expect(href).toContain('https://www.google.com/maps/search/?api=1')
      expect(href).toContain('query=-6.2088,106.8456')
    })
  })
})
