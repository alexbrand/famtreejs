import type { NodeComponentProps } from '../../types';

interface DetailedPersonData {
  name: string;
  birthDate?: string;
  deathDate?: string;
  photoUrl?: string;
}

export function DetailedPersonCard({
  data,
  isSelected,
  isHovered,
}: NodeComponentProps<DetailedPersonData>) {
  const { name, birthDate, deathDate, photoUrl } = data;

  const lifespan =
    birthDate || deathDate
      ? `${birthDate || '?'} - ${deathDate || ''}`
      : null;

  return (
    <div
      style={{
        padding: '8px',
        borderRadius: '8px',
        backgroundColor: isSelected
          ? 'color-mix(in srgb, var(--ft-node-selected-border) 15%, var(--ft-node-background))'
          : isHovered
            ? 'color-mix(in srgb, var(--ft-node-border) 20%, var(--ft-node-background))'
            : 'var(--ft-node-background)',
        border: `2px solid ${isSelected ? 'var(--ft-node-selected-border)' : isHovered ? 'var(--ft-node-hover-border)' : 'var(--ft-node-border)'}`,
        boxShadow: isSelected
          ? '0 2px 8px var(--ft-node-selected-shadow)'
          : isHovered
            ? '0 2px 8px var(--ft-node-shadow)'
            : '0 1px 3px var(--ft-node-shadow)',
        transition: 'all 0.2s ease',
        textAlign: 'center',
        minWidth: '100px',
        color: 'var(--ft-node-text)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      {photoUrl && (
        <img
          src={photoUrl}
          alt={name}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid var(--ft-node-border)',
          }}
        />
      )}
      <div style={{ fontWeight: 600, fontSize: '13px', lineHeight: 1.2 }}>
        {name}
      </div>
      {lifespan && (
        <div style={{ fontSize: '11px', opacity: 0.7 }}>
          {lifespan}
        </div>
      )}
    </div>
  );
}
