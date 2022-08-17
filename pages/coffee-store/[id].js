import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import Image from 'next/image'

import { useContext, useEffect, useState } from 'react'
import cls from 'classnames'
import useSWR from 'swr'

import { fetchCoffeeStores } from '../../lib/coffee-stores'
import { StoreContext } from '../../store/store-context'
import { isEmpty } from '../../utils'

import styles from '../../styles/coffee-stores.module.css'



export async function getStaticProps({ params }) {
    const coffeeStores = await fetchCoffeeStores()
    const findCoffeeStoreById = coffeeStores.find(coffeeStore => {
        return coffeeStore.id.toString() === params.id
    })

    return {
        props: {
            coffeeStore: findCoffeeStoreById ? findCoffeeStoreById : {}
        }
    }
}

export async function getStaticPaths() {
    const coffeeStores = await fetchCoffeeStores()
    const paths = coffeeStores.map((coffeestore) => {
        return {
            params: {
                id: coffeestore.id.toString()
            }
        }
    })
    return {
        paths,
        fallback: true
    }
}

const CoffeeStore = (initialProps) => {
    const router = useRouter()

    const id = router.query.id
    const [coffeeStore, setCoffeeStore] = useState(initialProps.coffeeStore || {})
    const { state: { coffeeStores } } = useContext(StoreContext)

    const handleCreateCoffeeStore = async (coffeeStore) => {
        try {
            const { id, name, address, cross_street, voting, imgUrl } = coffeeStore
            const response = await fetch('/api/createCoffeeStore', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id,
                    name,
                    address: address || "",
                    cross_street: cross_street || "",
                    voting: 0,
                    imgUrl
                })
            })
            const dbCoffeeStore = await response.json()
        } catch (err) {
            console.error('Error creating coffee store', err);
        }
    }

    useEffect(() => {
        if (isEmpty(initialProps.coffeeStore)) {
            if (coffeeStores.length > 0) {
                const coffeeStoreFromContext = coffeeStores.find(coffeeStore => {
                    return coffeeStore.id.toString() === id
                })
                if (coffeeStoreFromContext) {
                    setCoffeeStore(coffeeStoreFromContext);
                    handleCreateCoffeeStore(coffeeStoreFromContext)
                }
            }
        } else {
            handleCreateCoffeeStore(initialProps.coffeeStore)
        }
    }, [id, initialProps, initialProps.coffeeStore, coffeeStores])

    const {
        name = "",
        address = "",
        cross_street = "",
        imgUrl = ""
    } = coffeeStore

    const [votingCount, setVotingCount] = useState(0)

    const { data, error } = useSWR(`/api/getCoffeeStoreById?id=${id}`, (url) => fetch(url).then((res) => res.json()))
    useEffect(() => {
        if (data && data.length > 0) {
            setCoffeeStore(data[0])
            setVotingCount(data[0].voting)
        }
    }, [data])

    if (router.isFallback) {
        return <div>Loading...</div>
    }

    const handleUpvoteButton = async () => {
        try {
            const response = await fetch('/api/favCoffeeStoreById', {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id
                })
            })
            const dbCoffeeStore = await response.json()
            if (dbCoffeeStore && dbCoffeeStore.length > 0) {
                let count = votingCount + 1
                setVotingCount(count)
            }
        } catch (err) {
            console.error('Error upvoting the coffee store', err);
        }
    }

    if (error) {
        return <div>Something went wrong retrieving coffee store page</div>
    }

    return (
        <div className={styles.layout}>
            <Head>
                <title>{name}</title>
            </Head>
            <div className={styles.container}>
                <div className={styles.col1}>
                    <div className={styles.backToHomeLink}>
                        <Link href='/'>
                            <a>← Back to home</a>
                        </Link>
                    </div>
                    <div className={styles.nameWrapper}>
                        <h1 className={styles.name}>{name}</h1>
                    </div>
                    <Image
                        className={styles.storeImg}
                        src={imgUrl}
                        alt={name}
                        width={600}
                        height={360}
                    />
                </div>
                <div className={cls("glass", styles.col2)}>
                    {address && (<div className={styles.iconWrapper}>
                        <Image
                            alt="image"
                            src="/static/icons/places.svg"
                            width={24}
                            height={24}
                        />
                        <p className={styles.text}>{address}</p>
                    </div>)
                    }
                    {cross_street && (<div className={styles.iconWrapper}>
                        <Image
                            alt="image"
                            src="/static/icons/nearMe.svg"
                            width={24}
                            height={24}
                        />
                        <p className={styles.text}>{cross_street}</p>
                    </div>)
                    }
                    <div className={styles.iconWrapper}>
                        <Image
                            alt="image"
                            src="/static/icons/star.svg"
                            width={24}
                            height={24}
                        />
                        <p className={styles.text}>{votingCount}</p>
                    </div>

                    <button className={styles.upvoteButton}
                        onClick={handleUpvoteButton}>
                        Up Vote!
                    </button>
                </div>
            </div>
        </div >
    )
}

export default CoffeeStore