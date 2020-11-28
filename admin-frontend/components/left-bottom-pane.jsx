import * as d3 from 'd3'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { useRef } from 'react'

import Chart, { selectOnce } from '~/components/chart'
import FullScreen from '~/components/full-screen'
import styles from '~/components/left-bottom-pane.module.scss'

function randomFloat () {
  const num = Math.random() * (140 - 130) + 130
  const parts = String(num).split('.')

  return parseFloat(parts[0] + '.' + (parts[1] + '00').slice(0, 2))
}

const liveData = []

for (let i = 9; i < 16; i++) {
  for (let j = i === 9 ? 30 : 0; j < 60; j++) {
    for (let k = 0; k < 60; k++) {
      liveData.push({
        x: new Date().setHours(i, j, k, 0),
        y1: randomFloat(),
        y2: randomFloat()
      })
    }
  }
}

liveData.push({
  x: new Date().setHours(16, 0, 0, 0),
  y1: randomFloat(),
  y2: randomFloat()
})

function LeftBottomPane ({ className, ctx, ...props }) {
  const node = useRef(null)
  const containerClassName = classnames(className, styles['left-bottom-pane'])

  return (
    <div className={containerClassName} ref={node} {...props}>
      <div className={styles['left-bottom-pane__header']}>
        <div className={styles['left-bottom-pane__header-section']}>
          <p className={styles['left-bottom-pane__header-subtitle']}>
            AAPL
          </p>
          <p className={styles['left-bottom-pane__header-body']}>
            Apple, Inc.
          </p>
        </div>
        <FullScreen
          className={styles['left-bottom-pane__full-screen']}
          target={node}
        />
      </div>
      <Chart
        className={styles['left-bottom-pane__chart']}
        data={liveData}
        onDraw={handleDrawChart}
      />
    </div>
  )
}

LeftBottomPane.defaultProps = {
  className: ''
}

LeftBottomPane.propTypes = {
  className: PropTypes.string,
  ctx: PropTypes.object.isRequired
}

function handleDrawChart (svg, data, { height, width }) {
  const labelsGroup = selectOnce(svg, 'g.labels')
  const label1 = selectOnce(labelsGroup, 'g.label1')

  const label1TextRect = selectOnce(label1, 'text.label1-text')
    .attr('dy', '1em')
    .attr('fill', 'black')
    .attr('font-size', '0.75em')
    .attr('font-weight', 'normal')
    .attr('text-anchor', 'end')
    .attr('x', width)
    .attr('y', 0)
    .text('Predicted')
    .node()
    .getBBox()

  selectOnce(label1, 'rect.label1-box')
    .attr('fill', '#039BE5')
    .attr('height', 12)
    .attr('width', 12)
    .attr('x', width - label1TextRect.width - 17)
    .attr('y', label1TextRect.height / 2 - 5)

  const label2 = selectOnce(labelsGroup, 'g.label2')

  const label2TextRect = selectOnce(label2, 'text.label2-text')
    .attr('dy', '1em')
    .attr('fill', 'black')
    .attr('font-size', '0.75em')
    .attr('font-weight', 'normal')
    .attr('text-anchor', 'start')
    .attr('x', width - label1TextRect.width)
    .attr('y', label1TextRect.height)
    .text('Actual')
    .node()
    .getBBox()

  selectOnce(label2, 'rect.label2-box')
    .attr('fill', 'black')
    .attr('height', 12)
    .attr('width', 12)
    .attr('x', width - label1TextRect.width - 17)
    .attr('y', label1TextRect.height + (label2TextRect.height / 2 - 5))

  let reducedData = reduceData(data, 1)

  const xScaleOriginal = d3.scaleTime()
    .domain([
      new Date().setHours(9, 30, 0, 0),
      new Date().setHours(16, 0, 0, 0)
    ])
    .range([0, width])

  let xScale = xScaleOriginal

  const yScale = d3.scaleLinear()
    .domain([
      d3.min(reducedData, it => it.y1),
      d3.max(reducedData, it => it.y1)
    ])
    .range([height, 38])

  const graph = selectOnce(svg, 'g.graph')
  const lineColors = ['black', '#039BE5']
  const lines = []

  for (let i = 0; i < lineColors.length; i++) {
    const line = d3.line()
      .curve(d3.curveLinear)
      .x(it => xScale(it.x))
      .y(it => yScale(it['y' + (i + 1)]))

    const path = selectOnce(graph, `path.graph-line${i + 1}`)
      .datum(reducedData)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', lineColors[i])
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('stroke-width', 1)

    lines.push({ line, path })
  }

  const tooltip = selectOnce(svg, 'g.tooltip')
    .style('display', 'none')

  const tooltipLine = selectOnce(svg, 'line.tooltip-line')
    .attr('stroke', 'black')
    .attr('stroke-width', 0.5)
    .style('display', 'none')

  svg.on('mousemove touchmove', (e) => {
    const xValue = xScale.invert(d3.pointer(e)[0])
    const idx = d3.bisector(it => it.x).left(reducedData, xValue, 1)
    const a = reducedData[idx - 1]
    const b = reducedData[idx]
    const it = b && (xValue - a.x > b.x - xValue) ? b : a
    const xPos = xScale(it.x)

    tooltipLine
      .attr('x1', xPos === 0 ? 0.5 : xPos - (xPos === width ? 0.5 : 0))
      .attr('x2', xPos === 0 ? 0.5 : xPos - (xPos === width ? 0.5 : 0))
      .attr('y1', 38)
      .attr('y2', height)
      .style('display', null)

    const tooltipContent = [
      new Date(it.x).toLocaleString(),
      'Predicted: ' + it.y1 + ' / Actual: ' + it.y2
    ]

    let tooltipHeight = 0

    for (let i = 0; i < tooltipContent.length; i++) {
      const tooltipLine = selectOnce(tooltip, `text.tooltip-line${i + 1}`)
        .attr('dy', '0.75em')
        .attr('fill', 'black')
        .attr('font-size', '0.75em')
        .attr('font-weight', 'normal')
        .attr('text-anchor', 'start')
        .attr('y', tooltipHeight)
        .text(tooltipContent[i])

      const tooltipLineRect = tooltipLine.node().getBBox()

      tooltipLine.attr('x', width / 2 - tooltipLineRect.width / 2)
      tooltipHeight += tooltipLineRect.height
    }

    tooltip.style('display', null)
  })

  svg.on('mouseleave touchend', () => {
    tooltip.style('display', 'none')
    tooltipLine.style('display', 'none')
  })

  const zoom = d3.zoom()
    .extent([[0, 38], [width, height - 38]])
    .scaleExtent([1, 1170])
    .translateExtent([[0, 38], [width, height - 38]])

  zoom.on('zoom', (e) => {
    reducedData = reduceData(data, e.transform.k)
    xScale = e.transform.rescaleX(xScaleOriginal)

    for (const { line, path } of lines) {
      path.datum(reducedData)
        .attr('d', line)
    }
  })

  svg.call(zoom)
}

function reduceData (data, scale) {
  const intervals = [
    14400, 7200, 4800, 3600, 2400, 1200,
    600, 480, 360, 240, 120,
    60, 40, 20
  ]

  for (const interval of intervals) {
    if (scale <= 23400 / interval) {
      const result = []

      for (let i = 0; i < data.length; i += interval / 20) {
        result.push(data[i])
      }

      const lastData = data[data.length - 1]
      const lastResult = result[result.length - 1]

      if (lastData.x !== lastResult.x) {
        result.push(lastData)
      }

      return result
    }
  }

  return data
}

export default LeftBottomPane
