import { motion } from 'framer-motion'
import FilterPanel from '../components/FilterPanel'
import SummaryCards from '../components/SummaryCards'
import SuspectedVsConfirmedChart from '../components/charts/SuspectedVsConfirmedChart'
import RegionDistributionChart from '../components/charts/RegionDistributionChart'
import CfrTrendChart from '../components/charts/CfrTrendChart'
import ConfirmedPositivityTrend from '../components/charts/ConfirmedPositivityTrend'
import MonthlySuspectedChart from '../components/charts/MonthlySuspectedChart'
import SeasonalityChart from '../components/charts/SeasonalityChart'
import MultiLocationForecast from '../components/MultiLocationForecast'

function Analytics({
  loading,
  error,
  dateRange,
  onDateChange,
  dateBounds,
  summary,
  scatterData,
  regionDistribution,
  cfrTrend,
  confirmedPositivity,
  monthlySuspected,
  seasonality,
}) {
  return (
    <div className="page">
      <motion.section
        className="hero secondary"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <div>
          <p className="eyebrow">Deep dive</p>
          <h1>Interactive analytics & filters</h1>
          <p className="lede">
            Compare interventions and outbreaks by focusing on any custom date
            range. Charts and the map update automatically to reflect your
            selections.
          </p>
        </div>
      </motion.section>

      <FilterPanel
        dateRange={dateRange}
        onDateChange={onDateChange}
        dateBounds={dateBounds}
      />

      {loading && <p className="status-text">Loading dataset…</p>}
      {error && <p className="status-text error">{error}</p>}

      {!loading && !error && (
        <>
          <SummaryCards summary={summary} />
          <section className="grid chart-grid">
            <ConfirmedPositivityTrend series={confirmedPositivity} />
            <MonthlySuspectedChart data={monthlySuspected} />
            <SeasonalityChart data={seasonality} />
            <SuspectedVsConfirmedChart data={scatterData} />
            <RegionDistributionChart data={regionDistribution} />
            <CfrTrendChart series={cfrTrend} />
          </section>
          <MultiLocationForecast />
          <section className="grid chart-grid">
          </section>
        </>
      )}
    </div>
  )
}

export default Analytics


