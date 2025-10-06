import { theme } from '@/lib/theme';

interface LogoCustomProps {
  size?: number;
  showText?: boolean;
  className?: string;
  textColor?: string;
}

export default function LogoCustom({ 
  size = 40, 
  showText = true, 
  className = '',
  textColor
}: LogoCustomProps) {
  return (
    <div className={`flex items-center ${className}`}>
      {/* Text */}
      {showText && (
        <span
          style={{
            color: textColor || theme.colors.text,
            fontWeight: 600,
            fontSize: `${size * 0.4}px`,
            fontFamily: theme.font.main,
            letterSpacing: '-0.02em',
            marginRight: '-8px',
          }}
        >
          Boti
        </span>
      )}
      
      {/* SVG Logo - Usando o logo-boti.svg */}
      <img
        src="/logo-boti.svg"
        alt="Boti Logo"
        width={size * 1.2}
        height={size * 1.2}
        style={{
          objectFit: 'contain',
          margin: 0,
          padding: 0,
          display: 'block',
        }}
      />
    </div>
  );
}
