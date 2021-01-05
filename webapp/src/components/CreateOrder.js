import React, { memo, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import Box from '@material-ui/core/Box'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import { useLazyQuery, useMutation } from '@apollo/react-hooks'

import { MANUFACTURER_QUERY, CREATE_ORDER_MUTATION } from '../gql'
import { useSharedState } from '../context/state.context'

import Modal from './Modal'
import ComboBox from './ComboBox'
import OrderInfo from './OrderInfo'

const Wrapper = styled(Box)`
  padding-top: 32px;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
`

const Form = styled.form`
  justify-content: space-between;
  height: 100%;
  width: 100%;
  ${props => props.theme.breakpoints.up('sm')} {
    max-width: 360px;
  }
  display: flex;
  flex-direction: column;
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
    <Box>
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
          label={t('vaccines')}
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
        {loading ? <CircularProgress size={20} color="secondary" /> : t('add')}
      </Button>
    )}
  </Form>
)

const CreateOrder = ({ onClose, orderInfo = {}, isEdit, ...props }) => {
  const { t } = useTranslation('orderForm')
  const [, setState] = useSharedState()
  const [order, setOrder] = useState()
  const [headerTitle, setHeaderTitle] = useState()
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


      // we shouldn't update the state if we will close the modal

      // setOrder(prev => ({ ...prev, id: data.order.id, key: data.order.key }))

      // setState({
      //   message: {
      //     content: (
      //       <a
      //         href={`https://jungle3.bloks.io/transaction/${data.order.trxid}`}
      //         target="_blank"
      //         rel="noopener noreferrer"
      //       >
      //         {t('successMessage')} {data.order.trxid}
      //       </a>
      //     ),
      //     type: 'success'
      //   }
      // })

      onClose({ key: data.order.key, trxId: data.order.trxid })
    } catch (error) {
      console.log('error', error)
    }
  }

  useEffect(() => {
    loadManufacturer()
    setOrder(isEdit ? orderInfo : order)
  }, [loadManufacturer, orderInfo, order, isEdit])

  useEffect(() => {
    if (order && order?.id) {
      const { idata, manufacturer, key } = order
      const lastSixNumber = key.substr(key.length - 6)
      const companyName = isEdit ? idata.manufacturer.name : manufacturer.name

      setHeaderTitle(`${companyName} - ${t('order')} #${lastSixNumber}`)
      setOrder(order)
    }
  }, [order, isEdit, t])

  return (
    <Modal
      {...props}
      onClose={onClose}
      title={!order?.id ? t('title') : headerTitle}
      useSecondaryHeader={!!order?.id}
      useMaxSize
    >
      <Wrapper>
        {!order?.id && (
          <CreateOrderForm
            t={t}
            order={order}
            handleOnChange={handleOnChange}
            handleOnSave={handleOnSave}
            loading={loading}
            manufacturers={manufacturers}
          />
        )}
        {!!order?.id && <OrderInfo order={order} isEdit={isEdit} />}
      </Wrapper>
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
  onClose: PropTypes.func,
  orderInfo: PropTypes.object,
  isEdit: PropTypes.bool
}

export default memo(CreateOrder)
