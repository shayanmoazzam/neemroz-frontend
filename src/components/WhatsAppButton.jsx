import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import styles from './WhatsAppButton.module.css'

const PHONE = '919015682971'
const DEFAULT_MSG = 'Hi! I found your store and I am interested in your products. Can you help me?'

export default function WhatsAppButton() {
  const [hovered, setHovered] = useState(false)
  const location = useLocation()

  // Hide on product detail pages — they have their own inline WhatsApp enquiry button
  const isProductPage = location.pathname.startsWith('/product')
  if (isProductPage) return null

  const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(DEFAULT_MSG)}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.btn}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Chat on WhatsApp"
    >
      {hovered && <span className={styles.tooltip}>Chat with us!</span>}
      <svg viewBox="0 0 32 32" className={styles.icon}>
        <path d="M16 0C7.163 0 0 7.163 0 16c0 2.833.738 5.49 2.031 7.807L0 32l8.418-2.007A15.93 15.93 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 01-6.784-1.858l-.486-.29-5.001 1.193 1.216-4.872-.317-.499A13.26 13.26 0 012.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.27-9.862c-.398-.2-2.355-1.162-2.72-1.294-.366-.133-.633-.2-.9.2-.266.398-1.031 1.294-1.265 1.56-.233.266-.466.3-.864.1-.398-.2-1.682-.62-3.203-1.977-1.184-1.056-1.983-2.36-2.216-2.758-.233-.398-.025-.614.175-.812.18-.178.398-.466.598-.698.2-.233.266-.4.4-.666.133-.267.066-.5-.033-.7-.1-.2-.9-2.167-1.233-2.967-.324-.78-.654-.674-.9-.686l-.766-.013c-.266 0-.7.1-1.066.5-.366.398-1.4 1.367-1.4 3.334s1.433 3.867 1.633 4.133c.2.267 2.82 4.302 6.833 6.035.954.412 1.699.658 2.28.843.957.305 1.829.262 2.517.159.768-.115 2.355-.963 2.688-1.893.333-.93.333-1.727.233-1.893-.1-.167-.366-.267-.764-.467z" fill="#fff"/>
      </svg>
      <span className={styles.pulse} />
    </a>
  )
}
