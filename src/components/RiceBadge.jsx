import riceLogo from '../../RİCE RP.png'

export default function RiceBadge({ className = '', style }) {
  return (
    <img
      src={riceLogo}
      alt="Rice Roleplay"
      className={`block object-contain ${className}`}
      style={style}
    />
  )
}
