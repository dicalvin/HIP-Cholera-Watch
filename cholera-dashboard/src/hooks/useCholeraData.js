import { useEffect, useState } from 'react'
import Papa from 'papaparse'

const DATA_URL = '/cholera_data3.csv'

const numberValue = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const parseRow = (row, idx) => {
  let reportingDate = null
  if (row.reporting_date) {
    const dateStr = String(row.reporting_date).trim()
    // Handle DD/MM/YYYY format (e.g., "29/10/2015")
    const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (ddmmyyyy) {
      const [, day, month, year] = ddmmyyyy
      const dayNum = parseInt(day, 10)
      const monthNum = parseInt(month, 10)
      const yearNum = parseInt(year, 10)
      reportingDate = new Date(yearNum, monthNum - 1, dayNum)
      // Simple validation - just check if date is valid
      if (Number.isNaN(reportingDate.valueOf())) {
        reportingDate = null
      }
    } else {
      // Try standard Date parsing for other formats
      const dateValue = new Date(dateStr)
      if (!Number.isNaN(dateValue.valueOf())) {
        reportingDate = dateValue
      }
    }
  }

  return {
    id: row.Index ?? idx,
    location: row.Location ?? row.District ?? 'Unknown',
    region: row.Region && row.Region.trim() ? row.Region.trim() : 'Unknown',
    district: row.District && row.District.trim() ? row.District.trim() : '',
    sCh: numberValue(row.sCh),
    cCh: numberValue(row.cCh),
    CFR: numberValue(row.CFR),
    deaths: numberValue(row.deaths),
    reportingDate,
    reportingDateRaw: row.reporting_date ?? '',
    TL: row.TL,
    TR: row.TR,
    source: row.source,
    raw: row,
  }
}

function useCholeraData() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [minDate, setMinDate] = useState(null)
  const [maxDate, setMaxDate] = useState(null)

  useEffect(() => {
    Papa.parse(DATA_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log('CSV loaded, total rows:', results.data.length)
        if (!results.data || results.data.length === 0) {
          console.error('CSV is empty')
          setError('Dataset is empty.')
          setLoading(false)
          return
        }
        
        // Show sample of first few rows for debugging
        console.log('First 3 rows sample:', results.data.slice(0, 3).map(r => ({
          reporting_date: r.reporting_date,
          sCh: r.sCh,
          cCh: r.cCh
        })))
        
        const parsedRows = results.data.map(parseRow)
        const validRows = parsedRows.filter((row) => row.reportingDate)
        const invalidRows = parsedRows.filter((row) => !row.reportingDate)
        
        console.log('Valid rows with dates:', validRows.length, 'out of', parsedRows.length)
        if (invalidRows.length > 0) {
          console.log('Sample invalid row:', {
            reporting_date: invalidRows[0]?.reportingDateRaw,
            raw: invalidRows[0]?.raw?.reporting_date
          })
        }

        if (!validRows.length) {
          console.error('No valid dates found. Sample parsed row:', parsedRows[0])
          setError('No dated records were found in the dataset. Check date format.')
          setLoading(false)
          return
        }

        const timestamps = validRows.map((row) => row.reportingDate.valueOf())
        const minDate = new Date(Math.min(...timestamps))
        const maxDate = new Date(Math.max(...timestamps))
        setMinDate(minDate)
        setMaxDate(maxDate)
        
        console.log('Date range:', minDate.toISOString(), 'to', maxDate.toISOString())
        console.log('Setting data with', validRows.length, 'rows')
        console.log('Sample valid row:', {
          date: validRows[0].reportingDate.toISOString(),
          sCh: validRows[0].sCh,
          cCh: validRows[0].cCh
        })
        
        setData(validRows)
        setLoading(false)
      },
      error: (err) => {
        console.error('PapaParse error:', err)
        setError(err.message || 'Failed to load dataset.')
        setLoading(false)
      },
    })
  }, [])

  return { data, loading, error, minDate, maxDate }
}

export default useCholeraData


