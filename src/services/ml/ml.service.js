const CriteriaRepository = require('../../repositories/criteria.repository');
const AlternativeRepository = require('../../repositories/alternative.repository');
const ResultRepository = require('../../repositories/result.repository');

class MLService {

    // 🔥 NORMALIZE NAMA KRITERIA
    static normalize(name) {
        return name.toLowerCase().trim().replace(/\s+/g, '_');
    }

    // 🔥 AMBIL TOP 3 KRITERIA GLOBAL
    static async getTopCriteria() {
        const rows = await CriteriaRepository.getAllCriteriaFrequency();

        // sort berdasarkan frekuensi terbanyak
        rows.sort((a, b) => b.total - a.total);

        // ambil top 3
        return rows.slice(0, 3).map(r => this.normalize(r.criteria_name));
    }

    /**
     * 🔥 GENERATE DATASET GLOBAL (TANPA caseId)
     */
    static async generateDataset(method = 'SAW') {
        const methodUpper = method.toUpperCase();

        // 🔥 1. Ambil TOP 3 KRITERIA GLOBAL
        const topCriteria = await this.getTopCriteria();

        if (topCriteria.length < 3) {
            throw new Error('Kriteria tidak cukup untuk training ML.');
        }

        // 🔥 2. Ambil SEMUA alternatif (GLOBAL)
        const alternatives = await AlternativeRepository.findAllWithCriteria();

        if (!alternatives.length) {
            throw new Error('Belum ada data alternatif.');
        }

        // 🔥 3. Ambil SEMUA hasil SPK (GLOBAL)
        const results = await ResultRepository.getAllResults(methodUpper);

        if (!results.length) {
            throw new Error(
                `Belum ada hasil kalkulasi ${methodUpper}. Jalankan perhitungan terlebih dahulu.`
            );
        }

        // 🔥 4. Map alternative_id → score
        const scoreMap = {};
        results.forEach(r => {
            scoreMap[r.alternative_id] = parseFloat(r.score);
        });

        // 🔥 5. SUSUN DATASET
        const samples = [];

        for (const alt of alternatives) {

            // skip kalau tidak ada score
            if (scoreMap[alt.alternative_id] === undefined) continue;

            // default semua fitur = 0
            const featureObj = {};
            topCriteria.forEach(c => featureObj[c] = 0);

            // isi nilai berdasarkan data
            alt.criteria_values.forEach(v => {
                const key = this.normalize(v.criteria_name);

                if (topCriteria.includes(key)) {
                    featureObj[key] = parseFloat(v.value);
                }
            });

            // ubah ke array sesuai urutan topCriteria
            const features = topCriteria.map(c => featureObj[c]);

            samples.push({
                alternative_id: alt.alternative_id,
                alternative_name: alt.alternative_name,
                features,
                score: scoreMap[alt.alternative_id]
            });
        }

        if (samples.length < 3) {
            throw new Error(
                `Dataset hanya memiliki ${samples.length} sampel. Minimal 3 dibutuhkan.`
            );
        }

        return {
            feature_names: topCriteria,
            samples
        };
    }
}

module.exports = MLService;