const db = require('../config/db');

class ResultRepository {
    static async saveBatchResults(caseId, method, resultsData) {
        const client = await db.getClient();
        
        try {
            await client.query('BEGIN');

            // Hapus hasil kalkulasi sebelumnya untuk case dan metode yang sama
            const deleteQuery = `DELETE FROM results WHERE case_id = $1 AND method = $2`;
            await client.query(deleteQuery, [caseId, method]);

            // Insert hasil baru
            const insertQuery = `
                INSERT INTO results (case_id, alternative_id, method, score, ranking) 
                VALUES ($1, $2, $3, $4, $5) RETURNING *;
            `;
            
            const savedResults = [];
            for (const item of resultsData) {
                const { rows } = await client.query(insertQuery, [
                    caseId, 
                    item.alternative_id, 
                    method, 
                    item.score, 
                    item.ranking
                ]);
                savedResults.push(rows[0]);
            }

            await client.query('COMMIT');
            return savedResults;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async getResultsByCaseId(caseId, method = 'SAW') {
        const query = `
            SELECT r.result_id, r.method, r.score, r.ranking, r.created_at, 
                   a.alternative_id, a.alternative_name
            FROM results r
            JOIN alternatives a ON r.alternative_id = a.alternative_id
            WHERE r.case_id = $1 AND r.method = $2
            ORDER BY r.ranking ASC;
        `;
        const { rows } = await db.query(query, [caseId, method]);
        return rows;
    }

static async getAllResults(method) {
  const result = await db.query(`
    SELECT alternative_id, score
    FROM results
    WHERE method = $1
  `, [method]);

  return result.rows;
}

// ───────────────────────────────────
// GET RESULTS BY USER
// ───────────────────────────────────
static async getAllResultsByUser(
    method,
    userId
) {

    const query = `

        SELECT
            r.*

        FROM results r

        JOIN decision_case dc
            ON dc.case_id = r.case_id

        WHERE
            r.method = $1
            AND dc.user_id = $2

        ORDER BY r.ranking ASC
    `

    const { rows } =
        await db.query(
            query,
            [method, userId]
        )

    return rows
}


    
}

module.exports = ResultRepository;