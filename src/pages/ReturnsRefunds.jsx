import React from 'react'
import styles from './InfoPage.module.css'

export default function ReturnsRefunds() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1>Returns & Refunds</h1>
        <p>Hassle-free returns within 7 days</p>
      </div>
      <div className={styles.container}>
        <div className={styles.grid3}>
          <div className={styles.card}>
            <div className={styles.cardIcon}>📦</div>
            <h3>7-Day Returns</h3>
            <p>Return any item within 7 days of delivery if unused and in original packaging.</p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>💰</div>
            <h3>Full Refund</h3>
            <p>Refunds are processed within 5–7 business days to your original payment method.</p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>🔄</div>
            <h3>Easy Exchange</h3>
            <p>Prefer an exchange? We'll pick up & deliver the replacement at no extra cost.</p>
          </div>
        </div>

        <div className={styles.section}>
          <h2>Return Policy</h2>
          <ul className={styles.list}>
            <li>Items must be unused, unwashed and in original packaging with tags intact.</li>
            <li>Return request must be raised within 7 days of delivery.</li>
            <li>Damaged or defective items: contact us within 48 hours with photos.</li>
            <li>Sale/discounted items are not eligible for return unless defective.</li>
            <li>COD orders will receive refund via Bank Transfer / UPI.</li>
          </ul>
        </div>

        <div className={styles.section}>
          <h2>How to Raise a Return</h2>
          <div className={styles.steps}>
            <div className={styles.step}><span>1</span><p>Email hello@ayezu.com with your Order ID and reason</p></div>
            <div className={styles.step}><span>2</span><p>Our team will confirm within 24 hours</p></div>
            <div className={styles.step}><span>3</span><p>Pack the item securely and hand it to our courier</p></div>
            <div className={styles.step}><span>4</span><p>Refund processed within 5–7 business days</p></div>
          </div>
        </div>
      </div>
    </div>
  )
}
