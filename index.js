async function readAndDraw(){
  const icicleSum = await d3.csv('icicleSum.csv');
  const arrOfArr = convArrOfArr(icicleSum, 'seq', 'value');
  const width = 700;
  const height = 600;

  let json = buildHierarchy(arrOfArr);

  let root = d3.hierarchy(json)
      .sum(d => d.size);

  const colScale = d3.scaleOrdinal()
                    .domain(["Yes", "Yes, to IAF", "Yes, to a regional body", "No"])
                    .range([
                      d3.rgb('#02a5b2'),
                      d3.rgb('#02a5b2'),
                      d3.rgb('#02a5b2').darker(),
                      d3.rgb('#e74153')
                    ]);

  d3.select(".questionListContain")
      .selectAll('ol')
      .data([1, 2, 3, 4, 5, 6, 7])
      .style('font-weight',  300)
      .style('font-size',  '11px');

  let partition = d3.partition()  // <-- 1
                    .size([height, width])
                    .padding(1);

  let icicData = partition(root);

  // let arc = d3.arc()  // <-- 2
  //   .startAngle(function (d) { return d.x0 })
  //   .endAngle(function (d) { return d.x1 })
  //   .padAngle([0.0025])
  //   .innerRadius(function (d) { return Math.sqrt(d.y0) })
  //   .outerRadius(function (d) { return Math.sqrt(d.y1) });

  const svgG = d3.select('svg.icicle')
                  .selectAll('g')
                  .data(root.descendants())
                  .join("g")
                  .attr('class', 'rectG')
                  .attr("transform", d => `translate(${d.y0},${d.x0})`);

  svgG.append("rect")
      //.attr("display", function (d) { return d.depth ? null : "none"; })  // <-- 5
      .attr("width", d => d.y1 - d.y0)
      .attr("height", d => d.x1 - d.x0)
      .attr("fill-opacity", 1)
      .attr("fill", d => {
        if (!d.depth) return "#ccc";
        else return colScale(d.data.name);
      });

  const text = svgG.filter(d => (d.x1 - d.x0) > 16).append("text")
     .attr("x", 4)
     .attr("y", 13);

  text.append("tspan")
     .text(d => d.data.name == 'root' ? 'Total' : d.data.name);

  text.append("tspan")
     .attr("fill-opacity", 0.7)
     .text(d => `  ${d.value}`);

  // svgG.selectAll('path')  // <-- 1
  //   .data(root.descendants())  // <-- 2
  //   .enter()  // <-- 3
  //   .append('path')  // <-- 4
  //   .classed('sBArc', true)
  //   .attr("display", function (d) { return d.depth ? null : "none"; })  // <-- 5
  //   .attr("d", arc)  // <-- 6
  //   .style('stroke', '#fff')  // <-- 7
  //   .style("fill", d => colScale(d.data.name));

  svgG
    .on('mouseover', function(d, i){
      console.log(d)
      console.log(d.ancestors())
      const sequenceArray = d.ancestors().reverse();
      const depth = d.depth;
      const size = d3.sum(d.leaves().map(d => d.data.size));
      sequenceArray.shift();

      console.log(d.leaves().map(d => d.data.size));

      d3.select('p.stats')
        .style('opacity', 1);

      d3.select('div.statContain')
        .select('span.numer')
        .html(d => `${size}`);

      svgG.selectAll('rect')
          .style('opacity', d => sequenceArray.includes(d) ? 1 : 0.5);

      d3.select(".questionListContain")
          .selectAll('ol')
          .style('opacity', d => d == depth ? 1 : 0.3)
          .style('font-weight',  d => d == depth ? 400 : 300);

      d3.select(".questionListContain")
        .selectAll('ol')
          .transition()
          .duration(100)
          .style('transform', d => d == depth ? 'scale(1.1)' : 'scale(1.0)');

  });
  //
  svgG
    .on('mouseout', function(d, i){
      svgG.selectAll('rect')
          .style('opacity',  1);

      d3.select('p.stats')
        .style('opacity', 0);

      d3.select('div.statContain')
        .select('span.numer')
        .html(``);


      d3.select(".questionListContain")
          .selectAll('ol')
          .style('opacity', 1)
          .style('font-weight',  300);

      d3.select(".questionListContain")
        .selectAll('ol')
          .transition()
          .duration(100)
          .style('transform', 'scale(1.0)');
    });
}

readAndDraw();
