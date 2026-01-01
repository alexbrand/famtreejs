import type { NodeComponentProps } from '../../types';

interface BasicPersonData {
  name: string;
}

export function BasicPersonCard({
  data,
  isSelected,
  isHovered,
}: NodeComponentProps<BasicPersonData>) {
  return (
    <div
      style={{
        padding: '8px 12px',
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
        minWidth: '80px',
        color: 'var(--ft-node-text)',
      }}
    >
      <div style={{ fontWeight: 500, fontSize: '14px' }}>{data.name}</div>
    </div>
  );
}
