const Preact = require("preact");
const topojson = require("topojson");
// const topoClient = require("topojson-client")
const select = require("d3-selection");
const geo = require('d3-geo');
const request = require('d3-request');
const shape = require('d3-shape');
const scale = require('d3-scale');

const styles = require("./australia.scss");

const   width = 800,
        height = 550,
        maxWidth = 600,
        fillOpacity = 0.5,
        australiaColor = 'white',
        // eclipseColor = 'CORNFLOWERBLUE',  // Now using color scales instead of this
        labelColor = "#2E3638",
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
    // const loadAus = promiseLoadJSON("./aus-data/australia.topo.json");

    const australia = require('./aus-data/australia-simple.topo.json');
    const australiaGEO = require('./aus-data/australia.geo.json');

    const eclipses = [
        require("./aus-data/2028-eclipse.geo.json"),
        require("./aus-data/2030-eclipse.geo.json"),
        require("./aus-data/2037-eclipse.geo.json"),
        require("./aus-data/2038-eclipse.geo.json"),
        require("./aus-data/2066-eclipse.geo.json"),
        require("./aus-data/2068-eclipse.geo.json"),
        require("./aus-data/2077-eclipse.geo.json"),
        require("./aus-data/2093-eclipse.geo.json")
       ];

    // After Australia loaded do this
    // loadAus.then(function (australia) {
      const australiaGeoJSON = topojson.feature(australia, australia.objects.states);

      projection
        .fitSize([width, height], australiaGEO)
        // .scale(200)
        .center([0.9, 0]); // Push a bit so not to cut off labels
        
      const path = geo.geoPath()
        .projection(projection);

      // Let's create a clipper cutter path
      svg.append('clipPath')
        .attr('id', 'ausClip')
        .selectAll("path")
        .data(australiaGEO.features)
        .enter().append("path")
        .attr("d", path)
        .attr('clipPathUnits', 'objectBoundingBox');

      // Draw Australia
      const group = svg.append("g")
        .classed("states", "true")
        .selectAll("path")
        .data(australiaGEO.features)
        .enter().append("path")
        .attr("d", path)
        .attr('fill', australiaColor)
        .attr('stroke', '#5C6C70')
        .attr('stroke-width', '2px');


      // Rearrange data for wide paths
    for (let i = 0; i < eclipses.length; i++) {

      // Hacky way of joining both outer paths together to make a wide path
      // Maybe use rect or something for this to be better
      eclipses[i].features[0].geometry.coordinates = eclipses[i].features[0].geometry.coordinates
        .concat(eclipses[i].features[2].geometry.coordinates.reverse());
    }

    const widePathGroup = svg.append('g')
      .classed('eclipses', true)
      // .style('-webkit-clip-path', 'url(#ausClip)') // this breaks iOS
      .attr('clip-path', 'url(#ausClip)')
      .selectAll('path')
      .data(eclipses)
      .enter()
      .append('path')
      .attr('d', function (d) { return path(d.features[0].geometry)})
      .style('fill', function (d) { return d.color })
      .style('fill-opacity', fillOpacity);

    // Draw an invisible mid path
    const midPath = svg.append('g')
      .selectAll('path')
      .data(eclipses)
      .enter()
      .append('path')
      .attr('d', function (d) { return path(d.features[1].geometry)})
      .attr('id', function (d, i) {return 'path-' + i})
      .style('fill', 'none')

    // Labels to put on the mid path
    const yearText = svg.append('g')
      .selectAll('text')
      .data(eclipses)
      .enter()
      .append('text')
      .classed(styles.yearLabels, true)
      .attr('dy', labelFontSize * 0.4)
      .attr('alignment-baseline', 'alphabetical')
      .append('textPath')
      .attr('xlink:href', function (d, i) {return '#path-' + i } )
      .attr('startOffset', function (d) { return d.labelOffset + "%" } )
      .text( function (d) { return d.label })
      .style('fill', function (d) { return d.color })
      // .style('font-size', labelFontSize + "px") // Moved to CSS
      .style('font-weight', 'bold')
      .style('font-family', '"ABCSans","Interval Sans Pro",Arial,Helvetica,sans-serif');



      // A small dataset of cities to map
      const cities = [
        {
          name: "Gold Coast",
          coordinates: [
            153.400940,
            -28.003268
          ],
          textAnchor: "end",
          offset: [
            -12,
            0
          ]
        },
        {
          name: "Sydney",
          coordinates: [
            151.209900,
            -33.865143
          ],
          textAnchor: "end",
          offset: [
            -12,
            0
          ]
        },
        {
          name: "Yardea",
          coordinates: [
            135.465907,
            -32.2796585
          ],
          textAnchor: "middle",
          offset: [
            0,
            -16
          ]
        },
        // {
        //   name: "Buckleboo",
        //   coordinates: [
        //     135.8469561,
        //     -32.7706229
        //   ],
        //   textAnchor: "middle",
        //   offset: [
        //     0,
        //     -16
        //   ]
        // },
        {
          name: "Alice Springs",
          coordinates: [
            133.8806114,
            -23.7002104
          ],
          textAnchor: "middle",
          offset: [
            0,
            -16
          ]
        },
        {
          name: "Perth",
          coordinates: [
            115.6806677,
            -32.0397544
          ],
          textAnchor: "start",
          offset: [
            8,
            0
          ]
        }
    ];

      // console.log(projection(cities.coordinates));

      // svg.append('path')
      //   .attr('d', path(cityList.cities[0].geometry))
      //   .style('fill', 'black')
      //   .style('fill-opacity', 1);

    cities.forEach(function(city) {
      svg.append('circle')
        .attr('cx', projection(city.coordinates)[0])
        .attr('cy', projection(city.coordinates)[1])
        .attr('r', 6)
        .attr('fill', '#2E3638');

      svg.append('circle')
        .attr('cx', projection(city.coordinates)[0])
        .attr('cy', projection(city.coordinates)[1])
        .attr('r', 4)
        .attr('fill', 'white');

      svg.append('text')
        .classed(styles.placeNames, true)
        .attr('x', projection(city.coordinates)[0])
        .attr('y', projection(city.coordinates)[1])
        .attr('dx', city.offset[0])
        .attr('dy', city.offset[1])
        .text(city.name)
        .attr('text-anchor', city.textAnchor);
    }, this);


      
  }
  shouldComponentUpdate() {
    return false;
  }

  render() {

    return (
      <div id="australia" className={"u-full " + styles.wrapper}>
        <div className={styles.key}>
        {/* <img src="http://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Bubbles_in_the_park%2C_Barcelona_%284983834120%29.jpg/636px-Bubbles_in_the_park%2C_Barcelona_%284983834120%29.jpg" /> */}
          <div style="margin-right: 20%;">
            Within the next 50 years
            <br />
            <svg width="50" height="10">
              <rect width="50" height="10" style="fill:rgba(226, 122, 59, 0.5)" />
            </svg>
          </div>
          <div>
            Within the next 100 years
            <br />
            <svg width="50" height="10">
              <rect width="50" height="10" style="fill:rgba(59, 195, 226, 0.5)" />
            </svg>
          </div>
        </div>
        <div className={styles.responsiveContainer}>
          <div id="map" className={styles.scalingSvgContainer}
            style={"padding-bottom: " + height / width * 100 + "%"}></div>
        </div>
      </div>
    );
  }
}

module.exports = Australia;
