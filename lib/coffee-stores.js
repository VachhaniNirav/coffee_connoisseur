import { createApi } from 'unsplash-js';

const unsplash = createApi({
    accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY
});

const getCoffeeStoresPhotos = async () => {
    const photos = await unsplash.search.getPhotos({
        query: 'coffee shop',
        page: 2,
        perPage: 50
    });
    return photos.response.results.map(
        result => result.urls['small']
    )
}

const getUrlForCoffeStores = (latlong, query, limit) => {
    return `https://api.foursquare.com/v3/places/search?query=${query}&ll=${latlong}&radius=5000&limit=${limit}`
}

export const fetchCoffeeStores = async (latLong = '23.041066266139307%2C72.49741231845256', limit = 20) => {
    const photos = await getCoffeeStoresPhotos()
    const options = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            Authorization: process.env.NEXT_PUBLIC_FOURSQUARE_API_KEY
        }
    };
    const response = await fetch(getUrlForCoffeStores(latLong, 'coffee', limit), options)
    const data = await response.json()

    return data.results.map(
        (result, idx) => {
            return {
                id: result.fsq_id,
                name: result.name,
                address: result.location.address?.length > 0 ? result.location.address : "",
                cross_street: result.location.cross_street?.length > 0 ? result.location.cross_street : "",
                imgUrl: photos.length > 0 ? photos[idx] : null,
            }
        })
}