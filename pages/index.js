import Head from 'next/head'
import Image from 'next/image'
import { useContext, useEffect, useState } from 'react'

import Banner from '../components/banner'
import Card from '../components/card'

import useTrackLocation from '../hooks/useTrackLocation'
import { fetchCoffeeStores } from '../lib/coffee-stores'
import { ACTION_TYPES, StoreContext } from '../store/store-context'

import styles from '../styles/Home.module.css'


export async function getStaticProps(context) {

  const coffeeStores = await fetchCoffeeStores()

  return {
    props: {
      coffeeStores
    }
  }
}

export default function Home(props) {
  const { handleTrackLocation, locationErrorMsg, isFindingLocation } = useTrackLocation()
  //const [coffeeStores, setCoffeeStores] = useState('')
  const [coffeeStoresError, setCoffeeStoresError] = useState(null)

  const { dispatch, state } = useContext(StoreContext)
  const { coffeeStores, latLong } = state

  const asyncfetchCoffeeStores = async () => {
    const coffeeStoresByLocation = await fetch(`api/getCoffeeStoresByLocation?latLong=${latLong}&limit=30`)
    const result = await coffeeStoresByLocation.json()

    dispatch({
      type: ACTION_TYPES.SET_COFFEE_STORES,
      payload: {
        coffeeStores: result
      }
    })
    setCoffeeStoresError('')
  }

  useEffect(() => {
    if (latLong) {
      try {
        asyncfetchCoffeeStores()
      } catch (error) {
        console.log({ error });
        setCoffeeStoresError(error.message)
      }
    }
  }, [latLong])

  const handleOnBannerBtnClick = () => {
    handleTrackLocation()
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Coffee Connoisseur</title>
        <meta name="Discover your local coffee shops!" content="Coffee Connoisseur_created by nOax" />
        <link rel="icon" href="/fav.ico" />
      </Head>

      <main className={styles.main}>
        <Banner buttonText={isFindingLocation ? "Locating.." : "View stores nearby"}
          handleOnClick={handleOnBannerBtnClick} />
        {locationErrorMsg && <p style={{ color: 'red' }}>Something went wrong! {locationErrorMsg}</p>}
        {coffeeStoresError && <p style={{ color: 'red' }}>Something went wrong! {coffeeStoresError}</p>}
        <div className={styles.heroImg} >
          <Image src="/static/hero_img.png" alt="image" width={350} height={350} />
        </div>
        {coffeeStores.length > 0 && (
          <div className={styles.sectionWrapper}>
            <h2 className={styles.heading2}>
              Stores near me
            </h2>
            <div className={styles.cardLayout}>
              {
                coffeeStores.map((coffeeStore) => {
                  return (
                    <Card
                      key={coffeeStore.id}
                      className={styles.card}
                      name={coffeeStore.name}
                      imgUrl={coffeeStore.imgUrl}
                      href={`/coffee-store/${coffeeStore.id}`}
                    />
                  )
                })}
            </div>
          </div>
        )}

        {props.coffeeStores.length > 0 && (
          <div className={styles.sectionWrapper}>
            <h2 className={styles.heading2}>
              SBR Coffee Stores
            </h2>
            <div className={styles.cardLayout}>
              {
                props.coffeeStores.map((coffeeStore) => {
                  return (
                    <Card
                      key={coffeeStore.id}
                      className={styles.card}
                      name={coffeeStore.name}
                      imgUrl={coffeeStore.imgUrl}
                      href={`/coffee-store/${coffeeStore.id}`}
                    />
                  )
                })}
            </div>
          </div>
        )}
      </main >
    </div >
  )
}
