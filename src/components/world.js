const Preact = require("preact");
const topojson = require("topojson");
const select = require("d3-selection");
const geo = require('d3-geo');
const request = require('d3-request');
const shape = require('d3-shape');
const scale = require('d3-scale');
const geoProj = require('d3-geo-projection');

const styles = require("./world.scss");

const   width = 670,
        height = 400,
        maxWidth = 1000,
        fillOpacity = 0.7,
        worldColor = '#444';

// Set up a D3 procection here 
var projection = geoProj.geoFahey()
  .scale(170)
  .translate([width / 2, height / 2])
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
      // .style('min-height', '400px')
      // .style('width', '100vw')
      // .style('max-width', maxWidth + 'px');

    // Fix for firefox blend mode bug
    /*
     *
     * USING CLIP-PATH NOW SO NO LONGER NEEDED
     * 
     */
    // svg.append('rect')
    //   .attr('width', width + 1)
    //   .attr('height', height + 1)
    //   .attr('fill', '#f9f9f9');

    // Just testing wrapping D3 request in a promise
    function promiseLoadJSON (url) {
      return new Promise(function(resolve, reject) {
        request.json(url, function(error, result) {
          if(error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });
    };

    // Load our data using Promises
    const loadWorld = promiseLoadJSON("world-data/world.topo.json");

    // After Australia loaded do this
    loadWorld.then(function (world) {
      var countries = topojson.feature(world, world.objects.countries).features,
          neighbors = topojson.neighbors(world.objects.countries.geometries);

      projection
        .fitSize([width, height], topojson.feature(world, world.objects.countries))
        
      const path = geo.geoPath()
        .projection(projection);


      // Draw the World
      const group = svg.append("g")
        .classed("countries", "true")
        .selectAll("path")
        .data(countries)
        .enter().append("path")
        .attr("d", path)
        .attr('fill', worldColor);

        // Load ALL the files
        return Promise.all([
          promiseLoadJSON("world-data/2019-eclipse.geo.json"),
          promiseLoadJSON("world-data/2020-eclipse.geo.json"),
          promiseLoadJSON("world-data/2021-eclipse.geo.json"),
          promiseLoadJSON("world-data/2024-eclipse.geo.json"),
          promiseLoadJSON("world-data/2026-eclipse.geo.json"),
          promiseLoadJSON("world-data/2027-eclipse.geo.json"),
          // promiseLoadJSON("2077-eclipse.geo.json"),
          // promiseLoadJSON("2093-eclipse.geo.json")
        ]);
      }).then(function (values) {
        values.forEach(function(eclipse, i) {
          const path = geo.geoPath()
            .projection(projection);

          // Hacky way of joining both outer paths together to make a wide path
          eclipse.features[0].geometry.coordinates = eclipse.features[0].geometry.coordinates
            .concat(eclipse.features[2].geometry.coordinates.reverse());

          // Draw each path
          const widePath = svg
            .append('path')
            .attr('d', path(eclipse.features[0].geometry))
            .style('fill', "orange")
            .style('fill-opacity', fillOpacity);

          // Draw a mid path
          const midPath = svg
            .append('path')
            .attr('d', path(eclipse.features[1].geometry))
            .attr('id', 'path-' + i)
            .style('fill', 'none')
            // .style('stroke', 'orange');

            // Labels to put on the mid path
          // const yearText = svg
          //   .append('text')
          //   .attr('dy', labelFontSize * 0.4)
          //   .attr('alignment-baseline', 'alphabetical')
          //   .append('textPath')
          //   .attr('xlink:href', '#path-' + i)
          //   .attr('startOffset', eclipse.labelOffset + "%")
          //   .text(eclipse.year)
          //   .style('fill', labelColor)
          //   .style('font-size', labelFontSize + "px")
          //   .style('font-weight', 'bold')
          //   .style('font-family', 'Helvetica,Arial,sans-serif')
          //   .append('tspan')
          //   .attr('dy', -1)
          //   .text(' →');

          }, this);

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
