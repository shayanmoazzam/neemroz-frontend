import React from 'react'
import styles from './SkeletonCard.module.css'

export default function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={styles.img} />
      <div className={styles.body}>
        <div className={styles.line} style={{ width: '70%' }} />
        <div className={styles.line} style={{ width: '45%' }} />
        <div className={styles.line} style={{ width: '55%', height: '22px', marginTop: '8px' }} />
      </div>
    </div>
  )
}
