import React, { memo, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import Box from '@material-ui/core/Box'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { useLazyQuery, useMutation } from '@apollo/react-hooks'

import { MANUFACTURER_QUERY, CREATE_ORDER_MUTATION } from '../gql'
import { useSharedState } from '../context/state.context'

import Modal from './Modal'
import Loader from './Loader'
import ComboBox from './ComboBox'
import CreateBatch from './CreateBatch'
import { List, ListItem, ListItemText } from '@material-ui/core'

const Wrapper = styled(Box)`
  padding-top: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const Form = styled.form`
  width: 100%;
  ${props => props.theme.breakpoints.up('sm')} {
    max-width: 360px;
  }
  display: flex;
  flex-direction: column;
`

const Row = styled(Box)`
  padding-bottom: ${props => props.theme.spacing(2)}px;
  .MuiFormControl-root {
    width: 100%;
  }
`

const CreateOrder = ({ onClose, ...props }) => {
  const { t } = useTranslation('orderForm')
  const [, setState] = useSharedState()
  const [order, setOrder] = useState()
  const [batches, setBatches] = useState([])
  const [loadManufacturer, { data: { manufacturers } = {} }] = useLazyQuery(
    MANUFACTURER_QUERY
  )
  const [createOrder, { loading }] = useMutation(CREATE_ORDER_MUTATION)

  const handleOnChange = (field, value) => {
    setOrder(prev => ({
      ...(prev || {}),
      [field]: value
    }))
  }

  const handleOnSave = async () => {
    try {
      const { data } = await createOrder({
        variables: {
          ...order,
          manufacturer: order.manufacturer.id,
          product: order.product.id
        }
      })
      setOrder(prev => ({ ...prev, id: data.order.id }))
      setState({
        message: {
          content: (
            <a
              href={`https://jungle3.bloks.io/transaction/${data.order.trxid}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('successMessage')} {data.order.trxid}
            </a>
          ),
          type: 'success'
        }
      })
    } catch (error) {
      console.log('error', error)
    }
  }

  const handleOnNewBatch = batch => {
    setBatches(prev => [...prev, batch])
  }

  useEffect(() => {
    loadManufacturer()
    setOrder({})
  }, [loadManufacturer])

  return (
    <Modal {...props} onClose={onClose} title={t('title')}>
      <Wrapper>
        <Form noValidate autoComplete="off">
          <Row>
            <ComboBox
              id="manufacturer"
              label={t('manufacturer')}
              variant="outlined"
              value={order?.manufacturer || ''}
              onChange={(event, value) => handleOnChange('manufacturer', value)}
              options={manufacturers || []}
              optionLabel="name"
            />
          </Row>
          <Row>
            <ComboBox
              id="product"
              label={t('product')}
              variant="outlined"
              value={order?.product || ''}
              onChange={(event, value) => handleOnChange('product', value)}
              options={order?.manufacturer?.products || []}
              optionLabel="name"
            />
          </Row>
          <Row>
            <TextField
              id="quantity"
              label={t('quantity')}
              variant="outlined"
              value={order?.quantity || ''}
              onChange={event => handleOnChange('quantity', event.target.value)}
            />
          </Row>
          <Row>
            <ComboBox
              id="type"
              label={t('type')}
              variant="outlined"
              value={order?.type || ''}
              onChange={(event, value) => handleOnChange('type', value)}
              options={order?.product?.types || []}
            />
          </Row>
          {!order?.id && (
            <Button variant="contained" color="primary" onClick={handleOnSave}>
              {t('add')}
            </Button>
          )}
          {loading && <Loader />}
        </Form>
        {!!order?.id && (
          <CreateBatch
            onCreated={handleOnNewBatch}
            order={order.id}
            types={order.product.types}
          />
        )}
        <List>
          {batches.map((batch, index) => (
            <ListItem key={`item-${index}`}>
              <ListItemText primary={`Batch ${batch.lot}`} />
            </ListItem>
          ))}
        </List>
      </Wrapper>
    </Modal>
  )
}

CreateOrder.propTypes = {
  onClose: PropTypes.func
}

export default memo(CreateOrder)
