import React, { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import mapboxgl from 'mapbox-gl'
import Box from '@material-ui/core/Box'
import RoomIcon from '@material-ui/icons/Room'

// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default

const initialZoom = 6.5
let map = null
let markerList = []

const customData = {
  features: [],
  type: 'FeatureCollection'
}

function MapShowLocations({ location, disableScrollZoom, ...props }) {
  const mapContainerRef = useRef(null)

  const loadPointData = (name, type, coordinates) => {
    customData.features.push({
      type: 'Feature',
      properties: {
        title: name,
        type: type
      },
      geometry: {
        coordinates: [coordinates[0], coordinates[1]],
        type: 'Point'
      }
    })
  }

  const clearPointsData = () => {
    customData.features = []
    markerList = []
  }

  const removeMarkers = () => {
    for (let i = 0; i <= markerList.length - 1; i++) {
      markerList[i].remove()
    }
  }

  const loadMarkersEvent = async () => {
    removeMarkers()
    clearPointsData()

    const dataLocations = [
      { type: 'city', name: 'Guanacaste', coordinates: [-85.57597, 10.286328] },
      { type: 'city', name: 'Alajuela', coordinates: [-84.406258, 10.577492] },
      { type: 'city', name: 'Heredia', coordinates: [-83.999331, 10.537488] },
      { type: 'city', name: 'Cartago', coordinates: [-83.852837, 9.479564] },
      { type: 'city', name: 'San José', coordinates: [-83.882992, 9.88136] },
      {
        type: 'city',
        name: 'Puntarenas',
        coordinates: [-83.526436, 10.271004]
      },
      { type: 'city', name: 'Limón', coordinates: [-83.217317, 8.811157] }
    ]

    dataLocations.forEach(location => {
      const { type, name, coordinates } = location

      loadPointData(name, type, coordinates)

      const markerNode = document.createElement('div')

      ReactDOM.render(<RoomIcon />, markerNode)

      const markertemp = new mapboxgl.Marker(markerNode)

      markertemp.setLngLat(coordinates)
      markertemp.addTo(map)
      markerList.push(markertemp)
    })
  }

  useEffect(() => {
    mapboxgl.accessToken =
      'pk.eyJ1IjoidGV0b2dvbWV6ZW9zIiwiYSI6ImNranRmZWszczFoNXkzMHA1eGxjbnhvOTYifQ.XZeKETWMshlPae8zyKgo7g'

    map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [location.longitude, location.latitude],
      zoom: initialZoom
    })

    map.on('load', () => loadMarkersEvent())
    disableScrollZoom && map.scrollZoom.disable()

    return () => map.remove()
    
    // eslint-disable-next-line
  }, [location.longitude, location.latitude, disableScrollZoom])

  return <Box ref={mapContainerRef} {...props} />
}

MapShowLocations.propTypes = {
  location: PropTypes.object,
  props: PropTypes.object,
  disableScrollZoom: PropTypes.bool
}

MapShowLocations.defaultProps = {
  location: { longitude: -84.17064, latitude: 9.926011 },
  disableScrollZoom: true
}

export default MapShowLocations
