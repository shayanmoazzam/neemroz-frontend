import React, { useState } from 'react'
import styles from './InfoPage.module.css'

const faqs = [
  { q: 'What payment methods do you accept?', a: 'We accept UPI, Credit/Debit Cards, Net Banking, and Cash on Delivery (COD) for orders up to ₹5,000.' },
  { q: 'How long does delivery take?', a: 'Standard delivery takes 3–5 business days across India. Express delivery (1–2 days) is available for select cities.' },
  { q: 'Can I cancel my order?', a: 'Orders can be cancelled within 24 hours of placing. Once dispatched, cancellation is not possible. Please contact us at hello@ayezu.com.' },
  { q: 'Are the colors accurate in photos?', a: 'We try to represent colors as accurately as possible. However, slight variations may occur due to different screen settings.' },
  { q: 'Do you offer bulk/wholesale orders?', a: 'Yes! For bulk orders of 10+ items, please reach out to us at hello@ayezu.com for special pricing.' },
  { q: 'How do I track my order?', a: 'Once your order is shipped, you will receive an SMS/WhatsApp with a tracking link. You can also visit the Track Order page.' },
  { q: 'Is it safe to shop on Ayezu Collection?', a: 'Absolutely. All payments are secured via Razorpay with 256-bit SSL encryption. We never store your card details.' },
  { q: 'What if I receive a damaged product?', a: 'We\'re sorry to hear that! Please contact us within 48 hours of delivery with photos at hello@ayezu.com and we\'ll resolve it immediately.' },
]

export default function FAQs() {
  const [open, setOpen] = useState(null)
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1>Frequently Asked Questions</h1>
        <p>Everything you need to know about shopping with Ayezu Collection</p>
      </div>
      <div className={styles.container}>
        <div className={styles.accordion}>
          {faqs.map((f, i) => (
            <div key={i} className={`${styles.accordionItem} ${open === i ? styles.open : ''}`}>
              <button className={styles.accordionQ} onClick={() => setOpen(open === i ? null : i)}>
                {f.q}
                <span className={styles.chevron}>{open === i ? '−' : '+'}</span>
              </button>
              {open === i && <div className={styles.accordionA}>{f.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
