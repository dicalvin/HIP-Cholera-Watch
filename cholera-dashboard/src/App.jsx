import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import './App.css'
import Layout from './components/Layout'
import Overview from './pages/Overview'
import Analytics from './pages/Analytics'
import ResponseInsights from './pages/ResponseInsights'
import EarlyWarning from './pages/EarlyWarning'
import ResourcePlanning from './pages/ResourcePlanning'
import Weather from './pages/Weather'
import useCholeraData from './hooks/useCholeraData'
import {
  aggregateSummary,
  buildCfrTrend,
  buildDistrictAggregates,
  buildInsights,
  buildRegionDistribution,
  buildSChVsCCh,
  buildConfirmedPositivitySeries,
  buildMonthlySuspectedSeries,
  buildSeasonalityProfile,
  buildMetricBreakdowns,
  buildResponseInsights,
  buildEarlyWarningInsights,
  buildResourcePlanningInsights,
  filterByDateRange,
  formatForInput,
} from './utils/dataTransforms'

const ANALYTICS_START = new Date(2011, 0, 1)
const ANALYTICS_END = new Date(2024, 11, 31)

function App() {
  const { data, loading, error, minDate, maxDate } = useCholeraData()
  const [geoData, setGeoData] = useState(null)
  const [geoError, setGeoError] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  const constrainedBounds = useMemo(() => {
    const minBound = minDate
      ? new Date(Math.max(minDate.valueOf(), ANALYTICS_START.valueOf()))
      : ANALYTICS_START
    const maxBound = maxDate
      ? new Date(Math.min(maxDate.valueOf(), ANALYTICS_END.valueOf()))
      : ANALYTICS_END
    return { minBound, maxBound }
  }, [minDate, maxDate])

  const defaultRange = useMemo(
    () => ({
      start: formatForInput(constrainedBounds.minBound),
      end: formatForInput(constrainedBounds.maxBound),
    }),
    [constrainedBounds],
  )

  const effectiveDateRange = useMemo(() => {
    const parsedStart = dateRange.start ? new Date(dateRange.start) : null
    const parsedEnd = dateRange.end ? new Date(dateRange.end) : null
    const start = parsedStart && !Number.isNaN(parsedStart.valueOf())
      ? parsedStart
      : new Date(defaultRange.start)
    const end = parsedEnd && !Number.isNaN(parsedEnd.valueOf())
      ? parsedEnd
      : new Date(defaultRange.end)
    const clampedStart = new Date(
      Math.max(start.valueOf(), constrainedBounds.minBound.valueOf()),
    )
    const clampedEnd = new Date(
      Math.min(end.valueOf(), constrainedBounds.maxBound.valueOf()),
    )
    return {
      start: formatForInput(clampedStart),
      end: formatForInput(clampedEnd),
    }
  }, [dateRange, defaultRange, constrainedBounds])

  useEffect(() => {
    fetch('/ug.json')
      .then((res) => res.json())
      .then(setGeoData)
      .catch(() => setGeoError('Unable to load map boundaries.'))
  }, [])

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) {
      console.log('No data available to filter')
      return []
    }
    const filtered = filterByDateRange(data, effectiveDateRange)
    console.log('Filtered data:', {
      totalData: data.length,
      filteredCount: filtered.length,
      dateRange: effectiveDateRange,
      sampleDate: data[0]?.reportingDate?.toISOString(),
    })
    if (filtered.length === 0 && data.length > 0) {
      console.warn('All data filtered out! Check date range:', {
        effectiveRange: effectiveDateRange,
        firstDataDate: data[0]?.reportingDate?.toISOString(),
        lastDataDate: data[data.length - 1]?.reportingDate?.toISOString(),
      })
    }
    return filtered
  }, [data, effectiveDateRange])

  const memoizedData = useMemo(() => {
    const summary = aggregateSummary(filteredData)
    const regionDistribution = buildRegionDistribution(filteredData)
    const scatterData = buildSChVsCCh(filteredData)
    const cfrTrend = buildCfrTrend(filteredData)
    const confirmedPositivity = buildConfirmedPositivitySeries(filteredData)
    const monthlySuspected = buildMonthlySuspectedSeries(filteredData)
    const seasonality = buildSeasonalityProfile(filteredData)
    const insights = buildInsights(
      filteredData,
      regionDistribution,
      cfrTrend,
      summary,
    )
    const districtStats = buildDistrictAggregates(filteredData)
    const breakdowns = buildMetricBreakdowns(filteredData)
    const responseInsights = buildResponseInsights(filteredData, breakdowns)
    const earlyWarning = buildEarlyWarningInsights(filteredData)
    const resourcePlanning = buildResourcePlanningInsights(
      filteredData,
      districtStats,
      breakdowns,
    )

    return {
      summary,
      regionDistribution,
      scatterData,
      cfrTrend,
      insights,
      districtStats,
      confirmedPositivity,
      monthlySuspected,
      seasonality,
      breakdowns,
      responseInsights,
      earlyWarning,
      resourcePlanning,
    }
  }, [filteredData])

  const dateBounds = useMemo(
    () => ({
      min: formatForInput(constrainedBounds.minBound),
      max: formatForInput(constrainedBounds.maxBound),
    }),
    [constrainedBounds],
  )

  return (
    <BrowserRouter>
      <Layout loading={loading} summary={memoizedData.summary}>
        <Routes>
          <Route
            path="/"
            element={
              <Overview
                loading={loading}
                error={error}
                insights={memoizedData.insights}
                summary={memoizedData.summary}
                districtStats={memoizedData.districtStats}
                geoData={geoData}
                geoError={geoError}
                dateRange={effectiveDateRange}
                breakdowns={memoizedData.breakdowns}
              />
            }
          />
          <Route
            path="/analytics"
            element={
              <Analytics
                loading={loading}
                error={error}
                dateRange={effectiveDateRange}
                onDateChange={setDateRange}
                dateBounds={dateBounds}
                summary={memoizedData.summary}
                scatterData={memoizedData.scatterData}
                regionDistribution={memoizedData.regionDistribution}
                cfrTrend={memoizedData.cfrTrend}
                confirmedPositivity={memoizedData.confirmedPositivity}
                monthlySuspected={memoizedData.monthlySuspected}
                seasonality={memoizedData.seasonality}
              />
            }
          />
                 <Route
                   path="/response-insights"
                   element={
                     <ResponseInsights
                       loading={loading}
                       error={error}
                       spreadInsights={memoizedData.responseInsights}
                       filteredData={filteredData}
                       summary={memoizedData.summary}
                     />
                   }
                 />
                 <Route
                   path="/early-warning"
                   element={
                     <EarlyWarning
                       loading={loading}
                       error={error}
                       earlyWarning={memoizedData.earlyWarning}
                       filteredData={filteredData}
                       summary={memoizedData.summary}
                     />
                   }
                 />
                 <Route
                   path="/resource-planning"
                   element={
                     <ResourcePlanning
                       loading={loading}
                       error={error}
                       resourcePlanning={memoizedData.resourcePlanning}
                       filteredData={filteredData}
                       summary={memoizedData.summary}
                     />
                   }
                 />
                 <Route
                   path="/weather"
                   element={<Weather />}
                 />
               </Routes>
             </Layout>
           </BrowserRouter>
  )
}

export default App
