// Current-enterprise context: loads the enterprise list and tracks which one
// the user is working in (persisted in localStorage). Every scoped page reads
// the current enterprise from here and passes its id into GraphQL queries.
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ENTERPRISES_QUERY = gql`
  query Enterprises {
    enterprises {
      id
      name
      description
      goal
    }
  }
`;

export interface Enterprise {
  id: string;
  name: string;
  description?: string | null;
  goal?: string | null;
}

interface EnterprisesData {
  enterprises: Enterprise[];
}

interface EnterpriseContextValue {
  enterprises: Enterprise[];
  // null while loading or when no enterprise exists yet.
  enterprise: Enterprise | null;
  setEnterpriseId: (id: string) => void;
  refetch: () => void;
  loading: boolean;
}

const EnterpriseContext = createContext<EnterpriseContextValue | null>(null);

const STORAGE_KEY = 'enterpriseId';

export function EnterpriseProvider({ children }: { children: React.ReactNode }) {
  const { data, loading, refetch } = useQuery<EnterprisesData>(ENTERPRISES_QUERY);
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEY),
  );

  const enterprises = data?.enterprises ?? [];
  const enterprise = enterprises.find((e) => e.id === selectedId) ?? enterprises[0] ?? null;

  const setEnterpriseId = useCallback((id: string) => {
    localStorage.setItem(STORAGE_KEY, id);
    setSelectedId(id);
  }, []);

  const value = useMemo(
    () => ({ enterprises, enterprise, setEnterpriseId, refetch: () => refetch(), loading }),
    [enterprises, enterprise, setEnterpriseId, refetch, loading],
  );

  return <EnterpriseContext.Provider value={value}>{children}</EnterpriseContext.Provider>;
}

export function useEnterprise(): EnterpriseContextValue {
  const ctx = useContext(EnterpriseContext);
  if (!ctx) throw new Error('useEnterprise must be used within an EnterpriseProvider');
  return ctx;
}
