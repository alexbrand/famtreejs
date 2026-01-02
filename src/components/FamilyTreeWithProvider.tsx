import { forwardRef, useRef, useEffect } from 'react';
import { FamilyTree } from './FamilyTree';
import { FamilyTreeProvider, useTreeStoreRaw } from '../store/FamilyTreeContext';
import type { FamilyTreeProps, FamilyTreeHandle } from '../types';

/**
 * Bridge component that connects FamilyTree methods to the store
 */
function FamilyTreeBridge<T>({
  innerRef,
  ...props
}: FamilyTreeProps<T> & { innerRef: React.ForwardedRef<FamilyTreeHandle> }) {
  const localRef = useRef<FamilyTreeHandle>(null);
  // Use raw store reference to avoid subscribing to state changes
  // This prevents infinite loops when _registerCallbacks updates state
  const storeApi = useTreeStoreRaw();

  // Register callbacks when component mounts
  useEffect(() => {
    if (localRef.current) {
      storeApi.getState()._registerCallbacks(
        localRef.current.centerOnPerson,
        localRef.current.fitToView,
        localRef.current.expandAll
      );
    }
    return () => {
      storeApi.getState()._unregisterCallbacks();
    };
  }, [storeApi]);

  // Forward the ref to both local and external
  const setRefs = (handle: FamilyTreeHandle | null) => {
    (localRef as React.MutableRefObject<FamilyTreeHandle | null>).current = handle;
    if (typeof innerRef === 'function') {
      innerRef(handle);
    } else if (innerRef) {
      // eslint-disable-next-line react-hooks/immutability -- This is the standard pattern for ref forwarding
      (innerRef as React.MutableRefObject<FamilyTreeHandle | null>).current = handle;
    }
  };

  return <FamilyTree ref={setRefs} {...props} />;
}

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
      <FamilyTreeBridge innerRef={ref} minZoom={minZoom} maxZoom={maxZoom} {...rest} />
    </FamilyTreeProvider>
  );
}

export const FamilyTreeWithProvider = forwardRef(FamilyTreeWithProviderInner) as <T>(
  props: FamilyTreeProps<T> & { ref?: React.ForwardedRef<FamilyTreeHandle> }
) => React.ReactElement;
