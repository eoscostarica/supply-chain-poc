import React, { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import RoomIcon from '@material-ui/icons/Room'
import mapboxgl from 'mapbox-gl'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import Box from '@material-ui/core/Box'

// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default

function MapEditLocation({
  onGeolocationChange = () => {},
  markerLocation,
  usuControls,
  initialZoom,
  ...props
}) {
  const mapContainerRef = useRef(null)
  const currentMarker = useRef(null)

  let markerNode = null
  let marker = null

  useEffect(() => {
    mapboxgl.accessToken =
      'pk.eyJ1IjoidGV0b2dvbWV6ZW9zIiwiYSI6ImNranRmZWszczFoNXkzMHA1eGxjbnhvOTYifQ.XZeKETWMshlPae8zyKgo7g'

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [markerLocation.longitude, markerLocation.latitude],
      zoom: initialZoom
    })

    // eslint-disable-next-line
    markerNode = document.createElement('div')
    ReactDOM.render(<RoomIcon />, markerNode)

    // eslint-disable-next-line
    marker = new mapboxgl.Marker(markerNode)
    marker
      .setLngLat([markerLocation.longitude, markerLocation.latitude])
      .addTo(map)
    currentMarker.current = marker

    if (usuControls) {
      map.addControl(
        new MapboxGeocoder({
          accessToken: mapboxgl.accessToken,
          mapboxgl: mapboxgl
        })
      )

      map.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true
        })
      )
    }

    map.on('click', ({ lngLat }) => {
      const { lng, lat } = lngLat

      if (currentMarker && currentMarker.current) {
        currentMarker.current.remove()
      }

      markerNode = document.createElement('div')
      ReactDOM.render(<RoomIcon />, markerNode)

      marker = new mapboxgl.Marker(markerNode)
      marker.setLngLat([lng, lat]).addTo(map)
      currentMarker.current = marker

      onGeolocationChange({ longitude: lng, latitude: lat })
    })

    return () => map.remove()
  }, [])

  return <Box ref={mapContainerRef} {...props} />
}

MapEditLocation.propTypes = {
  onGeolocationChange: PropTypes.func,
  markerLocation: PropTypes.object,
  props: PropTypes.object,
  usuControls: PropTypes.bool,
  initialZoom: PropTypes.number
}

MapEditLocation.defaultProps = {
  markerLocation: {},
  usuControls: true,
  initialZoom: 12.5
}

export default MapEditLocation
