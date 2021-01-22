import React, { memo, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import Box from '@material-ui/core/Box'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import { Typography } from '@material-ui/core'
import { useLazyQuery, useMutation } from '@apollo/react-hooks'

import { MANUFACTURERS_QUERY, CREATE_ORDER_MUTATION } from '../gql'

import Modal from './Modal'
import ComboBox from './ComboBox'

const Form = styled.form`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding-top: ${props => props.theme.spacing(2)}px;
  ${props => props.theme.breakpoints.up('sm')} {
    max-width: 360px;
  }
  & button {
    max-width: 122px;
  }
`

const Row = styled(Box)`
  padding-bottom: ${props => props.theme.spacing(2)}px;
  width: 100%;
  .MuiFormControl-root {
    width: 100%;
  }
`

const CreateOrderForm = ({
  t,
  order,
  handleOnChange,
  handleOnSave,
  loading,
  manufacturers
}) => (
  <Form noValidate autoComplete="off">
    <Box width="100%">
      <Row>
        <ComboBox
          id="manufacturer"
          label={t('manufacturer')}
          variant="filled"
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
          variant="filled"
          value={order?.product || ''}
          onChange={(event, value) => handleOnChange('product', value)}
          options={order?.manufacturer?.products || []}
          optionLabel="name"
        />
      </Row>
      <Row>
        <ComboBox
          id="type"
          label={t('type')}
          variant="filled"
          value={order?.type || ''}
          onChange={(event, value) => handleOnChange('type', value)}
          options={order?.product?.types || []}
        />
      </Row>
      <Row>
        <TextField
          id="vaccines"
          label={t('doseAmount')}
          variant="filled"
          value={order?.vaccines || ''}
          onChange={event => handleOnChange('vaccines', event.target.value)}
        />
      </Row>
    </Box>

    {!order?.id && (
      <Button
        variant="contained"
        color="primary"
        onClick={handleOnSave}
        disabled={loading}
      >
        {loading ? (
          <CircularProgress size={20} color="secondary" />
        ) : (
          t('complete')
        )}
      </Button>
    )}
  </Form>
)

const CreateOrder = ({ onClose, ...props }) => {
  const { t } = useTranslation('orderForm')
  const [order, setOrder] = useState()
  const [loadManufacturer, { data: { manufacturers } = {} }] = useLazyQuery(
    MANUFACTURERS_QUERY
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

      onClose({
        id: data.order.id,
        key: data.order.key,
        trxid: data.order.trxid,
        message: `${t('successMessage')} ${data.order.trxid}`
      })
    } catch (error) {
      console.log('error', error)
    }
  }

  useEffect(() => {
    loadManufacturer()
  }, [loadManufacturer, order])

  return (
    <Modal
      {...props}
      onClose={onClose}
      title={t('title')}
      useSecondaryHeader={!!order?.id}
    >
      <Typography>{t('subtitle')}</Typography>
      <CreateOrderForm
        t={t}
        order={order}
        handleOnChange={handleOnChange}
        handleOnSave={handleOnSave}
        loading={loading}
        manufacturers={manufacturers}
      />
    </Modal>
  )
}

CreateOrderForm.propTypes = {
  t: PropTypes.any,
  order: PropTypes.object,
  handleOnChange: PropTypes.func,
  handleOnSave: PropTypes.func,
  loading: PropTypes.bool,
  manufacturers: PropTypes.array
}

CreateOrder.propTypes = {
  onClose: PropTypes.func
}

export default memo(CreateOrder)
