import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getThirdPartyApiClient } from '@/core/api/thirdPartyApiClient';
import { queryKeys } from '@/constants/queryKeys';

export type VietnamSearchMatches = Record<string, [number, number]>;

export type VietnamAdministrativeBase = {
  code: number;
  name: string;
  codename?: string;
  division_type?: string;
  matches?: VietnamSearchMatches;
};

export type VietnamWard = VietnamAdministrativeBase;

export type VietnamDistrict = never;

export type VietnamProvince = VietnamAdministrativeBase & {
  wards?: VietnamWard[];
};

export type VietnamAdministrativeSelection = {
  province: VietnamProvince | null;
  district: null;
  ward: VietnamWard | null;
  detail: string;
  displayAddress: string;
};

const DEFAULT_STALE_TIME = 24 * 60 * 60 * 1000;
const SEARCH_STALE_TIME = 5 * 60 * 1000;
const provincesApiClient = getThirdPartyApiClient('provincesOpenApi');

const normalizeTerm = (term: string) => term.trim();

const getData = async <T>(path: string, params?: Record<string, string | number>) => {
  const { data } = await provincesApiClient.get<T>(path, { params });
  return data;
};

export const buildVietnamAdministrativeDisplay = (selection: {
  province?: Pick<VietnamAdministrativeBase, 'name'> | null;
  ward?: Pick<VietnamAdministrativeBase, 'name'> | null;
  detail?: string;
}) => {
  const detail = selection.detail?.trim();
  const parts = [detail, selection.ward?.name, selection.province?.name].filter(
    (part): part is string => Boolean(part?.trim()),
  );

  return parts.join(', ');
};

export const fetchVietnamProvinces = () => getData<VietnamProvince[]>('/p/');

export const fetchVietnamProvince = async (provinceCode: number) => {
  return getData<VietnamProvince>(`/p/${provinceCode}`, { depth: 2 });
};

export const searchVietnamProvinces = async (term: string) => {
  const normalized = normalizeTerm(term).toLowerCase();
  if (!normalized) {
    return [];
  }

  const provinces = await fetchVietnamProvinces();
  return provinces.filter((item) => item.name.toLowerCase().includes(normalized));
};

export const searchVietnamWards = async (term: string, provinceCode: number) => {
  const normalized = normalizeTerm(term).toLowerCase();
  if (!normalized) {
    return [];
  }

  const province = await fetchVietnamProvince(provinceCode);
  const wards = province.wards ?? [];
  return wards.filter((item) => item.name.toLowerCase().includes(normalized));
};

export const useVietnamProvincesQuery = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.vietnamProvinceApi.provinces,
    queryFn: fetchVietnamProvinces,
    enabled,
    staleTime: DEFAULT_STALE_TIME,
  });

export const useVietnamProvinceQuery = (provinceCode: number | null | undefined, enabled = true) =>
  useQuery({
    queryKey: queryKeys.vietnamProvinceApi.province(provinceCode ?? 0),
    queryFn: () => fetchVietnamProvince(provinceCode ?? 0),
    enabled: enabled && typeof provinceCode === 'number',
    staleTime: DEFAULT_STALE_TIME,
  });

export const useVietnamProvinceSearchQuery = (term: string, enabled = true) => {
  const normalizedTerm = normalizeTerm(term);

  return useQuery({
    queryKey: queryKeys.vietnamProvinceApi.provinceSearch(normalizedTerm),
    queryFn: () => searchVietnamProvinces(normalizedTerm),
    enabled: enabled && normalizedTerm.length > 0,
    staleTime: SEARCH_STALE_TIME,
    placeholderData: keepPreviousData,
  });
};

export const useVietnamWardSearchQuery = (term: string, districtCode: number | null | undefined, enabled = true) => {
  const normalizedTerm = normalizeTerm(term);

  return useQuery({
    queryKey: queryKeys.vietnamProvinceApi.wardSearch(districtCode ?? 0, normalizedTerm),
    queryFn: () => searchVietnamWards(normalizedTerm, districtCode ?? 0),
    enabled: enabled && normalizedTerm.length > 0 && typeof districtCode === 'number',
    staleTime: SEARCH_STALE_TIME,
    placeholderData: keepPreviousData,
  });
};