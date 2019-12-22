const w = 2000;
const h = 600;
const margin = {top: 50, right: 50, bottom: 150, left: 75};
const directColor = ["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee090", "#ffffbf", "#e0f3f8", "#abd9e9", "#74add1", "#4575b4", "#313695"];
const reversedColor = directColor.reverse();
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

var threshold = d3.scaleThreshold()
    .domain([2.8, 3.9, 5.0, 6.1, 7.2, 8.3, 9.5, 10.6, 11.7, 12.8])
    .range(reversedColor);

const canvas = d3.select('.graph')
               .append("svg")
               .attr("width", w)
               .attr("height", h);

const tip = d3.tip()
        .attr("class", "d3-tip")
        .attr("id", "tooltip")
        .html(function(d){
          return d;
        })
        .direction("n")
        .offset([-10,0]);

canvas.call(tip);

d3.json('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
.then(data => {
  
  data.monthlyVariance.forEach(d => d.month -= 1);
  
  //y-axis
  const yScale = d3.scaleBand()
                   .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
                   .range([margin.top, h - margin.bottom])
  
  const yAxis = d3.axisLeft(yScale)
                  .tickValues(yScale.domain())
                  .tickFormat(function(d){
                    return months[d];
                   });
  
  canvas.append("g")
        .attr("id", "y-axis")
        .attr("transform", `translate(${ margin.left})`, 0)
        .call(yAxis);
  
  //x-axis
  const xValues = [...new Set(data.monthlyVariance.map(d => d.year))];
  const cellWidth = (w - margin.left - margin.right) / xValues.length; 
  const cellHeight = (h - margin.top - margin.bottom) / 12;
  const minDate = d3.min(xValues);
  const maxDate = d3.max(xValues);
  
  
  const xScale = d3.scaleTime()
                   .domain([new Date(minDate + ""), new Date(maxDate + "")])
                   .range([margin.left, w - margin.right]);
  
  const xAxis = d3.axisBottom(xScale);
  
  canvas.append('g')
        .attr('id', 'x-axis')
        .attr('transform', `translate(0, ${h - margin.bottom})`)
        .call(xAxis);
  
  //map
  canvas.selectAll("rect")
        .data(data.monthlyVariance)
        .enter().append("rect")
        .attr("class", "cell")
        .attr("width", cellWidth)
        .attr("height", cellHeight)
        .attr("x", (d, i) => xScale(new Date(d.year + "")))
        .attr("y", (d, i) => yScale(d.month))
        .attr("fill", (d, i) => threshold(data.baseTemperature + d.variance))
        .attr("data-month", (d, i) => d.month)
        .attr("data-year", (d, i) => d.year)
        .attr("data-temp", (d, i) => data.baseTemperature + d.variance)
        .on("mouseover", function(d){
          var str = "<span class='date'>" + d.year + " - " + d.month + "</span>" + "<br />"
              + "<span class='temperature'>" + d3.format(".1f")(data.baseTemperature + d.variance) + "&#8451;" + 
              "</span>" + "<br />"+ "<span class='variance'>" + d3.format("+.1f")(d.variance) + "&#8451;" + "</span>";
          tip.attr("data-year", d.year);
          tip.show(str, this);
        })
        .on("mouseout", tip.hide);

  //Legend
  const x = d3.scaleLinear()
              .domain([1.7, 13.9])
              .range([0, 400]);

  const legendAxis = d3.axisBottom(x)
                        .tickSize(15, 0)
                        .tickValues(threshold.domain())
                        .tickFormat(d3.format(".1f"));

  const legend = canvas.append("g")
                       .attr("id", "legend")
                       .attr('transform', `translate(${margin.left}, ${h - 50})`)
                       .call(legendAxis);
  
  legend.selectAll("rect")
        .data(threshold.range().map(function(color) {
          const d = threshold.invertExtent(color);
          if (d[0] == null) d[0] = x.domain()[0];
          if (d[1] == null) d[1] = x.domain()[1];
          return d;
        }))
        .enter().insert("rect")
        .attr("height", 8)
        .attr("x", function(d) { return x(d[0]); })
        .attr("width", function(d) { return x(d[1]) - x(d[0]); })
        .attr("fill", function(d) { return threshold(d[0]); });
});  
