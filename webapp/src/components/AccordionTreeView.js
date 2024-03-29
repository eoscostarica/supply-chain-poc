import React, { memo, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import { withStyles, makeStyles } from '@material-ui/core/styles'
import { useTranslation } from 'react-i18next'
import MuiAccordion from '@material-ui/core/Accordion'
import MuiAccordionSummary from '@material-ui/core/AccordionSummary'
import MuiAccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import TreeView from '@material-ui/lab/TreeView'
import TreeItem from '@material-ui/lab/TreeItem'
import Box from '@material-ui/core/Box'
import SvgIcon from '@material-ui/core/SvgIcon'
import LinearProgress from '@material-ui/core/LinearProgress'

import { formatAsset, getLastChars } from '../utils'

const VACCINE_PARENT = 'case'

const useStyles = makeStyles(theme => ({
  accordionWrapper: {
    width: '100%',
    marginBottom: '1rem',
    maxHeight: '500px',
    overflow: 'scroll'
  },
  styledBoxId: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'column',
    minHeight: theme.spacing(4),
    '& .MuiLinearProgress-root': {
      width: '100%',
      marginLeft: '1rem'
    }
  },
  labelBox: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  stylePathName: {
    fontSize: 12,
    marginLeft: theme.spacing(1),
    minWidth: '200px'
  },
  linearProgress: {
    minWidth: 100,
    marginLeft: theme.spacing(1)
  },
  styleId: {
    fontSize: 14,
    marginLeft: '1rem'
  },
  accordion: {
    backgroundColor: 'transparent',
    boxShadow: 'none',
    marginTop: '0 !important',
    '&:not(:last-child)': {
      borderBottom: 0
    },
    '&:before': {
      display: 'none'
    }
  },
  styledTreeView: {
    flexGrow: 1
  },
  styledTreeItem: {
    padding: '4px 0',
    '& .MuiTreeItem-iconContainer': {
      '& .close': {
        opacity: 0.3
      }
    },
    '& .MuiTreeItem-group': {
      marginLeft: 7,
      paddingLeft: 18,
      borderLeft: '1px solid rgba(0, 0, 0, 0.24)'
    }
  },
  accordionDetails: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 0,
    paddingBottom: theme.spacing(2),
    paddingLeft: 0,
    paddingRight: 0,
    borderBottom: '1px solid rgba(0, 0, 0, .24)'
  },
  borderDivider: {
    borderBottom: '1px solid #000000',
    width: '100%',
    marginBottom: theme.spacing(4),
    paddingBottom: theme.spacing(2)
  },
  displayNone: {
    visibility: 'hidden'
  },
  label: {
    fontSize: 20,
    lineHeight: '23px',
    display: 'flex',
    alignItems: 'center',
    letterSpacing: '0.15px'
  }
}))

const AccordionSummary = withStyles({
  root: {
    borderBottom: '1px solid rgba(0, 0, 0, .24)',
    borderTop: 'none',
    padding: 0,
    minHeight: 46,
    '&$expanded': {
      minHeight: 46,
      borderBottom: 'none'
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

const AccordionTreeView = ({ data, category }) => {
  const { t } = useTranslation('accordion')
  const classes = useStyles()
  const [expanded, setExpanded] = useState()
  const [total, setTotal] = useState()

  const handleChange = panel => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false)
  }

  const printTreeView = assets => {
    if (!assets.length) return null

    return assets.map(child => {
      const itemLabel = `${t(child.category)} ...${child.key.substr(
        child.key.length - 4
      )}:`

      if (child.assets && child.assets.length) {
        const itemsPathQuantity = formatAsset(child, t)
        const isVaccineParent = child.category === VACCINE_PARENT

        return (
          <TreeItem
            className={classes.styledTreeItem}
            key={`${child.key}-${child.category}`}
            nodeId={child.key}
            label={
              <Box className={classes.labelBox}>
                <Typography>{itemLabel}</Typography>
                <Typography className={classes.stylePathName}>
                  {itemsPathQuantity}
                </Typography>
              </Box>
            }
          >
            {isVaccineParent ? (
              <TreeItem
                className={classes.styledTreeItem}
                nodeId={`${Math.random()}-vaccines`}
                label={`${child.assets.length} ${
                  child.assets.length > 1 ? t('vaccines') : t('vaccine')
                }`}
              />
            ) : (
              printTreeView(child.assets)
            )}
          </TreeItem>
        )
      }

      return (
        <TreeItem
          className={classes.styledTreeItem}
          key={`${child.key}-${child.category}`}
          nodeId={child.key}
          label={itemLabel}
        />
      )
    })
  }

  useEffect(() => {
    if (data.length) {
      setTotal(
        formatAsset(
          {
            assets: data || [],
            category: category
          },
          t
        )
      )
    }
  }, [data, category, t])

  return (
    <>
      {data.length ? (
        <Typography className={classes.label}>{t('title')}</Typography>
      ) : null}
      <Box className={classes.accordionWrapper}>
        {data.map((item, index) => {
          const itemsPathQuantity = formatAsset(item, t)

          return (
            <MuiAccordion
              key={`key-accordion-${index}`}
              square
              expanded={expanded === index}
              onChange={handleChange(index)}
              className={classes.accordion}
            >
              <AccordionSummary
                aria-controls="panel1d-content"
                id="panel1d-header"
                expandIcon={<ExpandMoreIcon />}
              >
                <Typography>
                  {`${t(item.category)} #${getLastChars(item.key)}`}
                </Typography>
                {item.status === 'creating' ? (
                  <LinearProgress className={classes.linearProgress} />
                ) : (
                  <Typography className={classes.stylePathName}>
                    {itemsPathQuantity}
                  </Typography>
                )}
              </AccordionSummary>
              <MuiAccordionDetails className={classes.accordionDetails}>
                <Box className={classes.styledBoxId}>
                  <Typography className={classes.styleId}>
                    {`Id: ${item.key}`}
                  </Typography>
                  {item?.assets?.length < item?.mdata?.childs && (
                    <>
                      <Typography className={classes.styleId}>
                        {t('itemCreationStatus')}: {item?.assets?.length} of{' '}
                        {item?.mdata.childs}
                      </Typography>
                      <LinearProgress />
                    </>
                  )}
                </Box>
                <TreeView
                  className={classes.styledTreeView}
                  defaultCollapseIcon={<MinusSquare />}
                  defaultExpandIcon={<PlusSquare />}
                >
                  {VACCINE_PARENT !== item.category ? (
                    printTreeView(item.assets || [])
                  ) : (
                    <TreeItem
                      className={classes.styledTreeItem}
                      nodeId={`${Math.random()}-vaccines`}
                      label={`${item.assets.length} ${
                        item.assets.length > 1 ? t('vaccines') : t('vaccine')
                      }`}
                    />
                  )}
                </TreeView>
              </MuiAccordionDetails>
            </MuiAccordion>
          )
        })}
      </Box>
      {data.length ? (
        <Box className={clsx(classes.labelBox, classes.borderDivider)}>
          <Typography>Total:</Typography>
          <Typography className={classes.stylePathName}>{total}</Typography>
        </Box>
      ) : null}
    </>
  )
}

AccordionTreeView.propTypes = {
  data: PropTypes.array,
  category: PropTypes.string
}

export default memo(AccordionTreeView)
