import React, { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'
import { useLazyQuery, useMutation } from '@apollo/react-hooks'

import { useSharedState } from '../context/state.context'
import MasterDetail from '../layouts/MasterDetail'
import Loader from '../components/Loader'
import InfoBox from '../components/InfoBox'
import ListItems from '../components/ListItems'
import ManufacturerInfo from '../components/ManufacturerInfo'
import Modal from '../components/Modal'
import ManufacturerForm from '../components/ManufacturerForm'
import ProductForm from '../components/ProductForm'
import {
  MANUFACTURERS_QUERY,
  MANUFACTURER_QUERY,
  MANUFACTURER_UPDATE_MUTATION,
  MANUFACTURER_INSERT_MUTATION,
  PRODUCT_INSERT_MUTATION,
  PRODUCT_UPDATE_MUTATION
} from '../gql'

const Manufacturers = () => {
  const { t } = useTranslation('manufacturers')
  const [, setState] = useSharedState()
  const [selectedId, setSelectedId] = useState()
  const [currentModal, setCurrentModal] = useState()
  const [
    getManufacturers,
    { loading: loadingManufacturers, data: { manufacturers } = {} }
  ] = useLazyQuery(MANUFACTURERS_QUERY, {
    fetchPolicy: 'network-only'
  })
  const [
    getManufacturer,
    { loading: loadingManufacturer, data: { manufacturer } = {} }
  ] = useLazyQuery(MANUFACTURER_QUERY, {
    fetchPolicy: 'network-only'
  })
  const [addManufacturer, { loading: addingManufacturer }] = useMutation(
    MANUFACTURER_INSERT_MUTATION
  )
  const [updateManufacturer, { loading: updatingManufacturer }] = useMutation(
    MANUFACTURER_UPDATE_MUTATION
  )
  const [addProduct, { loading: addingProduct }] = useMutation(
    PRODUCT_INSERT_MUTATION
  )
  const [updateProduct, { loading: updatingProduct }] = useMutation(
    PRODUCT_UPDATE_MUTATION
  )

  const handleOnClick = item => {
    setSelectedId(item.id)
  }

  const handleOnCloseDetailView = () => {
    setSelectedId(null)
  }

  const handleOnSubmit = async ({ id, name, data }) => {
    if (id) {
      await handleUpdateManufacturer(id, name, data)
    } else {
      await handleAddManufacturer(name, data)
    }

    setCurrentModal(null)
  }

  const handleAddManufacturer = async (name, data) => {
    const { data: response } = await addManufacturer({
      variables: { name, data }
    })
    setState({
      message: {
        content: t('successAdd'),
        type: 'success'
      }
    })
    getManufacturers()
    setSelectedId(response.manufacturer.id)
  }

  const handleUpdateManufacturer = async (id, name, data) => {
    const { data: response } = await updateManufacturer({
      variables: { id, name, data }
    })
    getManufacturer({ variables: { id: response.manufacturer.id } })
    setState({
      message: {
        content: t('successUpdate'),
        type: 'success'
      }
    })
  }

  const handleOnSubmitProduct = async ({ id, name, types }) => {
    if (id) {
      await handleUpdateProduct(id, name, types)
    } else {
      await handleAddProduct(name, types)
    }

    setCurrentModal(null)
  }

  const handleAddProduct = async (name, types) => {
    await addProduct({
      variables: { name, types, manufacturerId: manufacturer.id }
    })
    getManufacturer({ variables: { id: manufacturer.id } })
    setState({
      message: {
        content: t('successAddProduct'),
        type: 'success'
      }
    })
  }

  const handleUpdateProduct = async (id, name, types) => {
    await updateProduct({
      variables: { id, name, types }
    })
    getManufacturer({ variables: { id: manufacturer.id } })
    setState({
      message: {
        content: t('successUpdateProduct'),
        type: 'success'
      }
    })
  }

  const renderModalContent = modal => {
    switch (modal.type) {
      case 'add':
        return (
          <ManufacturerForm
            onSubmit={handleOnSubmit}
            loading={addingManufacturer}
          />
        )
      case 'edit':
        return (
          <ManufacturerForm
            data={manufacturer}
            onSubmit={handleOnSubmit}
            loading={updatingManufacturer}
          />
        )
      case 'addProduct':
        return (
          <ProductForm
            onSubmit={handleOnSubmitProduct}
            loading={addingProduct}
          />
        )
      case 'editProduct':
        return (
          <ProductForm
            data={modal.payload}
            onSubmit={handleOnSubmitProduct}
            loading={updatingProduct}
          />
        )

      default:
        return <></>
    }
  }

  useEffect(() => {
    getManufacturers()
  }, [getManufacturers])

  useEffect(() => {
    if (!selectedId) {
      return
    }

    getManufacturer({ variables: { id: selectedId } })
  }, [selectedId, getManufacturer])

  return (
    <MasterDetail
      onCloseDetailView={handleOnCloseDetailView}
      showDetailView={!!selectedId}
      detailViewTitle={manufacturer?.name}
      detailViewContent={
        <ManufacturerInfo
          data={manufacturer}
          onClickAction={setCurrentModal}
          loading={loadingManufacturer}
        />
      }
      actionButton={
        <Fab
          color="secondary"
          aria-label="add"
          onClick={() => setCurrentModal({ type: 'add' })}
        >
          <AddIcon />
        </Fab>
      }
    >
      {loadingManufacturers && <Loader />}
      {!loadingManufacturers && !manufacturers?.length && (
        <InfoBox text={t('emptyMessage')} />
      )}
      {!loadingManufacturers && manufacturers?.length && (
        <ListItems
          items={manufacturers.map(item => ({ id: item.id, title: item.name }))}
          handleOnClick={handleOnClick}
          selected={selectedId}
        />
      )}
      {currentModal && (
        <Modal
          open={!!currentModal}
          onClose={() => setCurrentModal(null)}
          title={t(`${currentModal.type}Title`)}
        >
          {renderModalContent(currentModal)}
        </Modal>
      )}
    </MasterDetail>
  )
}

export default memo(Manufacturers)
