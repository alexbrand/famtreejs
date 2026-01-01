import { forwardRef } from 'react';
import { FamilyTree } from './FamilyTree';
import { FamilyTreeProvider } from '../store/FamilyTreeContext';
import type { FamilyTreeProps, FamilyTreeHandle } from '../types';

/**
 * FamilyTree component wrapped with provider for hook access
 * This is the main export that users should use
 */
function FamilyTreeWithProviderInner<T>(
  props: FamilyTreeProps<T>,
  ref: React.ForwardedRef<FamilyTreeHandle>
) {
  const { minZoom, maxZoom, ...rest } = props;

  return (
    <FamilyTreeProvider minZoom={minZoom} maxZoom={maxZoom}>
      <FamilyTree ref={ref} minZoom={minZoom} maxZoom={maxZoom} {...rest} />
    </FamilyTreeProvider>
  );
}

export const FamilyTreeWithProvider = forwardRef(FamilyTreeWithProviderInner) as <T>(
  props: FamilyTreeProps<T> & { ref?: React.ForwardedRef<FamilyTreeHandle> }
) => React.ReactElement;
