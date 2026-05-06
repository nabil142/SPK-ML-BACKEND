const db = require('../config/db')

class CriteriaRepository {

    // ── CREATE ─────────────────────────────────
    static async create(
        caseId,
        criteriaName,
        criteriaType,
        weight
    ) {

        const query = `
            INSERT INTO criteria
            (
                case_id,
                criteria_name,
                criteria_type,
                weight
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `

        const values = [
            caseId,
            criteriaName,
            criteriaType,
            weight
        ]

        const { rows } =
            await db.query(query, values)

        return rows[0]
    }

    // ── FIND BY CASE ───────────────────────────
    static async findByCaseId(caseId) {

        const query = `
            SELECT *
            FROM criteria
            WHERE case_id = $1
            ORDER BY criteria_id ASC;
        `

        const { rows } =
            await db.query(query, [caseId])

        return rows
    }

    // ── UPDATE ─────────────────────────────────
    static async update(
        criteriaId,
        criteriaName,
        criteriaType,
        weight
    ) {

        const query = `
            UPDATE criteria
            SET
                criteria_name = $1,
                criteria_type = $2,
                weight = $3
            WHERE criteria_id = $4
            RETURNING *;
        `

        const values = [
            criteriaName,
            criteriaType,
            weight,
            criteriaId
        ]

        const { rows } =
            await db.query(query, values)

        return rows[0]
    }

    // ── DELETE ─────────────────────────────────
    static async delete(criteriaId) {

        const client =
            await db.getClient()

        try {

            await client.query('BEGIN')

            // hapus alternative values
            await client.query(
                `
                DELETE FROM alternative_values
                WHERE criteria_id = $1
                `,
                [criteriaId]
            )

            // hapus comparisons
            await client.query(
                `
                DELETE FROM criteria_comparisons
                WHERE criteria_1 = $1
                OR criteria_2 = $1
                `,
                [criteriaId]
            )

            // hapus criteria
            await client.query(
                `
                DELETE FROM criteria
                WHERE criteria_id = $1
                `,
                [criteriaId]
            )

            await client.query('COMMIT')

            return true

        } catch (error) {

            await client.query('ROLLBACK')

            throw error

        } finally {

            client.release()
        }
    }

    // ── GET ALL UNIQUE CRITERIA ────────────────
    static async getAllCriteriaFrequency() {

        const query = `
            SELECT

                LOWER(
                    REGEXP_REPLACE(
                        TRIM(criteria_name),
                        '\\s+',
                        '_',
                        'g'
                    )
                ) AS normalized_name,

                MIN(criteria_name) AS criteria_name,

                MIN(criteria_type) AS type

            FROM criteria

            GROUP BY normalized_name

            ORDER BY criteria_name ASC;
        `

        const { rows } =
            await db.query(query)

        return rows
    }
    static async getAllCriteriaFrequency() {

  const query = `
    SELECT
      c.criteria_name,
      c.criteria_type AS type,
      COUNT(av.criteria_id) AS total

    FROM criteria c

    LEFT JOIN alternative_values av
      ON av.criteria_id = c.criteria_id

    GROUP BY
      c.criteria_name,
      c.criteria_type

    ORDER BY total DESC
  `

  const { rows } = await db.query(query)

  return rows
}
}

module.exports = CriteriaRepository