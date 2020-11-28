import PropTypes from 'prop-types'
import classnames from 'classnames'
import { forwardRef } from 'react'

import styles from '~/components/select.module.scss'

function SelectWithRef ({ children, className, id, label, ...props }, ref) {
  const containerClassName = classnames(className, styles.select)

  return (
    <div className={containerClassName}>
      <label className={styles.select__label} htmlFor={id}>
        {label}
      </label>
      <select
        className={styles.select__control}
        id={id}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}

const Select = forwardRef(SelectWithRef)

Select.defaultProps = {
  children: null,
  className: ''
}

Select.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  id: PropTypes.string,
  label: PropTypes.string.isRequired
}

export default Select
