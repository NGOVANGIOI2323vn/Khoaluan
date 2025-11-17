import  { useMemo } from 'react'
import { useLoadScript, GoogleMap, Marker } from '@react-google-maps/api'
import { motion } from 'framer-motion'

interface GoogleMapProps {
  center?: { lat: number; lng: number }
  zoom?: number
  height?: string
  address?: string
}

const GoogleMapComponent = ({
  center = { lat: 10.8231, lng: 106.6297 }, // TP. Hồ Chí Minh
  zoom = 15,
  height = '400px',
  address = '123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh, Việt Nam',
}: GoogleMapProps) => {
  // Sử dụng Google Maps API Key từ environment variable
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  
  const libraries = useMemo(() => ['places'] as const, [])

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: libraries as unknown as ('places')[],
  })

  // Luôn sử dụng Embed API để tránh lỗi RefererNotAllowedMapError
  // Embed API không cần cấu hình domain restrictions
  const encodedAddress = encodeURIComponent(address)
  const embedUrl = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodedAddress}&zoom=${zoom}`
    : `https://www.google.com/maps/embed/v1/place?q=${encodedAddress}&zoom=${zoom}`

  // Nếu không có API key hoặc có lỗi, sử dụng Embed API
  if (!apiKey || loadError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl overflow-hidden shadow-lg"
        style={{ height }}
      >
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={embedUrl}
          title="Google Maps"
        />
      </motion.div>
    )
  }

  if (!isLoaded) {
    return (
      <div
        className="rounded-xl overflow-hidden shadow-lg bg-gray-200 flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">Đang tải bản đồ...</p>
        </div>
      </div>
    )
  }

  // Nếu có API key và đã load thành công, sử dụng JavaScript API
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl overflow-hidden shadow-lg"
      style={{ height }}
    >
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={zoom}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: true,
          mapTypeControl: true,
          fullscreenControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }],
            },
          ],
        }}
      >
        <Marker
          position={center}
          title={address}
        />
      </GoogleMap>
    </motion.div>
  )
}

export default GoogleMapComponent
