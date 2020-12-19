import React, { memo } from 'react'
import PropTypes from 'prop-types'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'

const ComboBox = ({
  optionLabel = 'label',
  options,
  value,
  onChange,
  ...props
}) => (
  <Autocomplete
    value={value}
    onChange={onChange}
    options={options}
    getOptionLabel={option =>
      typeof option === 'string' ? option : option[optionLabel || 'label']
    }
    renderInput={({ value, ...params }) => (
      <TextField value={value || ''} {...props} {...params} />
    )}
  />
)

ComboBox.propTypes = {
  optionLabel: PropTypes.string,
  options: PropTypes.array,
  value: PropTypes.any,
  onChange: PropTypes.func
}

export default memo(ComboBox)
