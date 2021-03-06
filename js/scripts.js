mapboxgl.accessToken = 'pk.eyJ1IjoibmlraTEyc3RlcCIsImEiOiJjanZlNGFneWswMm0zNDRxcGYwZXYwcjl2In0.fWV3JfWN5hg9UFqDimwIZw';

// adding mapbox map
var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/niki12step/ck5ztjcqg0wb61iqteqyfu5cw', // my style url
  zoom: 10.3,
  minZoom: 8,
  maxZoom: 18,
  center: [-73.832966,40.694523],
})

// adding zoom and panning control
// var nav = new mapboxgl.NavigationControl()
// map.addControl(nav, 'top-right')


map.addControl(new MapboxDirections({
    accessToken: mapboxgl.accessToken
    }),
    'top-left'
  )

var potentialHospitalsUrl = 'https://raw.githubusercontent.com/nikikokkinos/Data/master/QnPlutoGovtLu1011La20000_2020.geojson'
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
    "filter":
      ['all',
        ['>=', ['get', 'LotFront'], 60],
        ['>=', ['get', 'LotDepth'], 100],
        ['==', ['get', 'Easements'], 0],
        ['!=', ['get', 'LotType'], '2'],
        ['!=', ['get', 'LotType'], '6'],
        ['!=', ['get', 'LotType'], '7'],
        ['!=', ['get', 'LotType'], '8'],
        ['!=', ['get', 'LotType'], '9'],
        ['!=', ['get', 'ZoneDist1'], 'PARK'],
        ['!=', ['get', 'ZoneDist2'], 'PARK'],
        ['!=', ['get', 'OwnerName'], 'STUDIO STREET'],
        ['!=', ['get', 'OwnerName'], 'NYC DEPARTMENT OF EDUCATION'],
        ['!=', ['get', 'OwnerName'], 'NYC DEPARTMENT OF PARKS AND RECREATION'],
        ['!=', ['get', 'OwnerName'], 'NYC HOUSING AUTHORITY'],
        ['!=', ['get', 'OwnerName'], 'NYC HOUSING PRESERVATION AND DEVELOPMENT']
      ],
      'paint': {
          'fill-color': '#e6dc55',
          'fill-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                .5,
                1
              ]
          }
    })

  map.on('click', 'potentialHospitals', function (e) {

    var polygon = e.features[0].geometry.coordinates
    var fit = new L.Polygon(polygon).getBounds()
    var southWest = new mapboxgl.LngLat(fit['_southWest']['lat'], fit['_southWest']['lng'])
    var northEast = new mapboxgl.LngLat(fit['_northEast']['lat'], fit['_northEast']['lng'])
    var center = new mapboxgl.LngLatBounds(southWest, northEast).getCenter()
    map.fitBounds(new mapboxgl.LngLatBounds(southWest, northEast))
  })

  map.on('mouseenter', 'potentialHospitals', function(e) {
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
    'layout': {
      'visibility': 'none',
    },
    'paint': {
      'circle-radius':
      [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        11,
        7
      ],
      'circle-opacity':
      [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        .5,
        1
      ],
      'circle-color': '#ba24ff'
    }
  })

  var currentHospitalsPopup = new mapboxgl.Popup({
    offset: popupOffsets,
    closeButton: false,
    closeOnClick: false
  })

  map.on('mouseenter', 'currentHospitals', function(e) {

  var currentHospitalsHTML = e.features[0].properties.Facility_Name + '<br >' + e.features[0].properties.Facility_Address_1

  currentHospitalsPopup
    .setLngLat(e.lngLat)
    .setHTML( currentHospitalsHTML )
    .addTo(map)
  })

  map.on('mouseleave', 'currentHospitals', function() {
    map.getCanvas().style.cursor = '';
    currentHospitalsPopup.remove();
  })

  map.on('mouseenter', 'currentHospitals', function(e) {
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
    'layout': {
      'visibility': 'none',
    },
    'paint': {
      'circle-radius':
      [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        11,
        7
      ],
      'circle-opacity':
      [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        .5,
        1
      ],
      'circle-color': '#ff2424'
    }
  })

  var demolishedHospitalsPopup = new mapboxgl.Popup({
    offset: popupOffsets,
    closeButton: false,
    closeOnClick: false
  })

  map.on('mouseenter', 'demolishedHospitals', function(e) {

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

  map.on('mouseenter', 'demolishedHospitals', function(e) {
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

    $('#layerToggleContainer').hover( function () {
      $('#layerToggle').css('visibility', 'visible'),
      $('#layerToggleContainer').css('visibility', 'hidden')
      }, function(){
      $('#layerToggle').css("visibility", "hidden"),
      $('#layerToggleContainer').css('visibility', 'visible')
    })

    $('#aboutBox').click( function () {
      $('#more').toggle()
    })

    var radioButton = $('#layerToggle')

    radioButton.on("click", function () {
      if (document.getElementById('potentialHospitals').checked) {
          map.setLayoutProperty('potentialHospitals', 'visibility', 'visible')
      } else { map.setLayoutProperty('potentialHospitals', 'visibility', 'none')
    } if (document.getElementById('currentHospitals').checked) {
          map.setLayoutProperty('currentHospitals', 'visibility', 'visible')
      } else { map.setLayoutProperty('currentHospitals', 'visibility', 'none')
    } if (document.getElementById('demolishedHospitals').checked) {
          map.setLayoutProperty('demolishedHospitals', 'visibility', 'visible')
      } else { map.setLayoutProperty('demolishedHospitals', 'visibility', 'none')}
    })
})
