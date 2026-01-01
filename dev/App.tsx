import { FamilyTree } from '../src/components/FamilyTree';
import { BasicPersonCard } from '../src/components/defaults/BasicPersonCard';
import type { FamilyTreeData } from '../src/types';

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

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', padding: '20px', boxSizing: 'border-box' }}>
      <h1 style={{ margin: '0 0 20px', fontFamily: 'system-ui' }}>Family Tree Demo</h1>
      <div style={{ width: '100%', height: 'calc(100% - 60px)', border: '1px solid #ddd', borderRadius: '8px' }}>
        <FamilyTree
          data={sampleData}
          nodeComponent={BasicPersonCard}
          onPersonClick={(id, data) => console.log('Clicked:', id, data)}
          onPersonHover={(id, data) => console.log('Hover:', id, data)}
        />
      </div>
    </div>
  );
}

export default App;
