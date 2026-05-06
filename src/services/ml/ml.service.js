
const CriteriaRepository = require('../../repositories/criteria.repository')
const AlternativeRepository = require('../../repositories/alternative.repository')
const ResultRepository = require('../../repositories/result.repository')

class MLService {

  // ── NORMALIZE ───────────────────────────────
  static normalize(name) {

    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
  }

  // ── GET ALL CRITERIA ────────────────────────

static async getCriteriaOptions() {

    const rows =
        await CriteriaRepository
            .getAllCriteriaFrequency()

    return rows.map(r => ({

        // 🔥 VALUE UNTUK SYSTEM
        name: this.normalize(
            r.criteria_name
        ),

        // 🔥 LABEL UNTUK UI
        label: r.criteria_name,

        // 🔥 TYPE
        type:
            r.type || 'benefit',

        // 🔥 TOTAL
        total:
            Number(r.total)
    }))
}


  // ── GENERATE DATASET DYNAMIC ────────────────

static async generateDataset(
    method = 'SAW'
) {

    const methodUpper =
        method.toUpperCase()

    // ─────────────────────────────
    // GET ALL CRITERIA
    // ─────────────────────────────
    const criteria =
        await this.getCriteriaOptions()

    if (
        criteria.length < 1
    ) {

        throw new Error(
            'Belum ada kriteria'
        )
    }

    // 🔥 NORMALIZED FEATURE NAME
    const featureNames =
        criteria.map(c => c.name)

    // ─────────────────────────────
    // GET ALTERNATIVES
    // ─────────────────────────────
    const alternatives =
        await AlternativeRepository
            .findAllWithCriteria()

    if (
        !alternatives.length
    ) {

        throw new Error(
            'Belum ada alternatif'
        )
    }

    // ─────────────────────────────
    // GET RESULT SPK
    // ─────────────────────────────
    const results =
        await ResultRepository
            .getAllResults(
                methodUpper
            )

    if (
        !results.length
    ) {

        throw new Error(
            `Belum ada hasil ${methodUpper}`
        )
    }

    // ─────────────────────────────
    // MAP SCORE
    // ─────────────────────────────
    const scoreMap = {}

    results.forEach(r => {

        scoreMap[
            r.alternative_id
        ] = parseFloat(r.score)
    })

    // ─────────────────────────────
    // BUILD DATASET
    // ─────────────────────────────
    const samples = []

    for (const alt of alternatives) {

        if (
            scoreMap[
                alt.alternative_id
            ] === undefined
        ) continue

        const featureObj = {}

        // init semua feature
        featureNames.forEach(name => {

            featureObj[name] = 0
        })

        // isi value
        alt.criteria_values.forEach(v => {

            const key =
                this.normalize(
                    v.criteria_name
                )

            if (
                featureNames.includes(key)
            ) {

                featureObj[key] =
                    parseFloat(v.value)
            }
        })

        // array sesuai urutan feature
        const features =
            featureNames.map(name =>
                featureObj[name]
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

    // ─────────────────────────────
    // RETURN FINAL
    // ─────────────────────────────
    return {

        feature_info: criteria,

        samples
    }
}



  // ── AUTO TRAIN + PREDICT ────────────────────
  static async predictDynamic(
    method,
    criteria,
    features
  ) {

    // generate dataset dinamis
    const dataset =
      await this.generateDataset(
        method,
        criteria
      )

    // kirim ke python
    const response = await axios.post(
      'http://python-ml:8000/predict-dynamic',
      {
        method,
        dataset,
        features,
        selected_criteria: criteria
      }
    )

    return response.data
  }
}

module.exports = MLService