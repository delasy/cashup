import PropTypes from 'prop-types'
import classnames from 'classnames'

import styles from '~/components/right-bottom-pane.module.scss'

function RightBottomPane ({ className, ...props }) {
  const containerClassName = classnames(className, styles['right-bottom-pane'])

  return (
    <div className={containerClassName} {...props}>
      ?
    </div>
  )
}

RightBottomPane.defaultProps = {
  className: ''
}

RightBottomPane.propTypes = {
  className: PropTypes.string
}

export default RightBottomPane
