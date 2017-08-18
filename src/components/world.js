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

    // Load our data 
    const world = require("./world-data/world-simple.topo.json");
    const eclipses = [
      require("./world-data/2019-eclipse.geo.json"),
      require("./world-data/2020-eclipse.geo.json"),
      // require("world-data/2021-eclipse.geo.json"), // Antarctica not inhabited
      require("./world-data/2024-eclipse.geo.json"),
      require("./world-data/2026-eclipse.geo.json"),
      require("./world-data/2027-eclipse.geo.json"),
    ]

    // After Australia loaded do this
    // loadWorld.then(function (world) {
      var countries = topojson.feature(world, world.objects.countries).features,
          neighbors = topojson.neighbors(world.objects.countries.geometries);

      projection
        .fitSize([width, height], topojson.feature(world, world.objects.countries))
        
      const path = geo.geoPath()
        .projection(projection);


      // Draw the World
      // const group = svg.append("g")
      //   .classed("countries", "true")
      //   .selectAll("path")
      //   .data(countries)
      //   .enter().append("path")
      //   .attr("d", path)
      //   .attr('fill', worldColor);

      var feature = svg.append("path")
      .datum(topojson.feature(world, world.objects.land))
      .attr("d", path);

      // Let's rotate all the paths
        

        // var feature = svg.selectAll("path");

        timer.timer(function() {
          var t = Date.now() - t0;
          projection.rotate([0.02 * t, 0]);
          feature.attr("d", path);
        });


        // Load ALL the files
        // return Promise.all([
        //   promiseLoadJSON("http://jb-mac.aus.aunty.abc.net.au:8000/world-data/2019-eclipse.geo.json"),
        //   promiseLoadJSON("http://jb-mac.aus.aunty.abc.net.au:8000/world-data/2020-eclipse.geo.json"),
        //   // promiseLoadJSON("world-data/2021-eclipse.geo.json"), // Antarctica not inhabited
        //   promiseLoadJSON("http://jb-mac.aus.aunty.abc.net.au:8000/world-data/2024-eclipse.geo.json"),
        //   promiseLoadJSON("http://jb-mac.aus.aunty.abc.net.au:8000/world-data/2026-eclipse.geo.json"),
        //   promiseLoadJSON("http://jb-mac.aus.aunty.abc.net.au:8000/world-data/2027-eclipse.geo.json"),
        // ]);
      // }).then(function (values) {
        // eclipses.forEach(function(eclipse, i) {
        //   const path = geo.geoPath()
        //     .projection(projection);

        //   // Hacky way of joining both outer paths together to make a wide path
        //   eclipse.features[0].geometry.coordinates = eclipse.features[0].geometry.coordinates
        //     .concat(eclipse.features[2].geometry.coordinates.reverse());
        //   }, this);

          const widePathGroup = svg.append('g')
            .classed('eclipses', true)
            .selectAll('path')
            .data(eclipses)
            .enter().append('path')
            .attr('d', function (d) { return path(d.features[1].geometry)})
            .style('stroke', 'orange')
            .style('fill', 'none');
            // .style('fill-opacity', fillOpacity);


            timer.timer(function() {
              var t = Date.now() - t0;
              projection.rotate([0.02 * t, 0]);
              widePathGroup.attr("d", path);
            });

          // Draw each path
          // const widePath = svg
          //   .append('path')
          //   .attr('d', path(eclipse.features[0].geometry))
          //   .style('fill', "orange")
          //   .style('fill-opacity', fillOpacity);

          // Draw a mid path
          // const midPath = svg
            // .append('path')
            // .attr('d', path(eclipse.features[1].geometry))
            // .attr('id', 'path-' + i)
            // .style('fill', 'none')
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

          

        // Let's rotate all the paths
        // var t0 = Date.now();

        // var feature = svg.selectAll("path");

        // timer.timer(function() {
        //   var t = Date.now() - t0;
        //   projection.rotate([0.01 * t, 0]);
        //   feature.attr("d", path);
        // });



    // });
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
