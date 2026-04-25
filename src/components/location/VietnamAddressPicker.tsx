import { JSX, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  buildVietnamAdministrativeDisplay,
  type VietnamAdministrativeSelection,
  type VietnamProvince,
  type VietnamWard,
  useVietnamProvinceSearchQuery,
  useVietnamProvinceQuery,
  useVietnamProvincesQuery,
  useVietnamWardSearchQuery,
} from '@/queries/VietNamProvinceAPI';
import { cn } from '@/lib/utils';

type SearchItem = VietnamProvince | VietnamWard;

export type VietnamAddressPickerProps = {
  label?: string;
  description?: string;
  error?: string;
  disabled?: boolean;
  onChange: (value: VietnamAdministrativeSelection) => void;
};

const renderHighlightedName = (item: SearchItem) => {
  if (!item.matches) {
    return item.name;
  }

  const matches = Object.values(item.matches).sort((left, right) => left[0] - right[0]);
  const nodes: JSX.Element[] = [];
  let lastPosition = 0;

  matches.forEach(([start, end], index) => {
    if (start > lastPosition) {
      nodes.push(<span key={`${item.code}-text-${index}`}>{item.name.slice(lastPosition, start)}</span>);
    }

    nodes.push(
      <strong key={`${item.code}-match-${index}`} className="font-semibold text-slate-900">
        {item.name.slice(start, end)}
      </strong>,
    );

    lastPosition = end;
  });

  if (lastPosition < item.name.length) {
    nodes.push(<span key={`${item.code}-tail`}>{item.name.slice(lastPosition)}</span>);
  }

  return nodes;
};

const SearchOption = ({
  item,
  onSelect,
}: {
  item: SearchItem;
  onSelect: (item: SearchItem) => void;
}) => (
  <li>
    <button
      type="button"
      className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-slate-50"
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => onSelect(item)}
    >
      <span className="min-w-0 flex-1 truncate">{renderHighlightedName(item)}</span>
      <span className="shrink-0 text-xs text-slate-400">#{item.code}</span>
    </button>
  </li>
);

export const VietnamAddressPicker = ({ label = 'Địa giới hành chính', description, error, disabled, onChange }: VietnamAddressPickerProps) => {
  const [provinceSearch, setProvinceSearch] = useState('');
  const [wardSearch, setWardSearch] = useState('');
  const [detail, setDetail] = useState('');

  const [provinceListShown, setProvinceListShown] = useState(false);
  const [wardListShown, setWardListShown] = useState(false);

  const [selectedProvince, setSelectedProvince] = useState<VietnamProvince | null>(null);
  const [selectedWard, setSelectedWard] = useState<VietnamWard | null>(null);

  const provinceWrapRef = useRef<HTMLDivElement>(null);
  const wardWrapRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  const lastEmittedAddressRef = useRef<string | null>(null);

  const deferredProvinceSearch = useDeferredValue(provinceSearch.trim());
  const deferredWardSearch = useDeferredValue(wardSearch.trim());

  const provinceQuery = useVietnamProvinceSearchQuery(deferredProvinceSearch, provinceListShown);
  const provincesQuery = useVietnamProvincesQuery(provinceListShown && !deferredProvinceSearch);
  const selectedProvinceQuery = useVietnamProvinceQuery(selectedProvince?.code, !!selectedProvince);
  const wardQuery = useVietnamWardSearchQuery(deferredWardSearch, selectedProvince?.code, wardListShown);

  const provinceItems = provinceListShown
    ? deferredProvinceSearch
      ? provinceQuery.data ?? []
      : provincesQuery.data ?? []
    : [];

  const provinceWards = selectedProvinceQuery.data?.wards ?? selectedProvince?.wards ?? [];

  const wardItems = wardListShown
    ? deferredWardSearch
      ? wardQuery.data ?? []
      : provinceWards
    : [];

  const displayAddress = useMemo(
    () =>
      buildVietnamAdministrativeDisplay({
        province: selectedProvince,
        ward: selectedWard,
        detail,
      }),
    [detail, selectedProvince, selectedWard],
  );

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (
      !displayAddress &&
      !detail.trim() &&
      !selectedProvince &&
      !selectedWard &&
      lastEmittedAddressRef.current === null
    ) {
      return;
    }

    if (lastEmittedAddressRef.current === displayAddress) {
      return;
    }

    lastEmittedAddressRef.current = displayAddress;
    onChangeRef.current({
      province: selectedProvince,
      district: null,
      ward: selectedWard,
      detail,
      displayAddress,
    });
  }, [detail, displayAddress, selectedProvince, selectedWard]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (provinceWrapRef.current && !provinceWrapRef.current.contains(target)) {
        setProvinceListShown(false);
      }

      if (wardWrapRef.current && !wardWrapRef.current.contains(target)) {
        setWardListShown(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const selectProvince = (province: VietnamProvince) => {
    setProvinceListShown(false);
    setSelectedProvince(province);
    setProvinceSearch(province.name);
    setSelectedWard(null);
    setWardSearch('');
  };

  const selectWard = (ward: VietnamWard) => {
    setWardListShown(false);
    setSelectedWard(ward);
    setWardSearch(ward.name);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-[#27272a]">
        <MapPin className="h-4 w-4 text-primary" />
        <span>{label}</span>
      </div>

      {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div ref={provinceWrapRef} className="relative">
          <Input
            value={provinceSearch}
            onChange={(event) => setProvinceSearch(event.target.value)}
            onFocus={() => setProvinceListShown(true)}
            placeholder="Tỉnh / thành phố"
            disabled={disabled}
            className="pr-9"
          />
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          {provinceListShown ? (
            <div className="absolute left-0 top-full z-20 mt-2 w-full rounded-md border bg-white shadow-lg">
              <div className="max-h-56 overflow-auto py-1">
                {provinceQuery.isFetching || provincesQuery.isFetching ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">Đang tải danh sách tỉnh...</div>
                ) : provinceItems.length ? (
                  <ul>
                    {provinceItems.map((item) => (
                      <SearchOption key={item.code} item={item} onSelect={(province) => selectProvince(province as VietnamProvince)} />
                    ))}
                  </ul>
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">Không có tỉnh phù hợp.</div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        <div ref={wardWrapRef} className="relative">
          <Input
            value={wardSearch}
            onChange={(event) => setWardSearch(event.target.value)}
            onFocus={() => setWardListShown(true)}
            placeholder="Xã"
            disabled={disabled || !selectedProvince}
            className="pr-9"
          />
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          {wardListShown ? (
            <div className="absolute left-0 top-full z-20 mt-2 w-full rounded-md border bg-white shadow-lg">
              <div className="max-h-56 overflow-auto py-1">
                {!selectedProvince ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">Chọn tỉnh trước.</div>
                ) : wardQuery.isFetching || selectedProvinceQuery.isFetching ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">Đang tải danh sách xã...</div>
                ) : wardItems.length ? (
                  <ul>
                    {wardItems.map((item) => (
                      <SearchOption key={item.code} item={item} onSelect={(ward) => selectWard(ward as VietnamWard)} />
                    ))}
                  </ul>
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">Không có xã phù hợp.</div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-dashed bg-slate-50/80 p-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#27272a]">Địa chỉ chi tiết</label>
          <Input
            value={detail}
            onChange={(event) => setDetail(event.target.value)}
            placeholder="Số nhà, tên đường, ấp/xóm..."
            disabled={disabled}
          />
        </div>

        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Xem trước</p>
          <div className={cn('rounded-md border bg-white px-3 py-2 text-sm', error ? 'border-red-300' : 'border-slate-200')}>
            {displayAddress ? displayAddress : <span className="text-muted-foreground">Chưa chọn địa chỉ</span>}
          </div>
        </div>

        {error ? (
          <div className="flex items-start gap-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
            <X className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};