import PropTypes from 'prop-types'
import classnames from 'classnames'
import { forwardRef } from 'react'

import styles from '~/components/button.module.scss'

function ButtonWithRef ({ children, className, ...props }, ref) {
  const containerClassName = classnames(className, styles.button)

  return (
    <button className={containerClassName} ref={ref} {...props}>
      {children}
    </button>
  )
}

const Button = forwardRef(ButtonWithRef)

Button.defaultProps = {
  children: null,
  className: ''
}

Button.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
}

export default Button
