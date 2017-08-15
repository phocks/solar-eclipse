const Preact = require("preact");
const topojson = require("topojson");
const select = require("d3-selection");
const geo = require('d3-geo');
const request = require('d3-request');
const shape = require('d3-shape');

const   width = 150,
        height = 100,
        maxWidth = 1000,
        strokeOpacity = 0.0,
        fillOpacity = 0.2,
        australiaColor = 'thistle',
        eclipseColor = 'DARKSLATEGRAY';

// Set up a D3 procection here first to use on both australia and the eclipse path
const projection = geo.geoConicConformal()
  .rotate([-132, 0])
  .parallels([-18, -36]);
  // .scale(600)
  // .translate([300, 0]);
  // .fitSize([width, height], australiaGeoJSON);

class Australia extends Preact.Component {
  componentWillMount() {

  }
  componentDidMount() {
    const svg = select.select("#map").append("svg")
      .attr("width", "100%")
      // .attr("height", height);
      .attr('viewBox', `0, 0, ${+width}, ${+height}`)
      .style('max-width', maxWidth + 'px');

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

    const load2028 = promiseLoadJSON("2028-eclipse.geo.json");
    const load2030 = promiseLoadJSON("2030-eclipse.geo.json");
    const load2037 = promiseLoadJSON("2037-eclipse.geo.json");
    const load2038 = promiseLoadJSON("2038-eclipse.geo.json");
    const load2066 = promiseLoadJSON("2066-eclipse.geo.json");
    const load2068 = promiseLoadJSON("2068-eclipse.geo.json");
    const load2077 = promiseLoadJSON("2077-eclipse.geo.json");
    const load2093 = promiseLoadJSON("2093-eclipse.geo.json");

    // After Australia loaded do this
    loadAus.then(function (australia) {
      const australiaGeoJSON = topojson.feature(australia, australia.objects.states);
      projection
        .fitSize([width, height], australiaGeoJSON);
        
      const path = geo.geoPath()
        .projection(projection);

      const group = svg.append("g")
        .classed("states", "true")
        .selectAll("path")
        .data(australiaGeoJSON.features)
        .enter().append("path")
        .attr("d", path)
        .attr('fill', australiaColor);

      // Load all the files
      return Promise.all([
        load2028,
        load2030,
        load2037,
        load2038,
        load2066,
        load2068,
        load2077,
        load2093]);
    }).then(function (values) {
      values.forEach(function(eclipse) {
        const path = geo.geoPath()
          .projection(projection);

        eclipse.features[0].geometry.coordinates = eclipse.features[0].geometry.coordinates
          .concat(eclipse.features[2].geometry.coordinates.reverse());

        const widePath = svg
          .append('path')
          .attr('d', path(eclipse.features[0].geometry))
          .attr('stroke-width', width / 1000)
          .style('fill', 'none')
          .style("stroke", eclipseColor)
          .style('stroke-opacity', strokeOpacity)
          .style('fill', eclipseColor)
          .style('fill-opacity', fillOpacity);
      }, this);
    });

      
      // Return a promise and the next then fires
      // Is this the best way to control svg draw order?
    //   return promiseLoadJSON("2028-eclipse.geo.json");
    // }).then(function (eclipse) {
    //   const path = geo.geoPath()
    //     .projection(projection);

    //     eclipse.features[0].geometry.coordinates = eclipse.features[0].geometry.coordinates.concat(eclipse.features[2].geometry.coordinates.reverse());
        
    //     const widePath = svg
    //       .append('path')
    //       .attr('d', path(eclipse.features[0].geometry))
    //       .attr('stroke-width', width / 1000)
    //       .style('fill', 'none')
    //       .style("stroke", eclipseColor)
    //       .style('stroke-opacity', strokeOpacity)
    //       .style('fill', eclipseColor)
    //       .style('fill-opacity', fillOpacity);

    //   return promiseLoadJSON("2030-eclipse.geo.json");
    // }).then(function (eclipse) {
    //   const path = geo.geoPath()
    //     .projection(projection);

    //     eclipse.features[0].geometry.coordinates = eclipse.features[0].geometry.coordinates.concat(eclipse.features[2].geometry.coordinates.reverse());
        
    //     const widePath = svg
    //       .append('path')
    //       .attr('d', path(eclipse.features[0].geometry))
    //       .attr('stroke-width', width / 1000)
    //       .style('fill', 'none')
    //       .style("stroke", eclipseColor)
    //       .style('stroke-opacity', strokeOpacity)
    //       .style('fill', eclipseColor)
    //       .style('fill-opacity', fillOpacity);

    //   return promiseLoadJSON("2037-eclipse.geo.json");
    // }).then(function (eclipse) {
    //   const path = geo.geoPath()
    //     .projection(projection);

    //     eclipse.features[0].geometry.coordinates = eclipse.features[0].geometry.coordinates.concat(eclipse.features[2].geometry.coordinates.reverse());
        
    //     const widePath = svg
    //       .append('path')
    //       .attr('d', path(eclipse.features[0].geometry))
    //       .attr('stroke-width', width / 1000)
    //       .style('fill', 'none')
    //       .style("stroke", eclipseColor)
    //       .style('stroke-opacity', strokeOpacity)
    //       .style('fill', eclipseColor)
    //       .style('fill-opacity', fillOpacity);

    //     return promiseLoadJSON("2038-eclipse.geo.json");
    //   }).then(function (eclipse) {
    //     const path = geo.geoPath()
    //       .projection(projection);

    //     eclipse.features[0].geometry.coordinates = eclipse.features[0].geometry.coordinates.concat(eclipse.features[2].geometry.coordinates.reverse());

    //     const widePath = svg
    //       .append('path')
    //       .attr('d', path(eclipse.features[0].geometry))
    //       .attr('stroke-width', width / 1000)
    //       .style('fill', 'none')
    //       .style("stroke", eclipseColor)
    //       .style('stroke-opacity', strokeOpacity)
    //       .style('fill', eclipseColor)
    //       .style('fill-opacity', fillOpacity);

    //     return promiseLoadJSON("2066-eclipse.geo.json");
    //   }).then(function (eclipse) {
    //     const path = geo.geoPath()
    //       .projection(projection);

    //     eclipse.features[0].geometry.coordinates = eclipse.features[0].geometry.coordinates.concat(eclipse.features[2].geometry.coordinates.reverse());

    //     const widePath = svg
    //       .append('path')
    //       .attr('d', path(eclipse.features[0].geometry))
    //       .attr('stroke-width', width / 1000)
    //       .style('fill', 'none')
    //       .style("stroke", eclipseColor)
    //       .style('stroke-opacity', strokeOpacity)
    //       .style('fill', eclipseColor)
    //       .style('fill-opacity', fillOpacity);
        
    //     return promiseLoadJSON("2068-eclipse.geo.json");
    //   }).then(function (eclipse) {
    //     const path = geo.geoPath()
    //       .projection(projection);

    //     eclipse.features[0].geometry.coordinates = eclipse.features[0].geometry.coordinates.concat(eclipse.features[2].geometry.coordinates.reverse());

    //     const widePath = svg
    //       .append('path')
    //       .attr('d', path(eclipse.features[0].geometry))
    //       .attr('stroke-width', width / 1000)
    //       .style('fill', 'none')
    //       .style("stroke", eclipseColor)
    //       .style('stroke-opacity', strokeOpacity)
    //       .style('fill', eclipseColor)
    //       .style('fill-opacity', fillOpacity);

    //     return promiseLoadJSON("2077-eclipse.geo.json");
    //     }).then(function (eclipse) {
    //     const path = geo.geoPath()
    //       .projection(projection);

    //     eclipse.features[0].geometry.coordinates = eclipse.features[0].geometry.coordinates.concat(eclipse.features[2].geometry.coordinates.reverse());

    //     const widePath = svg
    //       .append('path')
    //       .attr('d', path(eclipse.features[0].geometry))
    //       .attr('stroke-width', width / 1000)
    //       .style('fill', 'none')
    //       .style("stroke", eclipseColor)
    //       .style('stroke-opacity', strokeOpacity)
    //       .style('fill', eclipseColor)
    //       .style('fill-opacity', fillOpacity);

    //     return promiseLoadJSON("2093-eclipse.geo.json");
    //     }).then(function (eclipse) {
    //     const path = geo.geoPath()
    //       .projection(projection);

    //     eclipse.features[0].geometry.coordinates = eclipse.features[0].geometry.coordinates.concat(eclipse.features[2].geometry.coordinates.reverse());

    //     const widePath = svg
    //       .append('path')
    //       .attr('d', path(eclipse.features[0].geometry))
    //       .attr('stroke-width', width / 1000)
    //       .style('fill', 'none')
    //       .style("stroke", eclipseColor)
    //       .style('stroke-opacity', strokeOpacity)
    //       .style('fill', eclipseColor)
    //       .style('fill-opacity', fillOpacity);
    // });

    // // After eclipse loaded do this
    // load2028.then(function (eclipse) {
    //   var path = geo.geoPath()
    //     .projection(projection);

    //     const widePath = svg
    //       .append('path')
    //       .attr('d', path(eclipse.features[1].geometry))
    //       .attr('stroke-width', 30)
    //       .style('fill', 'none')
    //       .style("stroke", "orange")
    //       .style('stroke-opacity', 0.5);
    // });

      // For now we wait till Australia has rendered before loading the eclipse path
      // Can someone tell me a better way of fixing svg draw order?
      // request.json("eclipse.geo.json", function(error, eclipse) {
      //   if (error) throw error;

      //   console.log(eclipse.features[0].geometry);

      //   var path = geo.geoPath()
      //     .projection(projection);

      //   // const pathGroup = svg.append("g")
      //   //   .classed("states", "true")
      //   //   .selectAll("path")
      //   //   .data(eclipse.features)
      //   //   .enter().append("path")
      //   //   .attr("d", path)
      //   //   .attr('fill', 'none')
      //   //   .attr('stroke', 'blue');

      //   const testPath = svg
      //     .append('path')
      //     .attr('d', path(eclipse.features[1].geometry))
      //     .attr('stroke-width', 30)
      //     .style('fill', 'none')
      //     .style("stroke", "orange")
      //     .style('stroke-opacity', 0.5);
      // });
    // });
  }
  shouldComponentUpdate() {
    return false;
  }

  render() {
    const title = this.props.title;

    return (
      <div id="australia" class="u-full" style="text-align: center">
         <h2>{title}</h2> 
        <div id="map"></div>
      </div>
    );
  }
}

module.exports = Australia;
