import { SIGN, getLabelName, itemPoint } from '../echarts-base'
import { getFormated } from '../util'

const dataHandler = {
  getBarLegends ({ measures, axisSite, meaAxisType, isColumn }) {
    let legends = []

    const formatter = getLabelName
    const secondAxis = isColumn ? axisSite.right : axisSite.top
    measures.forEach(measure => {
      let legendItem = ~secondAxis.indexOf(measure)
        ? `${measure}${SIGN}${meaAxisType[1]}`
        : `${measure}${SIGN}${meaAxisType[0]}`
      legends.push(legendItem)
    })

    return legends.length ? { data: legends, formatter } : false
  },

  getBarDimAxis ({ rows, dimAxisName, dimensions }) {
    return dimensions.map(dimension => ({
      type: 'category',
      name: dimAxisName || dimension,
      nameLocation: 'middle',
      nameGap: 22,
      data: rows.map(row => row[dimension]),
      axisLabel: {
        formatter (v) {
          return String(v)
        }
      }
    }))
  },

  getBarMeaAxis ({ columns, meaAxisName, measures, meaAxisType }) {
    const meaAxisBase = { type: 'value', axisTick: { show: false } }
    let meaAxis = []

    for (let i = 0; i < 2; i++) {
      if (meaAxisType[i]) {
        meaAxis[i] = Object.assign({}, meaAxisBase, {
          axisLabel: {
            formatter (val) {
              return getFormated(val, meaAxisType[i])
            }
          }
        })
      } else {
        meaAxis[i] = Object.assign({}, meaAxisBase)
      }
      meaAxis[i].name = meaAxisName[i] || ''
    }

    return meaAxis
  },

  getBarTooltip () {
    return {
      trigger: 'axis',
      formatter (items) {
        let tpl = []
        const title = String(items[0].name).split(SIGN)[0]
        tpl.push(`${title}<br>`)
        items.forEach(item => {
          const [name, type] = item.seriesName.split(SIGN)
          tpl.push(itemPoint(item.color))
          tpl.push(`${name}: `)
          tpl.push(getFormated(item.value, type))
          tpl.push('<br>')
        })

        return tpl.join('')
      }
    }
  },

  getStackMap (stack) {
    const stackMap = {}
    Object.keys(stack).forEach(item => {
      stack[item].forEach(name => {
        stackMap[name] = item
      })
    })
    return stackMap
  },

  getBarSeries ({ rows, measures, stackMap, axisSite, meaAxisType, isColumn }) {
    let series = []
    const seriesTemp = {}
    const secondAxis = isColumn ? axisSite.right : axisSite.top
    const secondDimAxisIndex = isColumn ? 'yAxisIndex' : 'xAxisIndex'
    measures.forEach(measure => { seriesTemp[measure] = [] })
    rows.forEach(row => {
      measures.forEach(measure => {
        seriesTemp[measure].push(row[measure])
      })
    })
    series = Object.keys(seriesTemp).map(item => {
      let itemName = ~secondAxis.indexOf(item)
        ? `${item}${SIGN}${meaAxisType[1]}`
        : `${item}${SIGN}${meaAxisType[0]}`
      const seriesItem = {
        name: itemName,
        type: 'bar',
        data: seriesTemp[item],
        [secondDimAxisIndex]: ~secondAxis.indexOf(item) ? '1' : '0'
      }

      if (stackMap[item]) seriesItem.stack = stackMap[item]

      return seriesItem
    })

    return series.length ? series : false
  }
}
const bar = (data, settings) => {
  if (!data || !Array.isArray(data.columns) || !Array.isArray(data.rows)) return false
  const { columns, rows } = data
  const {
    axisSite = { top: [] },
    dimensions = [columns[0]],
    stack = {}
  } = settings
  let measures = columns.slice()
  if (settings.measures) {
    measures = settings.measures
  } else {
    measures.splice(columns.indexOf(dimensions[0]), 1)
  }
  const meaAxisType = settings.xAxisType || ['normal', 'normal']
  const meaAxisName = settings.xAxisName || []
  const dimAxisName = settings.yAxisName || dimensions[0]
  const isColumn = false

  const stackMap = stack ? dataHandler.getStackMap(stack) : {}
  const legend = dataHandler.getBarLegends({ measures, axisSite, meaAxisType, isColumn })
  const yAxis = dataHandler.getBarDimAxis({ rows, dimAxisName, dimensions })
  const xAxis = dataHandler.getBarMeaAxis({ columns, meaAxisName, measures, meaAxisType })
  const series = dataHandler.getBarSeries({ rows, measures, stackMap, axisSite, meaAxisType, isColumn })
  const tooltip = dataHandler.getBarTooltip()
  const options = { legend, yAxis, series, xAxis, tooltip }
  return options
}

const column = (data, settings) => {
  if (!data || !Array.isArray(data.columns) || !Array.isArray(data.rows)) return false
  const { columns, rows } = data
  const {
    axisSite = { right: [] },
    dimensions = [columns[0]],
    stack = {}
  } = settings
  let measures = columns.slice()
  if (settings.measures) {
    measures = settings.measures
  } else {
    measures.splice(columns.indexOf(dimensions[0]), 1)
  }
  const meaAxisType = settings.yAxisType || ['normal', 'normal']
  const meaAxisName = settings.yAxisName || []
  const dimAxisName = settings.xAxisName || dimensions[0]
  const isColumn = true

  const stackMap = stack ? dataHandler.getStackMap(stack) : {}
  const legend = dataHandler.getBarLegends({ measures, axisSite, meaAxisType, isColumn })
  const xAxis = dataHandler.getBarDimAxis({ rows, dimAxisName, dimensions })
  const yAxis = dataHandler.getBarMeaAxis({ columns, meaAxisName, measures, meaAxisType })
  const series = dataHandler.getBarSeries({ rows, measures, stackMap, axisSite, meaAxisType, isColumn })
  const tooltip = dataHandler.getBarTooltip()
  const options = { legend, yAxis, series, xAxis, tooltip }
  return options
}

export { bar, column }