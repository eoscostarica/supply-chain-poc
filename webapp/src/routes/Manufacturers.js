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
  MANUFACTURER_QUERY,
  MANUFACTURER_BY_ID_QUERY,
  MANUFACTURER_UPDATE_MUTATION
} from '../gql'

const Manufacturers = () => {
  const { t } = useTranslation('manufacturers')
  const [, setState] = useSharedState()
  const [current, setCurrent] = useState()
  const [currentModal, setCurrentModal] = useState()
  const [
    getManufacturers,
    { loading: loadingManufacturers, data: { manufacturers } = {} }
  ] = useLazyQuery(MANUFACTURER_QUERY)
  const [
    getManufacturer,
    { loading: loadingManufacturer, data: { manufacturer } = {} }
  ] = useLazyQuery(MANUFACTURER_BY_ID_QUERY, {
    fetchPolicy: 'network-only'
  })
  const [updateManufacturer, { loading: updatingManufacturer }] = useMutation(
    MANUFACTURER_UPDATE_MUTATION
  )

  const handleOnClick = item => {
    setCurrent(item)
  }

  const handleOnCloseDetailView = () => {
    setCurrent(null)
  }

  const handleOnSubmit = async ({ id, name, data }) => {
    if (id) {
      await updateManufacturer({ variables: { id, name, data } })
      getManufacturer({ variables: { id } })
      setState({
        message: {
          content: t('successUpdate'),
          type: 'success'
        }
      })
    }

    setCurrentModal(null)
  }

  const renderModalContent = modal => {
    switch (modal) {
      case 'add':
        return <ManufacturerForm onSubmit={handleOnSubmit} />
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
    if (!current?.id) {
      return
    }

    getManufacturer({ variables: { id: current.id } })
  }, [current, getManufacturer])

  return (
    <MasterDetail
      onCloseDetailView={handleOnCloseDetailView}
      showDetailView={!!current}
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
          selected={current?.id}
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
