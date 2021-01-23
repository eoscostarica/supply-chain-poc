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
import OrganizationInfo from '../components/OrganizationInfo'
import Modal from '../components/Modal'
import OrganizationForm from '../components/OrganizationForm'
import {
  GET_ORGANIZATIONS,
  GET_ORGANIZATION_BY_ID,
  MUTATION_INSERT_ORGANTIZATION,
  MUTATION_UPDATE_ORGANIZATION
} from '../gql'

const Organization = () => {
  const { t } = useTranslation('organization')
  const [, setState] = useSharedState()
  const [current, setCurrent] = useState()
  const [currentModal, setCurrentModal] = useState()
  const [
    getOrganizations,
    { loading: loadingOrganizations, data: { organizations } = {} }
  ] = useLazyQuery(GET_ORGANIZATIONS, {
    fetchPolicy: 'network-only'
  })
  const [
    getOrganization,
    { loading: loadingOrganization, data: { organization } = {} }
  ] = useLazyQuery(GET_ORGANIZATION_BY_ID, {
    fetchPolicy: 'network-only'
  })
  const [updateOrganization, { loading: updatingOrganization }] = useMutation(
    MUTATION_UPDATE_ORGANIZATION
  )
  const [createOrganization, { loading: creatingOrganization }] = useMutation(
    MUTATION_INSERT_ORGANTIZATION
  )

  const handleOnClick = item => {
    setCurrent(item)
  }

  const handleOnCloseDetailView = () => {
    setCurrent(null)
  }

  const handleOnSubmit = async organizationData => {
    if (organizationData.id) {
      const { id, name, data = {} } = organizationData

      await updateOrganization({ variables: { id, name, data } })
      getOrganization({ variables: { id } })
      setState({
        message: {
          content: t('successUpdate'),
          type: 'success'
        }
      })
    } else {
      const {
        data: { insert_organization_one: result }
      } = await createOrganization({
        variables: { object: organizationData }
      })

      await getOrganizations()
      setCurrent({ id: result?.id })
      setState({
        message: {
          content: t('successCreate'),
          type: 'success'
        }
      })
    }

    setCurrentModal(null)
  }

  const renderModalContent = modal => {
    switch (modal) {
      case 'add':
        return (
          <OrganizationForm
            onSubmit={handleOnSubmit}
            loading={creatingOrganization}
          />
        )
      case 'edit':
        return (
          <OrganizationForm
            data={organization && organization[0]}
            onSubmit={handleOnSubmit}
            loading={updatingOrganization}
          />
        )
      case 'addProduct':
        return <p>in progress</p>

      default:
        return <></>
    }
  }

  useEffect(() => {
    getOrganizations()
  }, [getOrganizations])

  useEffect(() => {
    if (!current?.id) {
      return
    }

    getOrganization({ variables: { id: current.id } })
  }, [current, getOrganization])

  return (
    <MasterDetail
      onCloseDetailView={handleOnCloseDetailView}
      showDetailView={!!current}
      detailViewTitle={organization && organization[0].name}
      detailViewContent={
        <OrganizationInfo
          data={organization && organization[0]}
          onClickAction={setCurrentModal}
          loading={loadingOrganization}
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
      {loadingOrganizations && <Loader />}
      {!loadingOrganizations && !organizations?.length && (
        <InfoBox text={t('emptyMessage')} />
      )}
      {!loadingOrganizations && organizations?.length && (
        <ListItems
          items={organizations.map(item => ({ id: item.id, title: item.name }))}
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

export default memo(Organization)
