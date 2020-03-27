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

var hospitalUrl = 'https://raw.githubusercontent.com/nikikokkinos/Data/master/PotentialHospitalLocationsQN.geojson'
var hoveredHospitalId = null

map.on('load', function() {

  map.addSource('potentialhospitals', {
    'type': 'geojson',
    'data': hospitalUrl,
    'generateId': true
  })

  map.addLayer({
    'id': 'Hospitals',
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

  // map.on('click', 'Hospitals', function (e) {
  //
  //   var bounds = e.features[0].geometry.coordinates
  //
  //   map.fitBounds({bounds})
  //   // var bounds = map.getSource('potentialhospitals').bounds;
  //   // map.fitBounds(bounds);
  // })

    map.on('mousemove', 'Hospitals', function(e) {
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

    map.on('mouseleave', 'Hospitals', function() {

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
    var use = document.getElementById('use')


    map.on('mouseenter', 'Hospitals', (e) => {
      map.getCanvas().style.cursor = 'pointer'

      // grabbing the properties from Hospitals source
      var addressDisplay = e.features[0].properties.Address
      var ownerDisplay = e.features[0].properties.OwnerName
      var sfDisplay = e.features[0].properties.LotArea
      var useDisplay = e.features[0].properties.LandUse

      // loop text content is shown on mouseenter
      if (e.features.length > 0) {
        address.textContent = addressDisplay
        owner.textContent = ownerDisplay
        sf.textContent = sfDisplay
        use.textContent = useDisplay
      }

      if (use.textContent == '10') {
        use.textContent = 'Parking'
      } else { use.textContent = 'Vacant' }

      map.on('mouseleave', 'Hospitals', function() {
        // Remove the information from the previously hovered feature from the sidebar
        address.textContent = ''
        owner.textContent = ''
        sf.textContent = ''
        use.textContent = ''

        // Reset the cursor style
        map.getCanvas().style.cursor = ''
      })
    })
})
