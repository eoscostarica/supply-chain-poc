import React, { memo, useCallback } from 'react'
import PropTypes from 'prop-types'
import {
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  BarChart,
  Bar
} from 'recharts'

import { scaleOrdinal } from 'd3-scale'
import styled from 'styled-components'

const ResponsiveContainerWrapper = styled(ResponsiveContainer)`
  .recharts-tooltip {
    font-family: Roboto;
    font-style: normal;
    font-weight: 500;
    color: #fff;
    background-color: #616161;
    border-radius: ${props => props.theme.spacing(1)}px;
    padding: ${props => props.theme.spacing(2)}px;
  }
  .recharts-tooltip-label {
    margin: 0px;
  }
  .recharts-tooltip-list {
    margin: 0;
    padding: 0;
  }
  .recharts-tooltip-list-item {
  }
`

const Chart = ({ series, data }) => {
  const color = useCallback(
    scaleOrdinal()
      .domain([...Array(series.length).keys()])
      .range([
        '#00C853',
        '#1E88E5',
        '#c5639c',
        '#faff16',
        '#20c773',
        '#8b696d',
        '#78762d',
        '#e154c6',
        '#40835f',
        '#d73656',
        '#1afd5c',
        '#c4f546',
        '#3d88d8',
        '#d47270',
        '#e8ac48',
        '#cf7c97',
        '#cebb11',
        '#e78139',
        '#ff7463',
        '#bea1fd',
        '#d73656'
      ]),
    [series]
  )

  return (
    <ResponsiveContainerWrapper width="100%" aspect={2.5}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="1 1" stroke="#E4E7EB" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip separator=" - " />
        <Legend />
        {series.map((line, i) => (
          <Bar key={`line-${line}`} dataKey={line} fill={color(i)} />
        ))}
      </BarChart>
    </ResponsiveContainerWrapper>
  )
}

Chart.propTypes = {
  series: PropTypes.any,
  data: PropTypes.any
}

export default memo(Chart)
