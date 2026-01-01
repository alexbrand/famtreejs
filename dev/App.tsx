import { useState } from 'react';
import { FamilyTree } from '../src/components/FamilyTree';
import { BasicPersonCard } from '../src/components/defaults/BasicPersonCard';
import type { FamilyTreeData, Orientation, Theme } from '../src/types';

// Sample data: A multi-generational family tree
const sampleData: FamilyTreeData<{ name: string }> = {
  people: [
    // Grandparents
    { id: 'gp1', data: { name: 'John Sr.' } },
    { id: 'gp2', data: { name: 'Mary' } },
    // Parents generation
    { id: 'p1', data: { name: 'John Jr.' } },
    { id: 'p2', data: { name: 'Sarah' } },
    { id: 'p3', data: { name: 'Jane' } },
    { id: 'p4', data: { name: 'Mike' } },
    // Children
    { id: 'c1', data: { name: 'Emily' } },
    { id: 'c2', data: { name: 'James' } },
    { id: 'c3', data: { name: 'Sophie' } },
  ],
  partnerships: [
    // Grandparents marriage -> 2 children
    { id: 'u1', partnerIds: ['gp1', 'gp2'], childIds: ['p1', 'p3'] },
    // John Jr. + Sarah -> 2 children
    { id: 'u2', partnerIds: ['p1', 'p2'], childIds: ['c1', 'c2'] },
    // Jane + Mike -> 1 child
    { id: 'u3', partnerIds: ['p3', 'p4'], childIds: ['c3'] },
  ],
};

const orientations: Orientation[] = ['top-down', 'bottom-up', 'left-right', 'right-left'];
const themes: Theme[] = ['light', 'dark'];

function App() {
  const [orientation, setOrientation] = useState<Orientation>('top-down');
  const [theme, setTheme] = useState<Theme>('light');

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        padding: '20px',
        boxSizing: 'border-box',
        background: theme === 'dark' ? '#1a1a1a' : '#fff',
        color: theme === 'dark' ? '#fff' : '#000',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontFamily: 'system-ui' }}>Family Tree Demo</h1>

        <label style={{ fontFamily: 'system-ui' }}>
          Orientation:{' '}
          <select
            value={orientation}
            onChange={(e) => setOrientation(e.target.value as Orientation)}
            style={{ padding: '4px 8px' }}
          >
            {orientations.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>

        <label style={{ fontFamily: 'system-ui' }}>
          Theme:{' '}
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as Theme)}
            style={{ padding: '4px 8px' }}
          >
            {themes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div
        style={{
          width: '100%',
          height: 'calc(100% - 60px)',
          border: theme === 'dark' ? '1px solid #444' : '1px solid #ddd',
          borderRadius: '8px',
          background: theme === 'dark' ? '#2a2a2a' : '#fff',
        }}
      >
        <FamilyTree
          data={sampleData}
          nodeComponent={BasicPersonCard}
          orientation={orientation}
          theme={theme}
          onPersonClick={(id, data) => console.log('Clicked:', id, data)}
          onPersonHover={(id, data) => console.log('Hover:', id, data)}
        />
      </div>
    </div>
  );
}

export default App;
