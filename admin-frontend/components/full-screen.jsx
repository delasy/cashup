import PropTypes from 'prop-types'
import classnames from 'classnames'
import screenfull from 'screenfull'
import { forwardRef, useState } from 'react'

import IconContract from '~/assets/icon-contract.svg'
import IconExpand from '~/assets/icon-expand.svg'
import styles from '~/components/full-screen.module.scss'

function FullScreenWithRef ({ children, className, target, ...props }, ref) {
  const [isFullScreen, setIsFullScreen] = useState(false)

  async function handleClick () {
    if (isFullScreen) {
      await screenfull.exit()
      setIsFullScreen(false)
    } else {
      await screenfull.request(target.current)
      setIsFullScreen(true)
    }
  }

  const containerClassName = classnames(className, styles['full-screen'])

  const icon = isFullScreen
    ? <IconContract className={styles['full-screen__icon']} />
    : <IconExpand className={styles['full-screen__icon']} />

  return (
    <button
      className={containerClassName}
      onClick={handleClick}
      ref={ref}
      {...props}
    >
      {icon}
    </button>
  )
}

const FullScreen = forwardRef(FullScreenWithRef)

FullScreen.defaultProps = {
  className: ''
}

FullScreen.propTypes = {
  className: PropTypes.string,
  target: PropTypes.shape({
    current: PropTypes.any
  }).isRequired
}

export default FullScreen
