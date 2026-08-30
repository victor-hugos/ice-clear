function SectionLabel({ children, tone = 'sky' }) {
  const tones = {
    sky: 'text-cyan-700',
    light: 'text-cyan-100',
    emerald: 'text-emerald-700',
    amber: 'text-amber-700',
  }

  return (
    <p className={`font-mono text-xs uppercase tracking-[0.16em] ${tones[tone]}`}>
      {children}
    </p>
  )
}

export default SectionLabel
