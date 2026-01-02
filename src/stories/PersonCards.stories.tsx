import type { Meta, StoryObj } from '@storybook/react-vite';
import { BasicPersonCard } from '../components/defaults/BasicPersonCard';
import { DetailedPersonCard } from '../components/defaults/DetailedPersonCard';
import '../styles/theme.css';

// Wrapper to provide CSS variable context
const ThemeWrapper = ({
  theme,
  children,
}: {
  theme: 'light' | 'dark';
  children: React.ReactNode;
}) => (
  <div
    className={`family-tree family-tree--${theme}`}
    style={{
      padding: '20px',
      background: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
      minHeight: '150px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {children}
  </div>
);

// BasicPersonCard stories
const basicMeta: Meta<typeof BasicPersonCard> = {
  title: 'Components/BasicPersonCard',
  component: BasicPersonCard,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    isSelected: { control: 'boolean' },
    isHovered: { control: 'boolean' },
    isExpanded: { control: 'boolean' },
  },
};

export default basicMeta;
type BasicStory = StoryObj<typeof BasicPersonCard>;

export const Default: BasicStory = {
  args: {
    id: 'person-1',
    data: { name: 'John Doe' },
    isSelected: false,
    isHovered: false,
    isExpanded: false,
    onToggleExpand: () => {},
  },
  decorators: [
    (Story) => (
      <ThemeWrapper theme="light">
        <Story />
      </ThemeWrapper>
    ),
  ],
};

export const Hovered: BasicStory = {
  args: {
    ...Default.args,
    isHovered: true,
  },
  decorators: Default.decorators,
};

export const Selected: BasicStory = {
  args: {
    ...Default.args,
    isSelected: true,
  },
  decorators: Default.decorators,
};

export const DarkTheme: BasicStory = {
  args: {
    ...Default.args,
  },
  decorators: [
    (Story) => (
      <ThemeWrapper theme="dark">
        <Story />
      </ThemeWrapper>
    ),
  ],
};

// DetailedPersonCard meta (separate file in real setup, but combined here for simplicity)
export const Detailed: StoryObj<typeof DetailedPersonCard> = {
  render: (args) => (
    <ThemeWrapper theme="light">
      <DetailedPersonCard {...args} />
    </ThemeWrapper>
  ),
  args: {
    id: 'person-1',
    data: {
      name: 'Jane Smith',
      birthDate: '1985',
      photoUrl: 'https://i.pravatar.cc/100?img=47',
    },
    isSelected: false,
    isHovered: false,
    isExpanded: false,
    onToggleExpand: () => {},
  },
};

export const DetailedWithDates: StoryObj<typeof DetailedPersonCard> = {
  render: (args) => (
    <ThemeWrapper theme="light">
      <DetailedPersonCard {...args} />
    </ThemeWrapper>
  ),
  args: {
    id: 'person-2',
    data: {
      name: 'Robert Johnson',
      birthDate: '1940',
      deathDate: '2020',
      photoUrl: 'https://i.pravatar.cc/100?img=70',
    },
    isSelected: false,
    isHovered: false,
    isExpanded: false,
    onToggleExpand: () => {},
  },
};

export const DetailedNoPhoto: StoryObj<typeof DetailedPersonCard> = {
  render: (args) => (
    <ThemeWrapper theme="light">
      <DetailedPersonCard {...args} />
    </ThemeWrapper>
  ),
  args: {
    id: 'person-3',
    data: {
      name: 'Emily Davis',
      birthDate: '1995',
    },
    isSelected: false,
    isHovered: false,
    isExpanded: false,
    onToggleExpand: () => {},
  },
};

export const DetailedDarkTheme: StoryObj<typeof DetailedPersonCard> = {
  render: (args) => (
    <ThemeWrapper theme="dark">
      <DetailedPersonCard {...args} />
    </ThemeWrapper>
  ),
  args: {
    id: 'person-1',
    data: {
      name: 'Jane Smith',
      birthDate: '1985',
      photoUrl: 'https://i.pravatar.cc/100?img=47',
    },
    isSelected: false,
    isHovered: false,
    isExpanded: false,
    onToggleExpand: () => {},
  },
};
