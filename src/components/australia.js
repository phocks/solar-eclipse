const Preact = require("preact");
const topojson = require("topojson");
const select = require("d3-selection");
const geo = require('d3-geo');
const request = require('d3-request');
const shape = require('d3-shape');
const scale = require('d3-scale')

const styles = require("./australia.scss");

const   width = 670,
        height = 600,
        maxWidth = 1000,
        fillOpacity = 0.7,
        australiaColor = '#444',
        // eclipseColor = 'CORNFLOWERBLUE',  // Now using color scales instead of this
        labelColor = "#aaa",
        labelFontSize = 12;

// Set up a D3 procection here first to use on both australia and the eclipse path
const projection = geo.geoConicConformal()
  .rotate([-132, 0])
  .parallels([-18, -36]);
  // .scale(600)
  // .translate([300, 0]);
  // .fitSize([width, height], australiaGeoJSON);

// Set up our color scale
const colorScale = scale.scaleLinear()
  .domain([2017,2117])
  .range(['MEDIUMSEAGREEN', 'SLATEBLUE']);

class Australia extends Preact.Component {
  componentWillMount() {

  }
  componentDidMount() {
    const svg = select.select("#australia #map")
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
    const loadAus = promiseLoadJSON("australia.topo.json");

    // After Australia loaded do this
    loadAus.then(function (australia) {
      const australiaGeoJSON = topojson.feature(australia, australia.objects.states);

      projection
        .fitSize([width, height], australiaGeoJSON)
        // .scale(200)
        // .translate([300, 100]);
        
      const path = geo.geoPath()
        .projection(projection);

      // Let's create a clipper cutter path
      svg.append('clipPath')
        .attr('id', 'aus-clip')
        .selectAll("path")
        .data(australiaGeoJSON.features)
        .enter().append("path")
        .attr("d", path);

      // Draw Australia
      const group = svg.append("g")
        .classed("states", "true")
        .selectAll("path")
        .data(australiaGeoJSON.features)
        .enter().append("path")
        .attr("d", path)
        .attr('fill', australiaColor)
        .attr('stroke', '#444');

      // Load ALL the files
      return Promise.all([
        promiseLoadJSON("2028-eclipse.geo.json"),
        promiseLoadJSON("2030-eclipse.geo.json"),
        promiseLoadJSON("2037-eclipse.geo.json"),
        promiseLoadJSON("2038-eclipse.geo.json"),
        promiseLoadJSON("2066-eclipse.geo.json"),
        promiseLoadJSON("2068-eclipse.geo.json"),
        promiseLoadJSON("2077-eclipse.geo.json"),
        promiseLoadJSON("2093-eclipse.geo.json")
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
          .attr('stroke-width', width / 100)
          .attr('clip-path', 'url(#aus-clip)')
          .style('fill', colorScale(eclipse.year))
          .style('fill-opacity', fillOpacity);

        // Draw an invisible mid path
        const midPath = svg
          .append('path')
          .attr('d', path(eclipse.features[1].geometry))
          .attr('id', 'path-' + i)
          .style('fill', 'none')

          // Labels to put on the mid path
        const yearText = svg
          .append('text')
          .attr('dy', labelFontSize * 0.4)
          .attr('alignment-baseline', 'alphabetical')
          .append('textPath')
          .attr('xlink:href', '#path-' + i)
          .attr('startOffset', eclipse.labelOffset + "%")
          .text(eclipse.year)
          .style('fill', labelColor)
          .style('font-size', labelFontSize + "px")
          .style('font-weight', 'bold')
          .style('font-family', 'Helvetica,Arial,sans-serif')
          .append('tspan')
          .attr('dy', -1)
          .text(' →');

        }, this);

        const path = geo.geoPath()
          .projection(projection);

        const cityList = {
          "cities": [
            {
              "type": "Feature",
              "properties": {
                  "name": "Gold Coast",
                  "cmt": "",
                  "sym": ""
              },
              "geometry": {
                  "type": "Point",
                  "coordinates": [
                    153.400940,
                    -28.003268
                ]
              }
            }
          ]
        };

      
      const cities = {
        name: "Gold Coast",
        coordinates: [153.400940,
        -28.003268]
      };

      // console.log(projection(cities.coordinates));

      svg.append('path')
        .attr('d', path(cityList.cities[0].geometry))
        .style('fill', 'black')
        .style('fill-opacity', 1);

      svg.append('circle')
        .attr('cx', projection(cities.coordinates)[0])
        .attr('cy', projection(cities.coordinates)[1])
        .attr('r', 3)
        .attr('fill', 'white');


    });
  }
  shouldComponentUpdate() {
    return false;
  }

  render() {

    return (
      <div id="australia" className={"u-full " + styles.wrapper}>
        <div className={styles.responsiveContainer}>
          <div id="map" className={styles.scalingSvgContainer}></div>
        </div>
      </div>
    );
  }
}

module.exports = Australia;
