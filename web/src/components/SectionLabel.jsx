function SectionLabel({ children, tone = 'sky' }) {
  const tones = {
    sky: 'text-sky-700',
    light: 'text-sky-200',
    emerald: 'text-emerald-700',
  }

  return (
    <p className={`font-mono text-xs uppercase tracking-[0.28em] ${tones[tone]}`}>
      {children}
    </p>
  )
}

export default SectionLabel
