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
import {
  MANUFACTURERS_QUERY,
  MANUFACTURER_QUERY,
  MANUFACTURER_UPDATE_MUTATION,
  MANUFACTURER_INSERT_MUTATION
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

  const renderModalContent = modal => {
    switch (modal) {
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
        return <p>in progress</p>

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
          onClick={() => setCurrentModal('add')}
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
      <Modal
        open={!!currentModal}
        onClose={() => setCurrentModal(null)}
        title={t(`${currentModal}Title`)}
      >
        {renderModalContent(currentModal)}
      </Modal>
    </MasterDetail>
  )
}

export default memo(Manufacturers)
