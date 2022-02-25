// Chart settings
const width = 920
const height = 630
const padding = 40
const paddingTop = padding + 60

// Initialize colors
const blueColor = 'rgb(31, 119, 180)' 
const orangeColor = 'rgb(255, 127, 14)'

// Initialize legend square size
const legendSquareSize = 18
const legendTextXY = 13

// Create Chart
const chart = d3.select('body')
  .append('div')
  .attr('id', 'chart')

// Create svg
const svg = chart.append('svg')
  .attr('width', width)
  .attr('height', height)

// Add title
svg.append('text')
  .attr('id', 'title')
  .attr('x', width / 2)
  .attr('y', 40)
  .text('Doping in Professional Bicycle Racing')
  .style('font-size', '2rem')
  .style('text-anchor', 'middle')

// Add subtitle
svg.append('text')
  .attr('x', width / 2)
  .attr('y', 70)
  .text('35 Fastest times up Alpe d\'Huez')
  .style('font-size', '1.5rem')
  .style('text-anchor', 'middle')

// Fetch data
const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json'

fetch(url)
  .then(res => res.json())
  .then(data => {

    // Get first and last data
    const minDate = new Date()
    const maxDate = new Date()
    const [minMinute, minSecond] = data[0].Time.split(':')
    const [maxMinute, maxSecond] = data[data.length - 1].Time.split(':')

    // Set minTime
    minDate.setMinutes(minMinute)
    minDate.setSeconds(minSecond)

    // Set maxTime
    maxDate.setMinutes(maxMinute)
    maxDate.setSeconds(maxSecond)

    // Initialize scale
    const yAxisPadding = 1
    const xScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.Year) - yAxisPadding, d3.max(data, d => d.Year)])
      .range([0, width - padding * 2])
    const yScale = d3.scaleLinear()
      .domain([maxDate, minDate])
      .range([height - padding - paddingTop, 0])
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d => d.toString())
    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => new Date(d).toLocaleString('en-US', { minute: "2-digit", second: "2-digit" }))

    // Add X axis
    svg.append('g')
      .attr('id', 'x-axis')
      .attr('transform', `translate(${padding}, ${height - padding})`)
      .call(xAxis)

    // Add Y axis
    svg.append('g')
      .attr('id', 'y-axis')
      .attr('transform', `translate(${padding}, ${paddingTop})`)
      .call(yAxis)

    // Add scatter plot
    svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.Year) + padding)
      .attr('cy', d => yScale(unixTime(d.Time).getTime()) + paddingTop)
      .attr('r', '6')
      .attr('data-xvalue', d => d.Year)
      .attr('data-yvalue', d => unixTime(d.Time))
      .attr('fill', d => dopingColor(d.Doping))
      .on('mouseover', (event, target) => showTooltip(event, target))
      .on('mouseleave', hideTooltip)

    // Add legend
    const legend = svg.append('g')
      .attr('id', 'legend')

    // Add legend group
    legend.append('g')
      .attr('id', 'legend-no-doping')
      .attr('class', 'legend-label')
      .attr('transform', `translate(${width - padding}, ${height / 2})`)
    legend.append('g')
      .attr('id', 'legend-doping')
      .attr('class', 'legend-label')
      .attr('transform', `translate(${width - padding}, ${height / 2 + 24})`)

    // Add no doping group legend
    const noDopeGroup = legend.select('#legend-no-doping')
    noDopeGroup
      .append('text')
      .text('No doping allegations')
      .attr('x', -legendTextXY)
      .attr('y', legendTextXY)
    noDopeGroup
      .insert('rect')
      .attr('width', legendSquareSize)
      .attr('height', legendSquareSize)
      .attr('fill', blueColor)

    // Add doping group legend
    const dopeGroup = legend.select('#legend-doping')
    dopeGroup
      .append('text')
      .text('Riders with doping allegations')
      .attr('x', -legendTextXY)
      .attr('y', legendTextXY)
    dopeGroup
      .insert('rect')
      .attr('width', legendSquareSize)
      .attr('height', legendSquareSize)
      .attr('fill', orangeColor)

    console.log(data)
  })

function unixTime(time) {
  const date = new Date()
  const [minute, second] = time.split(':')

  date.setMinutes(minute)
  date.setSeconds(second)

  return date
}

function stringTime(unixTime) {
  return new Date(unixTime).toLocaleString('en-US', { minute: "2-digit", second: "2-digit" })
}

function dopingColor(text) {
  return text ? 'rgb(31, 119, 180)' : 'rgb(255, 127, 14)'
}

function showTooltip(event, data) {
  const targetAttr = event.target.attributes
  const x = targetAttr.cx.value
  const y = targetAttr.cy.value
  const name = `${data.Name}: ${data.Nationality}`
  const year = `Year: ${data.Year}, Time: ${data.Time}`
  const doping = data.Doping
  const margin = 20

  // Add tooltip container
  const tooltip = chart.append('div')
    .attr('id', 'tooltip')
    .attr('data-year', data.Year)
    .style('left', `${+x + margin}px`)
    .style('top', `${+y - margin}px`)

  // Add tooltip content
  tooltip.append('p')
    .text(name)
  tooltip.append('p')
    .text(year)
  doping && tooltip.append('br')
  tooltip.append('p')
    .text(doping)
}

function hideTooltip() {
  d3.select('#tooltip').remove()
}
