import type { Meta, StoryObj } from '@storybook/react';
import { FamilyTreeWithProvider as FamilyTree } from '../components/FamilyTreeWithProvider';
import { BasicPersonCard } from '../components/defaults/BasicPersonCard';
import { DetailedPersonCard } from '../components/defaults/DetailedPersonCard';
import type { FamilyTreeData, Orientation, Theme } from '../types';

// Sample data: Simple family
const simpleFamily: FamilyTreeData<{ name: string }> = {
  people: [
    { id: 'p1', data: { name: 'John' } },
    { id: 'p2', data: { name: 'Mary' } },
    { id: 'c1', data: { name: 'Alice' } },
  ],
  partnerships: [{ id: 'u1', partnerIds: ['p1', 'p2'], childIds: ['c1'] }],
};

// Sample data: Multi-generational family
const multiGenFamily: FamilyTreeData<{ name: string }> = {
  people: [
    { id: 'gp1', data: { name: 'John Sr.' } },
    { id: 'gp2', data: { name: 'Mary' } },
    { id: 'p1', data: { name: 'John Jr.' } },
    { id: 'p2', data: { name: 'Sarah' } },
    { id: 'p3', data: { name: 'Jane' } },
    { id: 'p4', data: { name: 'Mike' } },
    { id: 'c1', data: { name: 'Emily' } },
    { id: 'c2', data: { name: 'James' } },
    { id: 'c3', data: { name: 'Sophie' } },
  ],
  partnerships: [
    { id: 'u1', partnerIds: ['gp1', 'gp2'], childIds: ['p1', 'p3'] },
    { id: 'u2', partnerIds: ['p1', 'p2'], childIds: ['c1', 'c2'] },
    { id: 'u3', partnerIds: ['p3', 'p4'], childIds: ['c3'] },
  ],
};

// Sample data: With dates and photos
const detailedFamily: FamilyTreeData<{
  name: string;
  birthDate?: string;
  deathDate?: string;
  photoUrl?: string;
}> = {
  people: [
    {
      id: 'gp1',
      data: {
        name: 'William',
        birthDate: '1940',
        deathDate: '2010',
        photoUrl: 'https://i.pravatar.cc/100?img=70',
      },
    },
    {
      id: 'gp2',
      data: {
        name: 'Elizabeth',
        birthDate: '1942',
        photoUrl: 'https://i.pravatar.cc/100?img=47',
      },
    },
    {
      id: 'p1',
      data: {
        name: 'Charles',
        birthDate: '1965',
        photoUrl: 'https://i.pravatar.cc/100?img=68',
      },
    },
    {
      id: 'p2',
      data: {
        name: 'Diana',
        birthDate: '1968',
        photoUrl: 'https://i.pravatar.cc/100?img=45',
      },
    },
    {
      id: 'c1',
      data: {
        name: 'George',
        birthDate: '1990',
        photoUrl: 'https://i.pravatar.cc/100?img=59',
      },
    },
  ],
  partnerships: [
    { id: 'u1', partnerIds: ['gp1', 'gp2'], childIds: ['p1'] },
    { id: 'u2', partnerIds: ['p1', 'p2'], childIds: ['c1'] },
  ],
};

const meta: Meta<typeof FamilyTree> = {
  title: 'Components/FamilyTree',
  component: FamilyTree,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100vw', height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['top-down', 'bottom-up', 'left-right', 'right-left'] as Orientation[],
    },
    theme: {
      control: 'select',
      options: ['light', 'dark'] as Theme[],
    },
    initialZoom: {
      control: { type: 'range', min: 0.1, max: 3, step: 0.1 },
    },
    minZoom: {
      control: { type: 'range', min: 0.1, max: 1, step: 0.1 },
    },
    maxZoom: {
      control: { type: 'range', min: 1, max: 5, step: 0.1 },
    },
    disableAnimations: {
      control: 'boolean',
    },
    animationDuration: {
      control: { type: 'range', min: 0, max: 1000, step: 50 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof FamilyTree>;

export const Default: Story = {
  args: {
    data: simpleFamily,
    nodeComponent: BasicPersonCard,
    orientation: 'top-down',
    theme: 'light',
  },
};

export const MultiGenerational: Story = {
  args: {
    data: multiGenFamily,
    nodeComponent: BasicPersonCard,
    orientation: 'top-down',
    theme: 'light',
  },
};

export const DarkTheme: Story = {
  args: {
    data: multiGenFamily,
    nodeComponent: BasicPersonCard,
    orientation: 'top-down',
    theme: 'dark',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export const LeftToRight: Story = {
  args: {
    data: multiGenFamily,
    nodeComponent: BasicPersonCard,
    orientation: 'left-right',
    theme: 'light',
  },
};

export const RightToLeft: Story = {
  args: {
    data: multiGenFamily,
    nodeComponent: BasicPersonCard,
    orientation: 'right-left',
    theme: 'light',
  },
};

export const BottomUp: Story = {
  args: {
    data: multiGenFamily,
    nodeComponent: BasicPersonCard,
    orientation: 'bottom-up',
    theme: 'light',
  },
};

export const WithDetailedCards: Story = {
  args: {
    data: detailedFamily,
    nodeComponent: DetailedPersonCard,
    orientation: 'top-down',
    theme: 'light',
    disableAnimations: true,
  },
};

export const NoAnimations: Story = {
  args: {
    data: multiGenFamily,
    nodeComponent: BasicPersonCard,
    orientation: 'top-down',
    theme: 'light',
    disableAnimations: true,
  },
};

export const CustomSpacing: Story = {
  args: {
    data: multiGenFamily,
    nodeComponent: BasicPersonCard,
    orientation: 'top-down',
    theme: 'light',
    spacing: {
      generation: 200,
      siblings: 100,
      partners: 60,
    },
  },
};

export const CustomLineStyle: Story = {
  args: {
    data: multiGenFamily,
    nodeComponent: BasicPersonCard,
    orientation: 'top-down',
    theme: 'light',
    lineStyle: {
      stroke: '#e91e63',
      strokeWidth: 3,
    },
  },
};
