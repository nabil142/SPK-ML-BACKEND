
const CriteriaRepository =
require('../../repositories/criteria.repository')

const AlternativeRepository =
require('../../repositories/alternative.repository')

const ResultRepository =
require('../../repositories/result.repository')

class MLService {

    // ───────────────────────────────────
    // NORMALIZE
    // ───────────────────────────────────
    static normalize(name) {

        return name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '_')
    }

    // ───────────────────────────────────
    // GET CRITERIA OPTIONS
    // ───────────────────────────────────
    static async getCriteriaOptions(
        userId
    ) {

        const rows =
            await CriteriaRepository
                .getAllCriteriaFrequency(
                    userId
                )

        return rows.map(r => ({

            name:
                this.normalize(
                    r.criteria_name
                ),

            label:
                r.criteria_name,

            total:
                Number(r.total),

            type:
                r.type || 'benefit'
        }))
    }

    // ───────────────────────────────────
    // GENERATE DATASET
    // ───────────────────────────────────
    static async generateDataset(
        method = 'SAW',
        userId
    ) {

        const methodUpper =
            method.toUpperCase()

        // KRITERIA USER
        const criteriaRows =
            await CriteriaRepository
                .getAllCriteriaFrequency(
                    userId
                )

        const featureInfo =
            criteriaRows.map(r => ({

                name:
                    this.normalize(
                        r.criteria_name
                    ),

                type:
                    r.type
            }))

        // ALTERNATIVES
        const alternatives =
            await AlternativeRepository
                .findAllWithCriteria()

        // RESULTS USER
        const results =
            await ResultRepository
                .getAllResultsByUser(
                    methodUpper,
                    userId
                )

        const scoreMap = {}

        results.forEach(r => {

            scoreMap[
                r.alternative_id
            ] = parseFloat(r.score)
        })

        const samples = []

        for (const alt of alternatives) {

            if (
                scoreMap[
                    alt.alternative_id
                ] === undefined
            ) continue

            const featureObj = {}

            featureInfo.forEach(f => {

                featureObj[f.name] = 0
            })

            alt.criteria_values
                .forEach(v => {

                    const key =
                        this.normalize(
                            v.criteria_name
                        )

                    if (
                        featureObj[key]
                        !== undefined
                    ) {

                        featureObj[key] =
                            parseFloat(v.value)
                    }
                })

            const features =
                featureInfo.map(
                    f => featureObj[f.name]
                )

            samples.push({

                alternative_id:
                    alt.alternative_id,

                alternative_name:
                    alt.alternative_name,

                features,

                score:
                    scoreMap[
                        alt.alternative_id
                    ]
            })
        }

        return {

            feature_info:
                featureInfo,

            samples
        }
    }
}

module.exports =MLService

