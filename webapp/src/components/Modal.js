import React, { memo } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import MuiModal from '@material-ui/core/Modal'
import Paper from '@material-ui/core/Paper'
import Box from '@material-ui/core/Box'
import { Typography } from '@material-ui/core'
import ClearIcon from '@material-ui/icons/Clear'

const StyledModal = styled(MuiModal)`
  display: flex;
  align-items: center;
  justify-content: center;
`

const Header = styled(Box)`
  width: 100%;
  display: flex;
  flex-direction: row-reverse;
  align-items: space-between;
  justify-content: space-between;
  padding-top: ${props => props.theme.spacing(2)}px;
`

const StyledPaper = styled(Paper)`
  min-width: 320px;
  width: 100%;
  height: 100vh;
  outline: none;
  padding: ${props => props.theme.spacing(2)}px;
  ${props => props.theme.breakpoints.up('sm')} {
    height: auto;
    max-height: 90%;
    width: auto;
    overflow: scroll;
  }
`

const Modal = ({ children, onClose, title, ...props }) => {
  const handleOnClose = () => {
    onClose && onClose()
  }

  return (
    <StyledModal onClose={handleOnClose} {...props}>
      <StyledPaper variant="outlined">
        <Header>
          {onClose && <ClearIcon onClick={handleOnClose} />}
          {title && <Typography variant="h6">{title}</Typography>}
        </Header>
        {children}
      </StyledPaper>
    </StyledModal>
  )
}

Modal.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  onClose: PropTypes.func
}

export default memo(Modal)
