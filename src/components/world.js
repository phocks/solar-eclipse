const Preact = require("preact");
const topojson = require("topojson");
const select = require("d3-selection");
const geo = require('d3-geo');
const request = require('d3-request');
const shape = require('d3-shape');
const scale = require('d3-scale');
const geoProj = require('d3-geo-projection');
const timer = require('d3-timer');

const styles = require("./world.scss");

const   width = 410,
        height = 400,
        maxWidth = 1000,
        fillOpacity = 0.7,
        worldColor = '#444';


const t0 = Date.now();

// Set up a D3 procection here 
var projection = geo.geoOrthographic()
  .scale(170)
  .translate([width / 2, height / 2])
  // .clipAngle(90)
  .precision(.1);

// Set up our color scale
const colorScale = scale.scaleLinear()
  .domain([2017,2117])
  .range(['MEDIUMSEAGREEN', 'SLATEBLUE']);

class World extends Preact.Component {
  componentWillMount() {

  }
  componentDidMount() {
    const svg = select.select("#world #map")
      .append("svg")
      .classed(styles.scalingSvg, true)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr('viewBox', `0, 0, ${+width}, ${+height}`);


    // Load our data 
    const world = require("./world-data/world-simple.topo.json");
    const eclipses = [
      require("./world-data/2019-eclipse.geo.json"),
      require("./world-data/2020-eclipse.geo.json"),
      // require("./world-data/2021-eclipse.geo.json"), // Antarctica not inhabited
      require("./world-data/2024-eclipse.geo.json"),
      require("./world-data/2026-eclipse.geo.json"),
      require("./world-data/2027-eclipse.geo.json"),
    ]

      var countries = topojson.feature(world, world.objects.countries).features,
          neighbors = topojson.neighbors(world.objects.countries.geometries);

      projection
        .fitSize([width, height], topojson.feature(world, world.objects.countries))
        .scale(198); // Stops clipping top and bottom strokes
        
      const path = geo.geoPath()
        .projection(projection);

      // Define an outline for the globe
      svg.append("defs").append("path")
          .datum({type: "Sphere"})
          .attr("id", "sphere")
          .attr("d", path);

      svg.append("use")
          .attr("class", styles.stroke)
          .attr("xlink:href", "#sphere");

      svg.append("use")
          .attr("class", styles.fill)
          .attr("xlink:href", "#sphere");


      // Draw the World
      var theWorld = svg.append("path")
      .datum(topojson.feature(world, world.objects.land))
      .attr("d", path)
      .attr('fill', 'white')
      .attr('stroke', 'black')
      .attr('stroke-width', 0.6);


          const widePathGroup = svg.append('g')
            .classed('eclipses', true)
            .selectAll('path')
            .data(eclipses)
            .enter().append('path')
            .attr('d', function (d) { return path(d.features[1].geometry)})
            .style('stroke', 'rgba(226, 122, 59, 0.8)')
            .style('stroke-width', 4)
            // .style('stroke-opacity', 0.5)
            .style('fill', 'none');
            // .style('fill-opacity', fillOpacity);

            // Put a rotate on the paths
            timer.timer(function() {
              var t = Date.now() - t0;
              projection.rotate([0.02 * t, 0]);
              widePathGroup.attr("d", function (d) { return path(d.features[1].geometry)});
              theWorld.attr("d", path);
            });
  }
  shouldComponentUpdate() {
    return false;
  }

  render() {

    return (
      <div id="world" className={"u-full " + styles.wrapper}>
        <div className={styles.responsiveContainer}>
          <div id="map" className={styles.scalingSvgContainer}
            style={"padding-bottom: " + height / width * 100 + "%"}></div>
        </div>
      </div>
    );
  }
}

module.exports = World;
