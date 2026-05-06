
const MLService =
require('../services/ml/ml.service')

const db =
require('../config/db')

class MLController {

    // ───────────────────────────────────
    // GET DATASET
    // ───────────────────────────────────
    static async getDataset(
        req,
        res
    ) {

        try {

            const method =
                req.query.method || 'SAW'

            const userId =
                req.user.user_id

            const dataset =
                await MLService
                    .generateDataset(
                        method,
                        userId
                    )

            res.status(200).json({

                message:
                    'Dataset berhasil digenerate',

                data:
                    dataset
            })

        } catch (error) {

            console.error(error)

            res.status(500).json({

                error:
                    error.message
            })
        }
    }

    // ───────────────────────────────────
    // GET CRITERIA OPTIONS
    // ───────────────────────────────────
    static async getCriteriaOptions(
        req,
        res
    ) {

        try {

            const userId =
                req.user.user_id

            const data =
                await MLService
                    .getCriteriaOptions(
                        userId
                    )

            res.status(200).json({

                message:
                    'Kriteria berhasil diambil',

                data
            })

        } catch (error) {

            console.error(error)

            res.status(500).json({

                error:
                    error.message
            })
        }
    }

    // ───────────────────────────────────
    // SAVE PREDICTION
    // ───────────────────────────────────
    static async savePrediction(
        req,
        res
    ) {

        try {

            const {
                alternative_name,
                criteria_used,
                predicted_score,
                predicted_rank
            } = req.body

            const result =
                await db.query(
                    `
                    INSERT INTO ml_predictions
                    (
                        alternative_name,
                        criteria_used,
                        predicted_score,
                        predicted_rank
                    )
                    VALUES
                    (
                        $1,
                        $2,
                        $3,
                        $4
                    )
                    RETURNING *
                    `,
                    [
                        alternative_name,
                        criteria_used,
                        predicted_score,
                        predicted_rank
                    ]
                )

            res.status(201).json({

                message:
                    'Prediksi berhasil disimpan',

                data:
                    result.rows[0]
            })

        } catch (error) {

            console.error(error)

            res.status(500).json({

                error:
                    error.message
            })
        }
    }
}

module.exports =
    MLController
