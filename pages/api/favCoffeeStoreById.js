import { table, findRecordByFilter, getMinifiedRecords } from '../../lib/airtable'

const favCoffeeStoreById = async (req, res) => {
    if (req.method === "PUT") {
        try {
            const { id } = req.body

            if (id) {
                const records = await findRecordByFilter(id)

                if (records.length !== 0) {
                    const record = records[0]
                    const calculateVoting = parseInt(record.voting) + parseInt(1)

                    const updateRecord = await table.update([
                        {
                            id: record.recordId,
                            fields: {
                                voting: calculateVoting
                            }
                        }
                    ])

                    if (updateRecord) {
                        const minifiedRecords = getMinifiedRecords(updateRecord)
                        res.json(minifiedRecords)
                    }

                } else {
                    res.json({ message: "Coffee store doesn't exist" })
                }
            } else {
                res.status(400)
                res.json({ message: "Id is missing" })
            }
        } catch (err) {
            res.status(500)
            res.json({ message: "Error upvoting coffee store", err })
        }
    }
}

export default favCoffeeStoreById