import React, { useState } from 'react'
import { PieChart, Pie, Sector } from 'recharts'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { useTheme } from '@material-ui/core/styles'

const data = [
  { name: 'vaccine', value: 400, fill: '#444' },
  { name: 'aplicadas', value: 24859, fill: '#147595' },
  { name: 'proceso', value: 5511, fill: '#2BBCDF' },
  { name: 'stock', value: 56980, fill: '#E0E0E0' }
]

const renderActiveShape = props => {
  const RADIAN = Math.PI / 180
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    percent
  } = props
  const sin = Math.sin(-RADIAN * midAngle)
  const cos = Math.cos(-RADIAN * midAngle)
  const sx = cx + (outerRadius + 5) * cos
  const sy = cy + (outerRadius + 5) * sin
  const mx = cx + (outerRadius + 20) * cos
  const my = cy + (outerRadius + 20) * sin
  const ex = mx + (cos >= 0 ? 1 : -1) * 22
  const ey = my
  const textAnchor = cos >= 0 ? 'start' : 'end'

  return (
    <g>
      <text x={cx} y={cy - 5} dy={8} textAnchor="middle" fill="#000000">
        87,750
      </text>
      <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="#000000">
        vacunas
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#333"
      >{`${(percent * 100).toFixed(2)}%`}</text>
    </g>
  )
}

export default () => {
  const theme = useTheme()
  const matches = useMediaQuery(theme.breakpoints.up('sm'))
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <PieChart width={matches ? 400 : 360} height={250}>
      <Pie
        activeIndex={activeIndex}
        activeShape={renderActiveShape}
        data={data}
        cx={matches ? 200 : 145}
        cy={120}
        innerRadius={matches ? 60 : 30}
        outerRadius={matches ? 80 : 60}
        fill="#8884d8"
        dataKey="value"
        onMouseEnter={(data, index) => setActiveIndex(index)}
      />
    </PieChart>
  )
}
