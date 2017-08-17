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
        height = 600,
        maxWidth = 1000,
        fillOpacity = 0.7,
        worldColor = '#444';

// Set up a D3 procection here 
var projection = geoProj.geoKavrayskiy7()
  .scale(170)
  .translate([width / 2, height / 2])
  .precision(.1);

class World extends Preact.Component {
  componentWillMount() {

  }
  componentDidMount() {
    const svg = select.select("#world #map")
      .append("svg")
      .classed(styles.scalingSvg, true)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr('viewBox', `0, 0, ${+width}, ${+height}`)
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
    const loadWorld = promiseLoadJSON("world.topo.json");

    // After Australia loaded do this
    loadWorld.then(function (world) {
      console.log(world)
      var countries = topojson.feature(world, world.objects.countries).features,
          neighbors = topojson.neighbors(world.objects.countries.geometries);

      projection
        .fitSize([width, height], neighbors)
        // .scale(200)
        // .translate([300, 100]);
        
      const path = geo.geoPath()
        .projection(projection);

      // Let's create a clipper cutter path
      // svg.append('clipPath')
      //   .attr('id', 'aus-clip')
      //   .selectAll("path")
      //   .data(australiaGeoJSON.features)
      //   .enter().append("path")
      //   .attr("d", path);

      // Draw Australia
      const group = svg.append("g")
        .classed("states", "true")
        .selectAll("path")
        .data(neighbors)
        .enter().append("path")
        .attr("d", path)
        .attr('fill', australiaColor);



    

    });
  }
  shouldComponentUpdate() {
    return false;
  }

  render() {

    return (
      <div id="world" className={"u-full " + styles.wrapper}>
        <div className={styles.responsiveContainer}>
          <div id="map" className={styles.scalingSvgContainer}></div>
        </div>
      </div>
    );
  }
}

module.exports = World;
