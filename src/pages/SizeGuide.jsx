import React, { useState } from 'react'
import styles from './InfoPage.module.css'

const bedsheetSizes = [
  { size: 'Single', dimensions: '150 × 220 cm', fits: 'Single bed (3×6 ft)' },
  { size: 'Double', dimensions: '220 × 240 cm', fits: 'Double bed (5×6 ft)' },
  { size: 'Queen',  dimensions: '240 × 260 cm', fits: 'Queen bed (5×6.5 ft)' },
  { size: 'King',   dimensions: '270 × 270 cm', fits: 'King bed (6×6.5 ft)' },
]

const womenSizes = [
  { size: 'XS', chest: '32"', waist: '26"', hip: '35"', fits: 'Indian S' },
  { size: 'S',  chest: '34"', waist: '28"', hip: '37"', fits: 'Indian M' },
  { size: 'M',  chest: '36"', waist: '30"', hip: '39"', fits: 'Indian L' },
  { size: 'L',  chest: '38"', waist: '32"', hip: '41"', fits: 'Indian XL' },
  { size: 'XL', chest: '40"', waist: '34"', hip: '43"', fits: 'Indian XXL' },
]

export default function SizeGuide() {
  const [tab, setTab] = useState('bedsheet')
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1>Size Guide</h1>
        <p>Find your perfect fit every time</p>
      </div>
      <div className={styles.container}>
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === 'bedsheet' ? styles.tabActive : ''}`} onClick={() => setTab('bedsheet')}>🛏️ Bedsheets</button>
          <button className={`${styles.tab} ${tab === 'women' ? styles.tabActive : ''}`} onClick={() => setTab('women')}>👗 Women Wear</button>
        </div>

        {tab === 'bedsheet' && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Size</th><th>Dimensions</th><th>Fits Bed</th></tr></thead>
              <tbody>
                {bedsheetSizes.map(r => (
                  <tr key={r.size}><td><strong>{r.size}</strong></td><td>{r.dimensions}</td><td>{r.fits}</td></tr>
                ))}
              </tbody>
            </table>
            <p className={styles.note}>* All bedsheets include 2 matching pillow covers (45×70 cm).</p>
          </div>
        )}

        {tab === 'women' && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Size</th><th>Chest</th><th>Waist</th><th>Hip</th><th>Indian Size</th></tr></thead>
              <tbody>
                {womenSizes.map(r => (
                  <tr key={r.size}><td><strong>{r.size}</strong></td><td>{r.chest}</td><td>{r.waist}</td><td>{r.hip}</td><td>{r.fits}</td></tr>
                ))}
              </tbody>
            </table>
            <p className={styles.note}>* Measurements are in inches. For best fit, measure over light clothing.</p>
          </div>
        )}

        <div className={styles.section}>
          <h2>How to Measure</h2>
          <ul className={styles.list}>
            <li><strong>Chest:</strong> Measure around the fullest part of your chest, keeping tape parallel to the floor.</li>
            <li><strong>Waist:</strong> Measure around the narrowest part of your waist.</li>
            <li><strong>Hip:</strong> Measure around the fullest part of your hips.</li>
            <li>If between sizes, we recommend sizing up for comfort.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
