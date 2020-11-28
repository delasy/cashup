import * as d3 from 'd3'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { useEffect, useRef } from 'react'

import styles from '~/components/chart.module.scss'

function Chart ({ className, data, onDraw, ...props }) {
  const node = useRef(null)

  useEffect(() => {
    function handleDraw () {
      const { height, width } = node.current.getBoundingClientRect()

      const svg = d3.select(node.current)
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr('viewBox', `0 0 ${width} ${height}`)

      return onDraw(svg, data, { height, width })
    }

    handleDraw()
    window.addEventListener('resize', handleDraw)

    return () => {
      window.removeEventListener('resize', handleDraw)
    }
  }, [data])

  const containerClassName = classnames(className, styles.chart)

  return (
    <svg className={containerClassName} ref={node} {...props} />
  )
}

Chart.defaultProps = {
  className: ''
}

Chart.propTypes = {
  className: PropTypes.string,
  data: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  onDraw: PropTypes.func.isRequired
}

export function selectOnce (element, selector) {
  const selectorParts = selector.split('.')
  const type = selectorParts[0]
  const className = selectorParts[1]

  return element.select('.' + className).node()
    ? element.select('.' + className)
    : element.append(type).attr('class', className)
}

export default Chart
