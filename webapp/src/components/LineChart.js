import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer
} from 'recharts'

const data = [
  {
    name: '1',
    uv: -60
  },
  {
    name: '2',
    uv: -68
  },
  {
    name: '3',
    uv: -69
  },
  {
    name: '4',
    uv: -70
  },
  {
    name: '5',
    uv: -71
  },
  {
    name: '6',
    uv: -72
  },
  {
    name: '7',
    uv: -70
  },
  {
    name: '8',
    uv: -70
  },
  {
    name: '9',
    uv: -71
  },
  {
    name: '10',
    uv: -70
  },
  {
    name: '11',
    uv: -73
  },
  {
    name: 'hoy',
    uv: -53
  }
]

const LineChartComponent = () => {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 20,
            right: 50,
            left: 20,
            bottom: 5
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <ReferenceLine y={-70} stroke="red" />
          <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default LineChartComponent
