import React, { memo, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import Box from '@material-ui/core/Box'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import { useLazyQuery, useMutation } from '@apollo/react-hooks'

import {
  MANUFACTURER_QUERY,
  CREATE_ORDER_MUTATION,
  ASSETS_BY_ORDER_ID
} from '../gql'
import { useSharedState } from '../context/state.context'

import Modal from './Modal'
import ComboBox from './ComboBox'
import CreateBatch from './CreateBatch'
import AccordionTreeView from './AccordionTreeView'

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
const StyledMasterBox = styled(Box)`
  border-bottom: ${props => `1px solid ${props.theme.palette.divider}`};
`

const MasterLegend = styled(Typography)`
  font-size: 16px;
  line-height: 28px;
  letter-spacing: 0.44px;
  color: #000000;
  margin-bottom: ${props => props.theme.spacing(2)}px;
`

const MasterLabel = styled(Typography)`
  font-size: 10px;
  line-height: 16px;
  display: flex;
  align-items: center;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #000000;
`

const MasterText = styled(Typography)`
  font-size: 16px;
  line-height: 28px;
  display: flex;
  align-items: center;
  letter-spacing: 0.44px;
  color: #000000;
`

const OrderMaster = ({ headerDataInfo, isEdit }) => {
  const { idata, manufacturer, product, vaccines } = headerDataInfo
  const companyName = isEdit ? idata.manufacturer.name : manufacturer.name
  const productName = isEdit ? idata.product.name : product.name
  const vaccinesAmount = isEdit ? idata.product.vaccines : vaccines
  const newDate = new Date(headerDataInfo.updated_at)
  const dateFormat = newDate.toLocaleString({
    hour: 'numeric',
    hour12: true
  })

  return (
    <StyledMasterBox>
      <MasterLegend>
        Añada datos de lotes o de control relacionados a la orden.
      </MasterLegend>
      <Row>
        <MasterLabel>Fabricante</MasterLabel>
        <MasterText>{companyName}</MasterText>
      </Row>
      <Row>
        <MasterLabel>Producto</MasterLabel>
        <MasterText>{productName}</MasterText>
      </Row>
      <Row>
        <MasterLabel>Cantidad de dosis</MasterLabel>
        <MasterText>{vaccinesAmount}</MasterText>
      </Row>
      <Row>
        <MasterLabel>fecha de registro</MasterLabel>
        <MasterText>{dateFormat}</MasterText>
      </Row>
    </StyledMasterBox>
  )
}

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
  const [loadItemAssets, { data: { asset } = {} }] = useLazyQuery(
    ASSETS_BY_ORDER_ID
  )
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

      setOrder(prev => ({ ...prev, id: data.order.id, key: data.order.key }))
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

  useEffect(() => {
    loadManufacturer()
    setOrder(isEdit ? orderInfo : order)
  }, [loadManufacturer, orderInfo, order])

  useEffect(() => {
    if (order && order?.id) {
      const { idata, manufacturer, key } = order
      const lastSixNumber = key.substr(key.length - 6)
      const companyName = isEdit ? idata.manufacturer.name : manufacturer.name

      loadItemAssets({
        variables: { orderId: order.id }
      })
      setHeaderTitle(`${companyName} - Orden #${lastSixNumber}`)
      setOrder(order)
    }
  }, [order, isEdit, loadItemAssets])

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
        {!!order?.id && <OrderMaster headerDataInfo={order} isEdit={isEdit} />}
        {!!asset && (
          <AccordionTreeView
            data={asset[0]?.assets.length ? asset[0].assets : []}
          />
        )}
        {!!order?.id && <CreateBatch order={order?.id} />}
      </Wrapper>
    </Modal>
  )
}

OrderMaster.propTypes = {
  headerDataInfo: PropTypes.object,
  isEdit: PropTypes.bool
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
