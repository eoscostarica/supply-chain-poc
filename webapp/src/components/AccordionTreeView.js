import React, { memo, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import MuiAccordion from '@material-ui/core/Accordion'
import MuiAccordionSummary from '@material-ui/core/AccordionSummary'
import MuiAccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import TreeView from '@material-ui/lab/TreeView'
import TreeItem from '@material-ui/lab/TreeItem'
import Box from '@material-ui/core/Box'
import SvgIcon from '@material-ui/core/SvgIcon'

import { formatAsset } from '../utils'

const StylePathName = styled(Typography)`
  font-size: 12px;
  margin-left: 5px;
`

const StyleId = styled(Typography)`
  font-size: 14px;
  margin-left: 1rem;
`

const Accordion = styled(MuiAccordion)`
  background-color: ${props => props.theme.palette.background.paper};
  box-shadow: none;
  margin-top: 0 !important;
  &:not(:last-child) {
    border-bottom: 0;
  }
  &:before {
    display: none;
  }
`

const StyledTreeView = styled(TreeView)`
  flex-grow: 1;
`

const AccordionWrapper = styled(Box)`
  width: 100%;
  margin-bottom: 1rem;
`

const StyledBoxId = styled(Box)`
  width: 100%;
  display: flex;
  justify-content: space-between;
`

const LabelBox = styled(Box)`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`

const StyledTreeItem = styled(TreeItem)`
  .MuiTreeItem-iconContainer {
    & .close {
      opacity: 0.3;
    }
  }
  .MuiTreeItem-group {
    margin-left: 7px;
    padding-left: 18px;
    border-left: 1px dashed rgba(0, 0, 0, 0.24);
  }
`

const AccordionSummary = withStyles({
  root: {
    borderBottom: '1px solid rgba(0, 0, 0, .24)',
    borderTop: 'none',
    padding: 0,
    minHeight: 46,
    '&$expanded': {
      minHeight: 46
    }
  },
  content: {
    alignItems: 'center',
    '&$expanded': {
      margin: '0'
    }
  },
  expanded: {}
})(MuiAccordionSummary)

const AccordionDetails = styled(MuiAccordionDetails)`
  display: flex;
  flex-direction: column;
  padding-top: ${props => props.theme.spacing(2)}px;
  padding-bottom: ${props => props.theme.spacing(2)}px;
  padding-left: 0;
  padding-right: 0;
`

const MinusSquare = props => {
  return (
    <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
      <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 11.023h-11.826q-.375 0-.669.281t-.294.682v0q0 .401.294 .682t.669.281h11.826q.375 0 .669-.281t.294-.682v0q0-.401-.294-.682t-.669-.281z" />
    </SvgIcon>
  )
}

const PlusSquare = props => {
  return (
    <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
      <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 12.977h-4.923v4.896q0 .401-.281.682t-.682.281v0q-.375 0-.669-.281t-.294-.682v-4.896h-4.923q-.401 0-.682-.294t-.281-.669v0q0-.401.281-.682t.682-.281h4.923v-4.896q0-.401.294-.682t.669-.281v0q.401 0 .682.281t.281.682v4.896h4.923q.401 0 .682.281t.281.682v0q0 .375-.281.669t-.682.294z" />
    </SvgIcon>
  )
}

const CustomizedAccordions = ({ data }) => {
  const { t } = useTranslation('accordion')
  const [expanded, setExpanded] = useState()
  const [total, setTotal] = useState()

  const handleChange = panel => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false)
  }

  const printTreeView = assets => {
    if (!assets.length) return null

    return assets.map(child => {
      if (child.assets && child.assets.length) {
        const itemsPathQuantity = formatAsset(child)

        return (
          <StyledTreeItem
            key={`${child.key}-${child.category}`}
            nodeId={child.key}
            label={
              <LabelBox>
                <Typography>{t(child.category)}</Typography>
                <StylePathName>{itemsPathQuantity}</StylePathName>
              </LabelBox>
            }
          >
            {printTreeView(child.assets)}
          </StyledTreeItem>
        )
      }

      return (
        <StyledTreeItem
          key={`${child.key}-${child.category}`}
          nodeId={child.key}
          label={t(child.category)}
        />
      )
    })
  }

  useEffect(() => {
    if (data.length) {
      setTotal(
        formatAsset({
          assets: data || [],
          category: 'order'
        })
      )
    }
  }, [data])

  console.log({ data })

  return (
    <>
      <AccordionWrapper>
        {data.map((item, index) => {
          const newDate = new Date(item.idata.exp)
          const dateFormat = newDate.toLocaleString({
            hour: 'numeric',
            hour12: true
          })

          const itemsPathQuantity = formatAsset(item)

          return (
            <Accordion
              key={`key-accordion-${index}`}
              square
              expanded={expanded === index}
              onChange={handleChange(index)}
            >
              <AccordionSummary
                aria-controls="panel1d-content"
                id="panel1d-header"
                expandIcon={<ExpandMoreIcon />}
              >
                <Typography>{`Lote #${item.idata.lot}`}</Typography>
                <StylePathName>{itemsPathQuantity}</StylePathName>
              </AccordionSummary>
              <AccordionDetails>
                <StyledBoxId>
                  <StyleId>{`Id:${item.key}`}</StyleId>
                  <StyleId>{`Exp:${dateFormat.substring(0, 10)}`}</StyleId>
                </StyledBoxId>
                <StyledTreeView
                  defaultCollapseIcon={<MinusSquare />}
                  defaultExpandIcon={<PlusSquare />}
                >
                  {printTreeView(item.assets || [])}
                </StyledTreeView>
              </AccordionDetails>
            </Accordion>
          )
        })}
      </AccordionWrapper>
      {data.length ? (
        <LabelBox>
          <Typography>Total:</Typography>
          <StylePathName>{total}</StylePathName>
        </LabelBox>
      ) : null}
    </>
  )
}

CustomizedAccordions.propTypes = {
  data: PropTypes.array
}

export default memo(CustomizedAccordions)
