import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts'

const data = [
  {
    date: '2000-01',
    pv: 400
  },
  {
    date: '2000-02',
    pv: 398
  },
  {
    date: '2000-03',
    pv: 800
  },
  {
    date: '2000-04',
    pv: 908
  },
  {
    date: '2000-05',
    pv: 800
  },
  {
    date: '2000-06',
    pv: 800
  },
  {
    date: '2000-07',
    pv: 300
  },
  {
    date: '2000-08',
    pv: 400
  },
  {
    date: '2000-09',
    pv: 398
  },
  {
    date: '2000-10',
    pv: 800
  },
  {
    date: '2000-11',
    pv: 908
  },
  {
    date: '2000-12',
    pv: 800
  }
]

const monthTickFormatter = tick => {
  const date = new Date(tick)

  return date.getMonth() + 1
}

const BarChartComponent = () => {
  return (
    <div style={{ width: '100%', height: 390 }}>
      <ResponsiveContainer>
        <BarChart
          width={500}
          height={390}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
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
          <Bar dataKey="pv" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default BarChartComponent
