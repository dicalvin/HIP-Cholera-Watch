import { useState } from 'react'
import { motion } from 'framer-motion'
import WeatherAlerts from '../components/WeatherAlerts'
import WeatherImpactAnalysis from '../components/WeatherImpactAnalysis'
import DistrictDetailsModal from '../components/DistrictDetailsModal'

function Weather() {
  const [selectedDistrict, setSelectedDistrict] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="page">
      <motion.section
        className="hero secondary"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div>
          <p className="eyebrow">Weather monitoring</p>
          <h1>Real-time weather conditions across districts</h1>
          <p className="lede">
            Monitor current weather conditions, alerts, and forecasts for all districts
            to assess potential impacts on cholera transmission and response efforts.
          </p>
        </div>
      </motion.section>

      <WeatherAlerts />

      <WeatherImpactAnalysis
        onDistrictClick={(districtKey) => {
          setSelectedDistrict(districtKey)
          setIsModalOpen(true)
        }}
      />

      <DistrictDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        districtKey={selectedDistrict}
        onDistrictChange={(newDistrict) => {
          setSelectedDistrict(newDistrict)
        }}
      />
    </div>
  )
}

export default Weather

