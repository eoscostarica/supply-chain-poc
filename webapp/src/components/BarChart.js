import React from 'react'
import PropTypes from 'prop-types'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts'

const monthTickFormatter = tick => {
  const date = new Date(tick)
  const currentDate = new Date()

  if (date.toLocaleDateString() === currentDate.toLocaleDateString())
    return 'Hoy'

  return date.getDate()
}

const BarChartComponent = ({ data, dataKey }) => (
  <div style={{ width: '100%', height: 370 }}>
    <ResponsiveContainer>
      <BarChart
        width={500}
        height={370}
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5
        }}
      >
        <XAxis dataKey="date" tickFormatter={monthTickFormatter} />
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          interval={0}
          height={1}
          scale="band"
          xAxisId="quarter"
        />
        <YAxis />
        <Bar
          dataKey={dataKey}
          fill="#0E6EA5"
          barSize={5.8}
          label={{ position: 'top' }}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
)

BarChartComponent.propTypes = {
  data: PropTypes.array,
  dataKey: PropTypes.string
}

export default BarChartComponent
