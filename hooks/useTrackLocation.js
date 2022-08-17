import { useContext, useState } from "react"
import { ACTION_TYPES, StoreContext } from '../store/store-context'


const useTrackLocation = () => {
    const [locationErrorMsg, setlocationErrorMsg] = useState('')
    //const [latLong, setLatLong] = useState('')
    const [isFindingLocation, setIsFindingLocation] = useState(false)
    const { dispatch } = useContext(StoreContext)

    const success = (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        //setLatLong(`${latitude},${longitude}`)
        dispatch({
            type: ACTION_TYPES.SET_LAT_LONG,
            payload: { latLong: `${latitude},${longitude}` }
        })
        setlocationErrorMsg('')
        setIsFindingLocation(false)
    }

    const error = () => {
        setlocationErrorMsg('Unable to retrieve your location')
        setIsFindingLocation(false)
    }

    const handleTrackLocation = () => {
        setIsFindingLocation(true)

        if (!navigator.geolocation) {
            setlocationErrorMsg('Geolocation is not supported by your browser')
            setIsFindingLocation(false)
        } else {
            // status.textContent = 'Locating…';
            navigator.geolocation.getCurrentPosition(success, error);
        }
    }

    return {
        //latLong,
        handleTrackLocation,
        locationErrorMsg,
        isFindingLocation
    }
}

export default useTrackLocation;