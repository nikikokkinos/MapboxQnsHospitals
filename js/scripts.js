mapboxgl.accessToken = 'pk.eyJ1IjoibmlraTEyc3RlcCIsImEiOiJjanZlNGFneWswMm0zNDRxcGYwZXYwcjl2In0.fWV3JfWN5hg9UFqDimwIZw';

// adding mapbox map
var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/niki12step/ck5zuk3tb03jw1io6ug5okx5k', // my style url
  zoom: 10.3,
  minZoom: 8,
  maxZoom: 18,
  center: [-73.832966,40.694523],
})

// adding zoom and panning control
var nav = new mapboxgl.NavigationControl()
map.addControl(nav, 'top-left')

// adding geocoder
map.addControl(new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    })
  )

var potentialHospitalsUrl = 'https://raw.githubusercontent.com/nikikokkinos/Data/master/PotentialHospitalLocationsQN.geojson'
var currentHospitalsUrl = 'https://raw.githubusercontent.com/nikikokkinos/Data/master/QnsHospitals.geojson'
var demolishedHospitalsUrl = 'https://raw.githubusercontent.com/nikikokkinos/Data/master/QnsDemolishedHospitals.geojson'

var hoveredHospitalId = null
var hoveredCurrentId = null
var hoveredDemolishedId = null

var markerHeight = 20, markerRadius = 10, linearOffset = 25;
var popupOffsets = {
  'top': [0, 0],
  'top-left': [0,0],
  'top-right': [0,0],
  'bottom': [0, -markerHeight],
  'bottom-left': [linearOffset, (markerHeight - markerRadius + linearOffset) * -1],
  'bottom-right': [-linearOffset, (markerHeight - markerRadius + linearOffset) * -1],
  'left': [markerRadius, (markerHeight - markerRadius) * -1],
  'right': [-markerRadius, (markerHeight - markerRadius) * -1]
}

map.on('load', function() {

  map.addSource('potentialhospitals', {
    'type': 'geojson',
    'data': potentialHospitalsUrl,
    'generateId': true
  })

  map.addSource('currentHospitals', {
    'type': 'geojson',
    'data': currentHospitalsUrl,
    'generateId': true
  })

  map.addSource('demolishedHospitals', {
    'type': 'geojson',
    'data': demolishedHospitalsUrl,
    'generateId': true
  })

  map.addLayer({
    'id': 'potentialHospitals',
    'type': 'fill',
    'source': 'potentialhospitals',
    'layout': {},
    'paint': {
    'fill-color': '#088',
    'fill-opacity':         [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          .5,
          1
        ]
    }
    })

  map.on('click', 'potentialHospitals', function (e) {

    var polygon = e.features[0].geometry.coordinates;
    var fit = new L.Polygon(polygon).getBounds();
    var southWest = new mapboxgl.LngLat(fit['_southWest']['lat'], fit['_southWest']['lng']);
    var northEast = new mapboxgl.LngLat(fit['_northEast']['lat'], fit['_northEast']['lng']);
    var center = new mapboxgl.LngLatBounds(southWest, northEast).getCenter();
    map.fitBounds(new mapboxgl.LngLatBounds(southWest, northEast));
  })

  map.on('mousemove', 'potentialHospitals', function(e) {
    map.getCanvas().style.cursor = 'pointer'
    if (e.features.length > 0) {
      if (hoveredHospitalId) {
      map.setFeatureState(
      { source: 'potentialhospitals', id: hoveredHospitalId },
      { hover: false }
      )
      }
      hoveredHospitalId = e.features[0].id;
      map.setFeatureState(
      { source: 'potentialhospitals', id: hoveredHospitalId },
      { hover: true }
      )
      }
    })

  map.on('mouseleave', 'potentialHospitals', function() {

    if (hoveredHospitalId) {
      map.setFeatureState(
      { source: 'potentialhospitals', id: hoveredHospitalId },
      { hover: false }
      )
      }
      hoveredHospitalId = null
    })

    // grabbing the html div holding the busridershipstatbox
    var address = document.getElementById('address')
    var owner = document.getElementById('owner')
    var sf = document.getElementById('sf')
    var front = document.getElementById('LotFront')
    var depth = document.getElementById('LotDepth')
    var use = document.getElementById('use')


    map.on('mouseenter', 'potentialHospitals', (e) => {
      map.getCanvas().style.cursor = 'pointer'

      // grabbing the properties from Hospitals source
      var addressDisplay = e.features[0].properties.Address
      var ownerDisplay = e.features[0].properties.OwnerName
      var sfDisplay = e.features[0].properties.LotArea
      var frontDisplay = e.features[0].properties.LotFront
      var depthDisplay = e.features[0].properties.LotDepth
      var useDisplay = e.features[0].properties.LandUse

      // loop text content is shown on mouseenter
      if (e.features.length > 0) {
        address.textContent = addressDisplay
        owner.textContent = ownerDisplay
        sf.textContent = sfDisplay + ' ' + 'sf'
        front.textContent = frontDisplay + ' ' + 'sf'
        depth.textContent = depthDisplay + ' ' + 'sf'
        use.textContent = useDisplay
      }

      if (use.textContent == '10') {
        use.textContent = 'Parking'
      } else { use.textContent = 'Vacant' }

      map.on('mouseleave', 'potentialHospitals', function() {
        // Remove the information from the previously hovered feature from the sidebar
        address.textContent = ''
        owner.textContent = ''
        sf.textContent = ''
        front.textContent = ''
        depth.textContent = ''
        use.textContent = ''

        // Reset the cursor style
        map.getCanvas().style.cursor = ''
      })
    })

  map.addLayer({
    'id': 'currentHospitals',
    'type': 'circle',
    'source': 'currentHospitals',
    // 'layout': {
    //   'visibility': 'none',
    // },
    'paint': {
      'circle-radius':
      [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        11,
        7
      ],
      'circle-color': '#9c6dad'
    }
  })

  var currentHospitalsPopup = new mapboxgl.Popup({
    offset: popupOffsets,
    closeButton: false,
    closeOnClick: false
  })

  map.on('click', 'currentHospitals', function(e) {

  var currentHospitalsHTML = e.features[0].properties.Facility_Name

  currentHospitalsPopup
    .setLngLat(e.lngLat)
    .setHTML( currentHospitalsHTML )
    .addTo(map)
  })

  map.on('mouseleave', 'currentHospitals', function() {
    map.getCanvas().style.cursor = '';
    currentHospitalsPopup.remove();
  })

  map.on('mousemove', 'currentHospitals', function(e) {
    map.getCanvas().style.cursor = 'pointer'
    if (e.features.length > 0) {
      if (hoveredCurrentId) {
      map.setFeatureState(
      { source: 'currentHospitals', id: hoveredCurrentId },
      { hover: false }
      )
      }
      hoveredCurrentId = e.features[0].id;
      map.setFeatureState(
      { source: 'currentHospitals', id: hoveredCurrentId },
      { hover: true }
      )
      }
    })

  map.on('mouseleave', 'currentHospitals', function() {

    if (hoveredCurrentId) {
      map.setFeatureState(
      { source: 'currentHospitals', id: hoveredCurrentId },
      { hover: false }
      )
      }
      hoveredCurrentId = null
    })

  map.addLayer({
    'id': 'demolishedHospitals',
    'type': 'circle',
    'source': 'demolishedHospitals',
    // 'layout': {
    //   'visibility': 'none',
    // },
    'paint': {
      'circle-radius':
      [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        11,
        7
      ],
      'circle-color': '#8c3c3c'
    }
  })

  var demolishedHospitalsPopup = new mapboxgl.Popup({
    offset: popupOffsets,
    closeButton: false,
    closeOnClick: false
  })

  map.on('click', 'demolishedHospitals', function(e) {

  var demolishedHospitalsHTML = e.features[0].properties.ownerName + '<br >' + e.features[0].properties.address

  demolishedHospitalsPopup
    .setLngLat(e.lngLat)
    .setHTML( demolishedHospitalsHTML )
    .addTo(map)
  })

  map.on('mouseleave', 'demolishedHospitals', function() {
    map.getCanvas().style.cursor = '';
    demolishedHospitalsPopup.remove();
  })

  map.on('mousemove', 'demolishedHospitals', function(e) {
    map.getCanvas().style.cursor = 'pointer'
    if (e.features.length > 0) {
      if (hoveredDemolishedId) {
      map.setFeatureState(
      { source: 'demolishedHospitals', id: hoveredDemolishedId },
      { hover: false }
      )
      }
      hoveredDemolishedId = e.features[0].id;
      map.setFeatureState(
      { source: 'demolishedHospitals', id: hoveredDemolishedId },
      { hover: true }
      )
      }
    })

  map.on('mouseleave', 'demolishedHospitals', function() {

    if (hoveredDemolishedId) {
      map.setFeatureState(
      { source: 'demolishedHospitals', id: hoveredDemolishedId },
      { hover: false }
      )
      }
      hoveredDemolishedId = null
    })

})
