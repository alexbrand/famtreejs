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
        backgroundColor: isSelected ? '#e3f2fd' : isHovered ? '#f5f5f5' : '#fff',
        border: `2px solid ${isSelected ? '#2196f3' : '#ddd'}`,
        boxShadow: isHovered ? '0 2px 8px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease',
        textAlign: 'center',
        minWidth: '80px',
      }}
    >
      <div style={{ fontWeight: 500, fontSize: '14px' }}>{data.name}</div>
    </div>
  );
}
