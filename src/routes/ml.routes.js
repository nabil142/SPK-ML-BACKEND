const express = require('express');
const router = express.Router();
const MLController = require('../controllers/ml.controller');
const authMiddleware = require('../middlewares/auth.middleware');


// 🔥 GLOBAL DATASET (tanpa caseId)
router.get('/dataset', MLController.getDataset);

// 🔥 TOP 3 KRITERIA (untuk frontend input)
router.get('/criteria', MLController.getTopCriteria);

router.post('/save-prediction', MLController.savePrediction);

module.exports = router;