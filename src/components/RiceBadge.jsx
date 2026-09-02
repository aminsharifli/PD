import riceLogo from '../../RİCE RP.png'

/**
 * Rice Roleplay logo asset used in the application header, document heading,
 * and document watermark. Keeping it in one component ensures every instance
 * uses the same supplied brand image.
 */
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
