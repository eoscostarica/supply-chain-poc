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
import UserInfo from '../components/UserInfo'
import Modal from '../components/Modal'
import {
  USERS_QUERY,
  USER_QUERY,
  MANUFACTURER_UPDATE_MUTATION,
  MANUFACTURER_INSERT_MUTATION
} from '../gql'

const Users = () => {
  const { t } = useTranslation('users')
  const [, setState] = useSharedState()
  const [selectedId, setSelectedId] = useState()
  const [currentModal, setCurrentModal] = useState()
  const [
    getUsers,
    { loading: loadingUsers, data: { users } = {} }
  ] = useLazyQuery(USERS_QUERY, {
    fetchPolicy: 'network-only'
  })
  const [getUser, { loading: loadingUser, data: { user } = {} }] = useLazyQuery(
    USER_QUERY,
    {
      fetchPolicy: 'network-only'
    }
  )
  const [addUser, { loading: addingUser }] = useMutation(
    MANUFACTURER_INSERT_MUTATION
  )
  const [updateUser, { loading: updatingUser }] = useMutation(
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
    const { data: response } = await addUser({
      variables: { name, data }
    })
    setState({
      message: {
        content: t('successAdd'),
        type: 'success'
      }
    })
    getUsers()
    setSelectedId(response.user.id)
  }

  const handleUpdateManufacturer = async (id, name, data) => {
    const { data: response } = await updateUser({
      variables: { id, name, data }
    })
    getUser({ variables: { id: response.user.id } })
    setState({
      message: {
        content: t('successUpdate'),
        type: 'success'
      }
    })
  }

  const renderModalContent = modal => {
    switch (modal.type) {
      case 'add':
        return <p>Work in progress</p>
      case 'edit':
        return <p>Work in progress</p>

      default:
        return <></>
    }
  }

  useEffect(() => {
    getUsers()
  }, [getUsers])

  useEffect(() => {
    if (!selectedId) {
      return
    }

    getUser({ variables: { id: selectedId } })
  }, [selectedId, getUser])

  console.log(handleOnSubmit)
  console.log(addingUser)
  console.log(updatingUser)
  return (
    <MasterDetail
      onCloseDetailView={handleOnCloseDetailView}
      showDetailView={!!selectedId}
      detailViewTitle={user?.name}
      detailViewContent={
        <UserInfo
          data={user}
          onClickAction={setCurrentModal}
          loading={loadingUser}
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
      {loadingUsers && <Loader />}
      {!loadingUsers && !users?.length && <InfoBox text={t('emptyMessage')} />}
      {!loadingUsers && users?.length && (
        <ListItems
          items={users.map(item => ({
            id: item.id,
            title: item.name,
            summary: t(item.role)
          }))}
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

export default memo(Users)
