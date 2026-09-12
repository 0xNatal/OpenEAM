import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
  DELETE_INFORMATION_OBJECT,
  InformationObjectFormSheet,
} from '@/components/information-objects/information-object-form-sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  contentWidthClassName,
  PageHeader,
  pageBackLinkClassName,
} from '@/components/ui/page-header';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEnterprise } from '@/lib/enterprise';
import type {
  InformationCapabilityLink,
  InformationObjectDetail,
  InformationUsage,
} from '@/lib/entities';
import {
  INFORMATION_USAGE_HINT,
  INFORMATION_USAGE_LABEL,
  INFORMATION_USAGE_STYLE,
  INFORMATION_USAGES,
} from '@/lib/information-usage';

const INFORMATION_OBJECT_QUERY = gql`
  query InformationObject($id: String!) {
    informationObject(id: $id) {
      id
      enterpriseId
      name
      description
      capabilities {
        linkId
        capabilityId
        capabilityName
        usage
        validFrom
        validTo
      }
    }
  }
`;

const CAPABILITIES_QUERY = gql`
  query CapabilitiesForInformation($enterpriseId: String!) {
    businessCapabilities(enterpriseId: $enterpriseId) {
      id
      name
    }
  }
`;

const LINK_CAPABILITY_INFORMATION = gql`
  mutation LinkCapabilityInformation($input: CapabilityInformationInput!) {
    linkCapabilityInformation(input: $input) {
      id
    }
  }
`;

const UNLINK_CAPABILITY_INFORMATION = gql`
  mutation UnlinkCapabilityInformation($linkId: String!) {
    unlinkCapabilityInformation(linkId: $linkId)
  }
`;

interface InformationObjectData {
  informationObject: InformationObjectDetail | null;
}
interface CapabilitiesData {
  businessCapabilities: Array<{ id: string; name: string }>;
}

function LinkRow({ link, onRemove }: { link: InformationCapabilityLink; onRemove: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/50 px-3 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <Link
          to="/capabilities/$capabilityId"
          params={{ capabilityId: link.capabilityId }}
          className="truncate text-xs text-foreground hover:underline"
        >
          {link.capabilityName}
        </Link>
        <span
          className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${INFORMATION_USAGE_STYLE[link.usage]}`}
        >
          {INFORMATION_USAGE_LABEL[link.usage]}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="font-mono text-[10px] text-muted-foreground">
          {link.validFrom ?? '…'} – {link.validTo ?? '…'}
        </span>
        <Button variant="ghost" size="sm" onClick={onRemove} className="h-7 px-2">
          <Trash2 className="size-3" />
        </Button>
      </div>
    </div>
  );
}

function InformationObjectDetailRoute() {
  const { informationObjectId } = Route.useParams();
  const navigate = useNavigate();
  const { enterprise } = useEnterprise();
  const { data, loading, error, refetch } = useQuery<InformationObjectData>(
    INFORMATION_OBJECT_QUERY,
    { variables: { id: informationObjectId } },
  );
  const { data: capData } = useQuery<CapabilitiesData>(CAPABILITIES_QUERY, {
    variables: { enterpriseId: enterprise?.id },
    skip: !enterprise,
  });

  const [linkCapabilityInformation, { error: linkError }] = useMutation(
    LINK_CAPABILITY_INFORMATION,
  );
  const [unlinkCapabilityInformation] = useMutation(UNLINK_CAPABILITY_INFORMATION);
  // Evict the deleted row so the list this navigates back to does not serve
  // it from cache. Apollo drops dangling references from arrays on its own.
  const [deleteInformationObject] = useMutation(DELETE_INFORMATION_OBJECT, {
    update(cache, _result, { variables }) {
      cache.evict({
        id: cache.identify({ __typename: 'InformationObject', id: variables?.id }),
      });
      cache.gc();
    },
  });
  const [sheetOpen, setSheetOpen] = useState(false);
  const [capabilityId, setCapabilityId] = useState('');
  const [usage, setUsage] = useState<InformationUsage>('USES');
  const [validFrom, setValidFrom] = useState('');

  const info = data?.informationObject;

  if (loading) {
    return (
      <div className={contentWidthClassName}>
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }
  if (error || !info) {
    return (
      <div className={contentWidthClassName}>
        <p className="text-sm text-destructive">Information object not found.</p>
      </div>
    );
  }

  const current = info.capabilities.filter((c) => c.validTo === null);
  const ended = info.capabilities.filter((c) => c.validTo !== null);
  const owner = current.find((c) => c.usage === 'OWNS');

  const handleLink = async () => {
    await linkCapabilityInformation({
      variables: {
        input: {
          capabilityId,
          informationObjectId: info.id,
          usage,
          validFrom: validFrom || null,
          validTo: null,
        },
      },
    });
    setCapabilityId('');
    setValidFrom('');
    await refetch();
  };

  const handleRemove = async (linkId: string) => {
    await unlinkCapabilityInformation({ variables: { linkId } });
    await refetch();
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete the information object "${info.name}"?`)) return;
    await deleteInformationObject({ variables: { id: info.id } });
    navigate({ to: '/information-objects' });
  };

  const linkedIds = new Set(current.map((c) => c.capabilityId));
  const available = (capData?.businessCapabilities ?? []).filter((c) => !linkedIds.has(c.id));

  return (
    <div className={contentWidthClassName}>
      <PageHeader
        back={
          <Link to="/information-objects" className={pageBackLinkClassName}>
            <ChevronLeft className="size-3" /> Information
          </Link>
        }
        title={info.name}
        action={
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setSheetOpen(true)}>
              Edit
            </Button>
            <Button variant="ghost" className="text-destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        }
      />

      {info.description && <p className="text-sm text-muted-foreground">{info.description}</p>}

      <p className="pt-1 text-sm">
        {owner ? (
          <span className="text-muted-foreground">
            Owned by <span className="text-foreground">{owner.capabilityName}</span> — accountable
            for it being correct.
          </span>
        ) : (
          <span className="text-amber-700 dark:text-amber-400">
            No capability owns this yet. Nobody is accountable for it being correct.
          </span>
        )}
      </p>

      <section className="flex flex-col gap-3 pt-4">
        <h2 className="text-sm font-medium">Capabilities</h2>
        <p className="text-xs text-muted-foreground">
          Which capabilities touch this information, and how.
        </p>

        {current.length > 0 ? (
          <div className="flex flex-col gap-2">
            {current.map((link) => (
              <LinkRow key={link.linkId} link={link} onRemove={() => handleRemove(link.linkId)} />
            ))}
          </div>
        ) : (
          <p className="text-xs italic text-muted-foreground">Not linked to any capability yet.</p>
        )}

        <div className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-border p-3">
          <label
            htmlFor="info-link-capability"
            className="flex min-w-48 flex-1 flex-col gap-1 text-xs font-medium text-muted-foreground"
          >
            Capability
            <Select value={capabilityId} onValueChange={setCapabilityId}>
              <SelectTrigger id="info-link-capability" className="w-full">
                <SelectValue placeholder="Choose…" />
              </SelectTrigger>
              <SelectContent>
                {available.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label
            htmlFor="info-link-usage"
            className="flex flex-col gap-1 text-xs font-medium text-muted-foreground"
          >
            Usage
            <Select value={usage} onValueChange={(v) => setUsage(v as InformationUsage)}>
              <SelectTrigger id="info-link-usage" className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INFORMATION_USAGES.map((u) => (
                  <SelectItem key={u} value={u}>
                    {INFORMATION_USAGE_LABEL[u]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label
            htmlFor="info-link-valid-from"
            className="flex flex-col gap-1 text-xs font-medium text-muted-foreground"
          >
            From
            <Input
              id="info-link-valid-from"
              type="date"
              className="w-40"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
            />
          </label>

          <Button onClick={handleLink} disabled={!capabilityId}>
            Add
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">{INFORMATION_USAGE_HINT[usage]}</p>

        {linkError && <p className="text-sm text-destructive">{linkError.message}</p>}

        {ended.length > 0 && (
          <details className="pt-2">
            <summary className="cursor-pointer text-xs text-muted-foreground">
              Ended ({ended.length})
            </summary>
            <div className="flex flex-col gap-2 pt-2 opacity-60">
              {ended.map((link) => (
                <LinkRow key={link.linkId} link={link} onRemove={() => handleRemove(link.linkId)} />
              ))}
            </div>
          </details>
        )}
      </section>

      {enterprise && (
        <InformationObjectFormSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          informationObject={info}
          enterpriseId={info.enterpriseId}
          onSaved={refetch}
        />
      )}
    </div>
  );
}

export const Route = createFileRoute('/information-objects/$informationObjectId')({
  component: InformationObjectDetailRoute,
});
