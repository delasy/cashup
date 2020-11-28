import PropTypes from 'prop-types'
import classnames from 'classnames'
import { forwardRef } from 'react'

import styles from '~/components/input.module.scss'

function InputWithRef ({ className, id, label, ...props }, ref) {
  const containerClassName = classnames(className, styles.input)

  return (
    <div className={containerClassName}>
      <label className={styles.input__label} htmlFor={id}>
        {label}
      </label>
      <input
        className={styles.input__control}
        id={id}
        ref={ref}
        {...props}
      />
    </div>
  )
}

const Input = forwardRef(InputWithRef)

Input.defaultProps = {
  className: ''
}

Input.propTypes = {
  className: PropTypes.string,
  id: PropTypes.string,
  label: PropTypes.string.isRequired
}

export default Input
