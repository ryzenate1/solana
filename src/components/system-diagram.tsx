export function SystemDiagram({ variant = 'residential' }: { variant?: 'residential' | 'commercial' }) {
  const commercial = variant === 'commercial';
  return <div className={`architecture-study ${commercial ? 'commercial-study' : ''}`}>
    <svg viewBox="0 0 800 520" role="img" aria-label={`Conceptual ${variant} solar roof drawing, not a completed project`}>
      <defs><pattern id={`cells-${variant}`} width="31" height="21" patternUnits="userSpaceOnUse"><rect width="29" height="19" fill="#1c252e" stroke="#57646c" strokeWidth=".5"/></pattern><linearGradient id={`roof-${variant}`} x2="1" y2="1"><stop stopColor="#313a42"/><stop offset="1" stopColor="#10161b"/></linearGradient></defs>
      <g className="draft-grid" stroke="#30363b" strokeWidth=".6" fill="none"><path d="M40 360 390 160 760 360 410 560ZM40 280 390 80 760 280 410 480ZM40 200 390 0 760 200 410 400"/><path d="M140 0v520M400 0v520M660 0v520" strokeDasharray="3 9"/></g>
      {commercial ? <g stroke="#6e7b84" strokeWidth="1.1" fill="none"><path d="m120 270 330-160 250 125-330 162Z" fill={`url(#roof-${variant})`}/><path d="M120 270v85l250 125 330-160v-85M370 397v83"/><path d="m165 265 276-132 214 104-276 135Z" fill={`url(#cells-${variant})`}/><path d="m140 330 208 104m45-4 280-135M140 310l208 104m45-4 280-135" stroke="#3b4851"/></g> : <g stroke="#6e7b84" strokeWidth="1.1" fill="none"><path d="m105 260 285-145 305 151-286 148Z" fill="#141b20"/><path d="M105 260v66l304 150 286-145v-65M409 414v62"/><path d="m105 260 126-187 159 42-62 256Z" fill={`url(#roof-${variant})`}/><path d="m231 73 305 149 159 44-305-151Z" fill="#222c33"/><path d="m148 246 99-145 111 31-50 199Z" fill={`url(#cells-${variant})`}/><path d="m458 344 73-38v93l-73 38ZM574 285l65-33v61l-65 33Z"/><path d="m136 301 211 104" stroke="#3b4851"/></g>}
      <g fill="none" stroke="#b49a70" strokeWidth=".8"><path d="M110 420H55v-45M690 100h55v45"/><path d="m300 176 60-94h160"/><circle cx="300" cy="176" r="3" fill="#b49a70"/></g>
      <text x="375" y="68" fill="#a5adb2" fontSize="10" fontFamily="monospace" letterSpacing="2">SOLAR ARRAY / CONCEPT STUDY</text>
    </svg>
    <div className="study-caption mono"><span>FIG. {commercial ? '02' : '01'} / {variant.toUpperCase()}</span><span>CONCEPT DRAWING</span></div>
  </div>;
}
