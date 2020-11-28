import * as d3 from 'd3'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { useRef } from 'react'

import Chart, { selectOnce } from '~/components/chart'
import FullScreen from '~/components/full-screen'
import styles from '~/components/right-top-pane.module.scss'
import { toEpoch, toLoss, toTime } from '~/filters/index'

function RightTopPane ({ className, ctx, ...props }) {
  const node = useRef(null)

  if (!ctx.trained && !ctx.training) {
    return null
  }

  const containerClassName = classnames(className, styles['right-top-pane'])
  let chart = null

  if (ctx.trainingData.length > 0) {
    chart = (
      <Chart
        className={styles['right-top-pane__chart']}
        data={ctx.trainingData}
        onDraw={handleDrawChart}
      />
    )
  }

  const epochValue = ctx.trainingData.length
  const timeValueDelta = ctx.training ? Date.now() : ctx.trainingEnd
  const timeValue = timeValueDelta - ctx.trainingStart
  const lossValue = epochValue === 0 ? 0 : ctx.trainingData[epochValue - 1].y2

  return (
    <div className={containerClassName} ref={node} {...props}>
      <div className={styles['right-top-pane__header']}>
        <div className={styles['right-top-pane__header-section']}>
          <h6 className={styles['right-top-pane__header-subtitle']}>
            Epoch
          </h6>
          <p className={styles['right-top-pane__header-body']}>
            {toEpoch(epochValue)}
          </p>
        </div>
        <div className={styles['right-top-pane__header-section']}>
          <h6 className={styles['right-top-pane__header-subtitle']}>
            Time
          </h6>
          <p className={styles['right-top-pane__header-body']}>
            {toTime(timeValue)}
          </p>
        </div>
        <div className={styles['right-top-pane__header-section']}>
          <h6 className={styles['right-top-pane__header-subtitle']}>
            Avg. Loss
          </h6>
          <p className={styles['right-top-pane__header-body']}>
            {toLoss(lossValue)}
          </p>
        </div>
        <FullScreen
          className={styles['right-top-pane__full-screen']}
          target={node}
        />
      </div>
      {chart}
    </div>
  )
}

RightTopPane.defaultProps = {
  className: ''
}

RightTopPane.propTypes = {
  className: PropTypes.string,
  ctx: PropTypes.object.isRequired
}

function handleDrawChart (svg, data, { height, width }) {
  if (!svg.select('defs').node()) {
    const defs = svg.append('defs')

    const filter = defs.append('filter')
      .attr('filterUnits', 'userSpaceOnUse')
      .attr('id', 'tooltipShadow')

    filter.append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('result', 'blur')
      .attr('stdDeviation', 10)

    filter.append('feOffset')
      .attr('dx', 0)
      .attr('dy', 10)
      .attr('in', 'blur')
      .attr('result', 'offsetBlur')

    filter.append('feFlood')
      .attr('flood-color', '#000000')
      .attr('flood-opacity', 0.15)
      .attr('in', 'offsetBlur')
      .attr('result', 'offsetColor')

    filter.append('feComposite')
      .attr('in', 'offsetColor')
      .attr('in2', 'offsetBlur')
      .attr('operator', 'in')
      .attr('result', 'offsetComposite')

    const feMerge = filter.append('feMerge')

    feMerge.append('feMergeNode')
      .attr('in', 'offsetComposite')

    feMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic')
  }

  const labelsGroup = selectOnce(svg, 'g.labels')

  const labelXRect = selectOnce(labelsGroup, 'text.label-x')
    .attr('dy', '-0.25em')
    .attr('fill', 'black')
    .attr('font-size', '0.75em')
    .attr('font-weight', 'normal')
    .attr('text-anchor', 'middle')
    .attr('x', width / 2)
    .attr('y', height)
    .text('Epoch')
    .node()
    .getBBox()

  const labelYRect = selectOnce(labelsGroup, 'text.label-y')
    .attr('dy', '0.75em')
    .attr('fill', 'black')
    .attr('font-size', '0.75em')
    .attr('font-weight', 'normal')
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(270)')
    .attr('x', height / -2)
    .attr('y', 0)
    .text('Loss')
    .node()
    .getBBox()

  const xScale = d3.scaleLinear()
    .domain([1, d3.max(data, it => it.x)])
    .range([labelYRect.height + 10, width])

  const yScale = d3.scaleLinear()
    .domain([0, 100])
    .range([height - (labelXRect.height + 10), 0])

  const graph = selectOnce(svg, 'g.graph')
  const lineColors = ['#ED3B3B', 'black', '#689F38']

  for (let i = 0; i < lineColors.length; i++) {
    const line = d3.line()
      .curve(d3.curveBasis)
      .x(it => xScale(it.x))
      .y(it => yScale(it['y' + (i + 1)]))

    selectOnce(graph, `path.graph-line${i + 1}`)
      .datum(data)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', lineColors[i])
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('stroke-width', 1)
  }

  const tooltipLine = selectOnce(svg, 'line.tooltip-line')
    .attr('stroke', 'black')
    .attr('stroke-width', 0.5)
    .style('display', 'none')

  const tooltip = selectOnce(svg, 'g.tooltip')
    .attr('filter', 'url(#tooltipShadow)')
    .style('display', 'none')

  const tooltipRect = selectOnce(tooltip, 'rect.tooltip-rect')
    .attr('fill', 'white')

  svg.on('mousemove touchmove', (e) => {
    const xValue = xScale.invert(d3.pointer(e)[0])
    const idx = d3.bisector(it => it.x).left(data, xValue, 1)
    const a = data[idx - 1]
    const b = data[idx]
    const it = b && (xValue - a.x > b.x - xValue) ? b : a
    const xPos = xScale(it.x)

    tooltipLine
      .attr('x1', xPos === 0 ? 0.5 : xPos - (xPos === width ? 0.5 : 0))
      .attr('x2', xPos === 0 ? 0.5 : xPos - (xPos === width ? 0.5 : 0))
      .attr('y1', 0)
      .attr('y2', height - (labelXRect.height + 10))
      .style('display', null)

    const tooltipContent = [
      'Epoch: ' + toEpoch(it.x),
      'Highest Loss: ' + toLoss(it.y1),
      'Average Loss: ' + toLoss(it.y2),
      'Lowest Loss: ' + toLoss(it.y3)
    ]

    let tooltipHeight = 0
    let tooltipWidth = 0

    for (let i = 0; i < tooltipContent.length; i++) {
      const tooltipLineRect = selectOnce(tooltip, `text.tooltip-line${i + 1}`)
        .attr('dy', '0.75em')
        .attr('fill', 'black')
        .attr('font-size', '0.75em')
        .attr('font-weight', 'normal')
        .attr('text-anchor', 'start')
        .attr('x', 8)
        .attr('y', 8 + tooltipHeight)
        .text(tooltipContent[i])
        .node()
        .getBBox()

      tooltipHeight += tooltipLineRect.height

      if (tooltipWidth < tooltipLineRect.width) {
        tooltipWidth = tooltipLineRect.width
      }
    }

    tooltipHeight += 16
    tooltipWidth += 16

    let tooltipX = xPos + 13

    if (tooltipX + tooltipWidth > width - 13) {
      tooltipX = xPos - tooltipWidth - 13
    }

    tooltip
      .attr('transform', `translate(${tooltipX}, 13)`)
      .style('display', null)

    tooltipRect
      .attr('height', tooltipHeight)
      .attr('width', tooltipWidth)
  })

  svg.on('mouseleave touchend', () => {
    tooltipLine.style('display', 'none')
    tooltip.style('display', 'none')
  })
}

export default RightTopPane
