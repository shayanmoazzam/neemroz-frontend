import React from 'react'
import styles from './InfoPage.module.css'

export default function ShippingInfo() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1>Shipping Information</h1>
        <p>Fast, reliable delivery across India</p>
      </div>

      <div className={styles.container}>

        <div className={styles.grid2}>
          <div className={styles.card}>
            <div className={styles.cardIcon}>🚚</div>
            <h3>Standard Delivery</h3>
            <p>3–5 business days</p>
            <p className={styles.cardNote}>₹49 shipping fee. <strong>FREE</strong> on orders above ₹799.</p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>⚡</div>
            <h3>Express Delivery</h3>
            <p>1–2 business days</p>
            <p className={styles.cardNote}>Available in Pune, Mumbai, Delhi, Bangalore & Hyderabad.</p>
          </div>
        </div>

        <div className={styles.section}>
          <h2>How It Works</h2>
          <div className={styles.steps}>
            <div className={styles.step}>
              <span>1</span>
              <p>Place your order & complete payment</p>
            </div>
            <div className={styles.step}>
              <span>2</span>
              <p>Order is packed within 24 hours</p>
            </div>
            <div className={styles.step}>
              <span>3</span>
              <p>Shipped via trusted courier partners</p>
            </div>
            <div className={styles.step}>
              <span>4</span>
              <p>Receive SMS & WhatsApp tracking updates</p>
            </div>
            <div className={styles.step}>
              <span>5</span>
              <p>Delivered to your doorstep!</p>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2>Important Notes</h2>
          <ul className={styles.list}>
            <li>Orders placed before 2 PM are dispatched the same day.</li>
            <li>Delivery to remote/rural areas may take 5–7 business days.</li>
            <li>We currently ship only within India.</li>
            <li>Tracking details will be sent via SMS and WhatsApp.</li>
            <li>In case of failed delivery, 2 re-attempts will be made.</li>
            <li>For any shipping issues, contact us at <strong>hello@ayezu.com</strong></li>
          </ul>
        </div>

      </div>
    </div>
  )
}
