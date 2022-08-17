import { table, getMinifiedRecords, findRecordByFilter } from '../../lib/airtable';


const createCoffeeStore = async (req, res) => {
    if (req.method === "POST") {
        const { id, name, address, cross_street, voting, imgUrl } = req.body

        try {
            if (id) {
                const records = await findRecordByFilter(id)

                if (records.length !== 0) {
                    res.json(records)

                    const records = getMinifiedRecords(findCoffeeStoreRecords)
                    res.json(records)
                } else {
                    if (name) {
                        const createRecords = await table.create([
                            {
                                fields: {
                                    id, name, address, cross_street, voting, imgUrl
                                }
                            }
                        ])

                        const records = getMinifiedRecords(createRecords)
                        res.json({ message: "records created", records })
                    } else {
                        res.status(400)
                        res.json({ message: "Id or name is missing" })
                    }
                }
            } else {
                res.status(400)
                res.json({ message: "Id is missing" })
            }
        } catch (err) {
            console.error('Error creating or finding store', err);
            res.status(500)
            res.json({ message: "Error creating or finding store", err })
        }
    }
}



export default createCoffeeStore
