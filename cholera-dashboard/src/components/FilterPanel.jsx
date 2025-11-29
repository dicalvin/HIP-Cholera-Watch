import { motion } from 'framer-motion'

const toInputValue = (date) =>
  date ? date.toISOString().split('T')[0] : ''

const safeDate = (value) => {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.valueOf()) ? null : parsed
}

function FilterPanel({ dateRange, onDateChange, dateBounds = {} }) {
  const maxDate = safeDate(dateBounds.max)
  const minDate = safeDate(dateBounds.min)

  const handlePreset = (preset) => {
    if (!maxDate) return
    let start = new Date(maxDate)
    let end = new Date(maxDate)

    switch (preset) {
      case '30d':
        start.setDate(start.getDate() - 29)
        break
      case '90d':
        start.setDate(start.getDate() - 89)
        break
      case 'ytd':
        start = new Date(maxDate.getFullYear(), 0, 1)
        break
      case 'all':
        if (minDate) start = new Date(minDate)
        if (maxDate) end = new Date(maxDate)
        break
      default:
        break
    }

    onDateChange({
      start: toInputValue(start),
      end: toInputValue(end),
    })
  }

  return (
    <motion.section
      className="filter-panel"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div>
        <p className="eyebrow">Filters</p>
        <h2>Choose a reporting window</h2>
        <p className="lede">
          Adjust the window or tap a quick preset for a smoother calendar
          experience.
        </p>
        <div className="filter-quick">
          <button type="button" onClick={() => handlePreset('30d')}>
            Last 30 days
          </button>
          <button type="button" onClick={() => handlePreset('90d')}>
            Last 90 days
          </button>
          <button type="button" onClick={() => handlePreset('ytd')}>
            Year to date
          </button>
          <button type="button" onClick={() => handlePreset('all')}>
            All data
          </button>
        </div>
      </div>
      <div className="filters">
        <label>
          Start date
          <input
            type="date"
            value={dateRange.start}
            min={dateBounds.min || undefined}
            max={dateRange.end || dateBounds.max || undefined}
            onChange={(event) =>
              onDateChange((prev) => ({ ...prev, start: event.target.value }))
            }
          />
        </label>
        <label>
          End date
          <input
            type="date"
            value={dateRange.end}
            min={dateRange.start || dateBounds.min || undefined}
            max={dateBounds.max || undefined}
            onChange={(event) =>
              onDateChange((prev) => ({ ...prev, end: event.target.value }))
            }
          />
        </label>
      </div>
    </motion.section>
  )
}

export default FilterPanel


