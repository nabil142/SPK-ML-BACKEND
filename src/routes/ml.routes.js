
const express = require('express')

const router = express.Router()

const MLController =
  require('../controllers/ml.controller')

// ─────────────────────────────────────
// GET ALL CRITERIA OPTIONS
// ─────────────────────────────────────
router.get(
  '/criteria-options',
  MLController.getCriteriaOptions
)

// ─────────────────────────────────────
// GET DATASET
// ─────────────────────────────────────
router.get(
  '/dataset',
  MLController.getDataset
)

// ─────────────────────────────────────
// DYNAMIC PREDICT
// ─────────────────────────────────────
router.post(
  '/predict',
  MLController.predictDynamic
)

// ─────────────────────────────────────
// SAVE PREDICTION
// ─────────────────────────────────────
router.post(
  '/save-prediction',
  MLController.savePrediction
)

module.exports = router