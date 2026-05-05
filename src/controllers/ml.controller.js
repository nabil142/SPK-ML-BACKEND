const MLService = require('../services/ml/ml.service');

class MLController {

    // 🔥 GET DATASET GLOBAL
    static async getDataset(req, res) {
        try {
            const method = req.query.method || 'SAW';

            const dataset = await MLService.generateDataset(method);

            res.status(200).json({
                message: `Dataset global ${method.toUpperCase()} berhasil digenerate`,
                data: dataset
            });
        } catch (error) {
            console.error('Error ML Dataset:', error);
            res.status(400).json({ error: error.message });
        }
    }

    // 🔥 TAMBAHAN: GET TOP 3 KRITERIA
    static async getTopCriteria(req, res) {
        try {
            const criteria = await MLService.getTopCriteria();

            res.status(200).json({
                message: 'Top kriteria berhasil diambil',
                data: criteria
            });
        } catch (error) {
            console.error('Error ML Criteria:', error);
            res.status(400).json({ error: error.message });
        }
    }

    static async savePrediction(req, res) {
  try {
    const { predicted_score, predicted_rank } = req.body;

    const result = await require('../config/db').query(
      `INSERT INTO ml_predictions (predicted_score, predicted_rank, created_at)
       VALUES ($1, $2, NOW())
       RETURNING *`,
      [predicted_score, predicted_rank]
    );

    res.status(201).json({
      message: 'Prediksi berhasil disimpan',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error save prediction:', error);
    res.status(500).json({ error: 'Gagal menyimpan prediksi' });
  }
}

}

module.exports = MLController;