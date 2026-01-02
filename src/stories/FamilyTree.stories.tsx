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

// ===== TV/Movie Inspired Examples =====

// The Simpsons Family
const simpsonsFamily: FamilyTreeData<{ name: string }> = {
  people: [
    { id: 'abe', data: { name: 'Abe Simpson' } },
    { id: 'mona', data: { name: 'Mona Simpson' } },
    { id: 'clancy', data: { name: 'Clancy Bouvier' } },
    { id: 'jackie', data: { name: 'Jackie Bouvier' } },
    { id: 'homer', data: { name: 'Homer Simpson' } },
    { id: 'marge', data: { name: 'Marge Simpson' } },
    { id: 'patty', data: { name: 'Patty Bouvier' } },
    { id: 'selma', data: { name: 'Selma Bouvier' } },
    { id: 'bart', data: { name: 'Bart Simpson' } },
    { id: 'lisa', data: { name: 'Lisa Simpson' } },
    { id: 'maggie', data: { name: 'Maggie Simpson' } },
  ],
  partnerships: [
    { id: 'u1', partnerIds: ['abe', 'mona'], childIds: ['homer'] },
    { id: 'u2', partnerIds: ['clancy', 'jackie'], childIds: ['marge', 'patty', 'selma'] },
    { id: 'u3', partnerIds: ['homer', 'marge'], childIds: ['bart', 'lisa', 'maggie'] },
  ],
};

export const TheSimpsons: Story = {
  args: {
    data: simpsonsFamily,
    nodeComponent: BasicPersonCard,
    orientation: 'top-down',
    theme: 'light',
  },
};

// Game of Thrones - House Stark
const starkFamily: FamilyTreeData<{ name: string }> = {
  people: [
    { id: 'rickard', data: { name: 'Rickard Stark' } },
    { id: 'lyarra', data: { name: 'Lyarra Stark' } },
    { id: 'ned', data: { name: 'Eddard Stark' } },
    { id: 'catelyn', data: { name: 'Catelyn Tully' } },
    { id: 'lyanna', data: { name: 'Lyanna Stark' } },
    { id: 'rhaegar', data: { name: 'Rhaegar Targaryen' } },
    { id: 'benjen', data: { name: 'Benjen Stark' } },
    { id: 'robb', data: { name: 'Robb Stark' } },
    { id: 'sansa', data: { name: 'Sansa Stark' } },
    { id: 'arya', data: { name: 'Arya Stark' } },
    { id: 'bran', data: { name: 'Bran Stark' } },
    { id: 'rickon', data: { name: 'Rickon Stark' } },
    { id: 'jon', data: { name: 'Jon Snow' } },
  ],
  partnerships: [
    { id: 'u1', partnerIds: ['rickard', 'lyarra'], childIds: ['ned', 'lyanna', 'benjen'] },
    { id: 'u2', partnerIds: ['ned', 'catelyn'], childIds: ['robb', 'sansa', 'arya', 'bran', 'rickon'] },
    { id: 'u3', partnerIds: ['lyanna', 'rhaegar'], childIds: ['jon'] },
  ],
};

export const HouseStark: Story = {
  args: {
    data: starkFamily,
    nodeComponent: BasicPersonCard,
    orientation: 'top-down',
    theme: 'dark',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

// Star Wars - Skywalker Family
const skywalkerFamily: FamilyTreeData<{ name: string }> = {
  people: [
    { id: 'shmi', data: { name: 'Shmi Skywalker' } },
    { id: 'anakin', data: { name: 'Anakin Skywalker' } },
    { id: 'padme', data: { name: 'Padmé Amidala' } },
    { id: 'luke', data: { name: 'Luke Skywalker' } },
    { id: 'leia', data: { name: 'Leia Organa' } },
    { id: 'han', data: { name: 'Han Solo' } },
    { id: 'ben', data: { name: 'Ben Solo' } },
  ],
  partnerships: [
    { id: 'u1', partnerIds: ['shmi'], childIds: ['anakin'] },
    { id: 'u2', partnerIds: ['anakin', 'padme'], childIds: ['luke', 'leia'] },
    { id: 'u3', partnerIds: ['han', 'leia'], childIds: ['ben'] },
  ],
};

export const Skywalkers: Story = {
  args: {
    data: skywalkerFamily,
    nodeComponent: BasicPersonCard,
    orientation: 'top-down',
    theme: 'light',
  },
};
