import React, { memo } from 'react'
import styled from 'styled-components'

import ListItems from '../components/ListItems'

const Root = styled.div`
  justify-content: center;
  align-items: flex-start;
  display: flex;
  min-height: 100%;
  height: 100%;
`

const Actives = () => {
  const mockList = [
    {
      title: 'Pfizer - Lote #00125393',
      summary: 'Inicializado - 12:03:58 12/04/20',
      caption: 'Exp.11/04/21',
      status: ''
    },
    {
      title: 'Pfizer - Lote #00125385',
      summary: 'Actualizado - 22:56:01 12/03/20',
      caption: 'Exp.11/04/21',
      status: 'Rechazado'
    },
    {
      title: 'Pfizer - Lote #00125225',
      summary: 'Actualizado - 07:12:45 12/03/20',
      caption: 'Exp.15/03/21',
      status: ''
    }
  ]

  return (
    <Root>
      <ListItems items={mockList} />
    </Root>
  )
}

export default memo(Actives)
