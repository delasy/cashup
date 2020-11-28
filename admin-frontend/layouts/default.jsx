import PropTypes from 'prop-types'
import classnames from 'classnames'

import styles from '~/layouts/default.module.scss'

function DefaultLayout ({ children, className, ...props }) {
  const containerClassName = classnames(className, styles['default-layout'])

  return (
    <div className={containerClassName} {...props}>
      {children}
    </div>
  )
}

DefaultLayout.defaultProps = {
  children: null,
  className: ''
}

DefaultLayout.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
}

export default DefaultLayout
