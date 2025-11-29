import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts'
import useLSTMPredictions from '../hooks/useLSTMPredictions'
import useWeatherData, { UGANDA_LOCATIONS } from '../hooks/useWeatherData'

/**
 * Forecast Component
 * Displays AI-powered forecasts for cholera cases (Random Forest)
 */
function LSTMForecast({ historicalData, region = 'Central', district = null }) {
  const { loading, error, modelAvailable, getForecast } = useLSTMPredictions()
  const [forecastData, setForecastData] = useState(null)
  const [selectedDistrict, setSelectedDistrict] = useState(district || 'kampala')
  
  // Get weather data for the selected district
  const { weatherData } = useWeatherData(selectedDistrict)

  // Prepare forecast data - try even if model not available (API has fallback)
  useEffect(() => {
    if (!historicalData || historicalData.length === 0) {
      // Still try - API can auto-load from dataset
      console.log('No historical data provided, API will auto-load from dataset')
    }

    const fetchForecast = async () => {
      // Extract historical suspected cases (optional - API can auto-load)
      const historicalSuspected = historicalData
        ? historicalData
            .filter((d) => d.sCh !== undefined && d.sCh !== null)
            .map((d) => d.sCh)
            .slice(-60) // Last 60 days for sequence
        : []

      // Get current weather data
      const current = weatherData?.current
      const temperature = current?.temp_c || 25.0
      const humidity = current?.humidity || 70.0
      const precipitation = current?.precip_mm || 0.0

      // Get district region
      const location = UGANDA_LOCATIONS[selectedDistrict]
      const districtRegion = location?.region || region
      const districtName = location?.name

      // Prepare prediction data - API will auto-load historical data if not provided
      const predictionData = {
        date: new Date().toISOString().split('T')[0],
        region: districtRegion,
        district: districtName,
        temperature,
        humidity,
        precipitation,
        // Let API auto-load from dataset if historicalSuspected is empty
        historicalSuspected: historicalSuspected.length >= 7 ? historicalSuspected : [],
      }

      // Get 14-day forecast
      const result = await getForecast(predictionData, 14)
      if (result && result.forecast) {
        setForecastData(result.forecast)
      }
    }

    fetchForecast()
  }, [historicalData, selectedDistrict, weatherData, region, getForecast])

  // Prepare chart data with cumulative totals (divided by 1000 for display)
  const chartData = useMemo(() => {
    if (!forecastData) return []

    let cumulative = 0
    return forecastData.map((item) => {
      const date = new Date(item.date)
      const predictedScaled = item.predicted / 1000  // Divide by 1000 for display
      cumulative += predictedScaled
      return {
        date: item.date,
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        year: date.getFullYear(),
        predicted: Math.round(predictedScaled * 100) / 100,  // Round to 2 decimals
        cumulative: Math.round(cumulative * 100) / 100,
      }
    })
  }, [forecastData])

  if (loading) {
    return (
      <motion.section
        className="chart-card wide"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="section-header">
          <h3>AI-Powered Forecast</h3>
          <p>Machine learning predictions based on historical patterns and weather conditions.</p>
        </div>
        <div className="status-text">Generating forecast...</div>
      </motion.section>
    )
  }

  if (error) {
    return (
      <motion.section
        className="chart-card wide"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="section-header">
          <h3>AI-Powered Forecast</h3>
          <p>Machine learning predictions based on historical patterns and weather conditions.</p>
        </div>
        <div className="status-text error">{error}</div>
      </motion.section>
    )
  }

  if (!forecastData || forecastData.length === 0) {
    return (
      <motion.section
        className="chart-card wide"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="section-header">
          <h3>AI-Powered Forecast</h3>
          <p>Predictions based on historical patterns and weather conditions.</p>
        </div>
        <div className="status-text">
          {error ? (
            <>
              <strong>Error:</strong> {error}
              <br />
              <small style={{ marginTop: '0.5rem', display: 'block' }}>
                Make sure the LSTM API is running: <code>cd cholera-dashboard/api && python lstm_predict.py</code>
              </small>
            </>
          ) : (
            'Loading forecast... The API will automatically load historical data from the dataset.'
          )}
        </div>
      </motion.section>
    )
  }
  
  // Get model type from forecast data
  const modelType = forecastData[0]?.model_type || 'LSTM'

  // Calculate summary statistics (scaled by 1000 for display)
  const totalPredicted = forecastData.reduce((sum, item) => sum + item.predicted, 0) / 1000
  const avgPredicted = totalPredicted / forecastData.length
  const maxPredicted = Math.max(...forecastData.map((item) => item.predicted)) / 1000
  const minPredicted = Math.min(...forecastData.map((item) => item.predicted)) / 1000
  
  // Get prediction year range
  const predictionYear = chartData.length > 0 ? chartData[0].year : new Date().getFullYear()
  const lastYear = chartData.length > 0 ? chartData[chartData.length - 1].year : new Date().getFullYear()
  const yearRange = predictionYear === lastYear ? `${predictionYear}` : `${predictionYear}-${lastYear}`

  return (
    <motion.section
      className="chart-card wide"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="section-header">
        <div>
          <h3>AI-Powered Forecast (14 Days) - {yearRange}</h3>
          <p>
            Random Forest model predictions for suspected cholera cases, incorporating historical trends, weather conditions, and geographical factors.
          </p>
        </div>
        <div className="forecast-badges">
          <div className="forecast-badge">
            <span className="badge-label">Cumulative Total</span>
            <span className="badge-value">{chartData.length > 0 ? Math.round(chartData[chartData.length - 1].cumulative).toLocaleString() : '0'}</span>
          </div>
          <div className="forecast-badge">
            <span className="badge-label">Avg/Day</span>
            <span className="badge-value">{Math.round(avgPredicted).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={360}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="lstmGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" minTickGap={2} />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip
            formatter={(value, name) => {
              return [value.toFixed(2), name]
            }}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                const year = payload[0].payload.year
                return `${label}, ${year}`
              }
              return `Date: ${label}`
            }}
          />
          <Legend />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="predicted"
            name="Daily Predicted Cases (thousands)"
            stroke="#8b5cf6"
            fill="url(#lstmGradient)"
            strokeWidth={2}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cumulative"
            name="Cumulative Total (thousands)"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="forecast-summary-grid" style={{ marginTop: '1.5rem' }}>
        <div className="summary-item">
          <span className="summary-label">Peak Prediction</span>
          <span className="summary-value">{Math.round(maxPredicted).toLocaleString()}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Minimum Prediction</span>
          <span className="summary-value">{Math.round(minPredicted).toLocaleString()}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Average Daily</span>
          <span className="summary-value">{Math.round(avgPredicted).toLocaleString()}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">14-Day Total</span>
          <span className="summary-value">{Math.round(totalPredicted).toLocaleString()}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Cumulative Total</span>
          <span className="summary-value">{chartData.length > 0 ? Math.round(chartData[chartData.length - 1].cumulative).toLocaleString() : '0'}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Prediction Year</span>
          <span className="summary-value">{yearRange}</span>
        </div>
      </div>
    </motion.section>
  )
}

export default LSTMForecast

