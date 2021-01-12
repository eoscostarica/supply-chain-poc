import React, { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import mapboxgl from 'mapbox-gl'
import RoomIcon from '@material-ui/icons/Room'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import Box from '@material-ui/core/Box'

// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default

const initialGeoLocation = { lng: -84.100789, lat: 9.934725 }
const initialZoom = 12.5

function MapSelectLocation({ onGeolocationChange = () => {}, ...props }) {
  const mapContainerRef = useRef(null)
  const currentMarker = useRef(null)

  useEffect(() => {
    mapboxgl.accessToken =
      'pk.eyJ1IjoidGV0b2dvbWV6ZW9zIiwiYSI6ImNranRmZWszczFoNXkzMHA1eGxjbnhvOTYifQ.XZeKETWMshlPae8zyKgo7g'

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [initialGeoLocation.lng, initialGeoLocation.lat],
      zoom: initialZoom
    })

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

    map.on('click', ({ lngLat }) => {
      const { lng, lat } = lngLat

      if (currentMarker && currentMarker.current) {
        currentMarker.current.remove()
      }

      const markerNode = document.createElement('div')
      ReactDOM.render(<RoomIcon />, markerNode)

      const market = new mapboxgl.Marker(markerNode)
      market.setLngLat([lng, lat]).addTo(map)
      currentMarker.current = market

      onGeolocationChange({ longitude: lng, latitude: lat })
    })

    return () => map.remove()
  }, [onGeolocationChange])

  return <Box ref={mapContainerRef} {...props} />
}

MapSelectLocation.propTypes = {
  onGeolocationChange: PropTypes.func,
  props: PropTypes.object
}

export default MapSelectLocation
