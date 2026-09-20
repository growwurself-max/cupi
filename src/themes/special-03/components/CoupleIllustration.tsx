import { motion } from 'framer-motion'

export function CoupleIllustration() {
  return (
    <motion.svg
      viewBox="0 0 280 200"
      className="mx-auto h-40 w-56 sm:h-48 sm:w-64"
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      aria-hidden
    >
      <ellipse cx="140" cy="178" rx="90" ry="14" fill="rgba(180,140,100,0.12)" />
      <circle cx="108" cy="88" r="28" fill="#FFE8D6" stroke="#E8C4A8" strokeWidth="2" />
      <circle cx="172" cy="88" r="28" fill="#FFD6E8" stroke="#E8A8C4" strokeWidth="2" />
      <path d="M96 78 Q108 68 118 78" stroke="#5C4033" strokeWidth="2" fill="none" />
      <path d="M162 78 Q172 68 182 78" stroke="#5C4033" strokeWidth="2" fill="none" />
      <circle cx="102" cy="86" r="3" fill="#5C4033" />
      <circle cx="114" cy="86" r="3" fill="#5C4033" />
      <circle cx="166" cy="86" r="3" fill="#5C4033" />
      <circle cx="178" cy="86" r="3" fill="#5C4033" />
      <path d="M104 96 Q108 100 112 96" stroke="#E879A9" strokeWidth="2" fill="none" />
      <path d="M168 96 Q172 100 176 96" stroke="#E879A9" strokeWidth="2" fill="none" />
      <path
        d="M108 116 L108 160 Q108 170 118 170 L130 170 Q140 170 140 160 L140 116"
        fill="#F5DEB3"
      />
      <path
        d="M140 116 L140 160 Q140 170 150 170 L162 170 Q172 170 172 160 L172 116"
        fill="#FFB6C1"
      />
      <path d="M118 170 L162 170" stroke="#E8C4A8" strokeWidth="2" />
      <motion.path
        d="M125 130 Q140 145 155 130"
        stroke="#E11D48"
        strokeWidth="3"
        fill="none"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </motion.svg>
  )
}
