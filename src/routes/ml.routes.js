
const express =
require('express')

const router =
express.Router()

const MLController =
require('../controllers/ml.controller')

const authMiddleware =
require('../middlewares/auth.middleware')

// ───────────────────────────────────
// GET CRITERIA OPTIONS
// ───────────────────────────────────
router.get(
    '/criteria-options',
    authMiddleware,
    MLController.getCriteriaOptions
)

// ───────────────────────────────────
// GET DATASET
// ───────────────────────────────────
router.get(
    '/dataset',
    authMiddleware,
    MLController.getDataset
)

// ───────────────────────────────────
// SAVE PREDICTION
// ───────────────────────────────────
router.post(
    '/save-prediction',
    authMiddleware,
    MLController.savePrediction
)

module.exports =
router

