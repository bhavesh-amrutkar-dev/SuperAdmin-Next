"use client";

import { useEffect, useState, useCallback, useMemo, memo } from "react";
import { getCookie, setCookie } from "cookies-next";
import { useTranslations } from "next-intl";
import { useCountry } from "@/src/context/countryContext";

import {
  COUNTRY,
  COUNTRY_CODE,
  DEFAULT_COUNTRY,
  DEFAULT_COUNTRY_CODE,
} from "@/src/lib/config";
import { CountryService, CountryApiItem } from "@/src/lib/services/country";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import Loader from "../loader";
import ReactCountryFlag from "react-country-flag";

type CountryOption = { id: string; code: string; name: string };

type Props = { open: boolean; onClose: () => void; onCountryChange?: (country: CountryOption) => void };

/* ---------------- Cache ---------------- */
let countriesCache: CountryOption[] | null = null;
let countriesPromise: Promise<CountryOption[]> | null = null;

/* ---------------- Memoized Country Card ---------------- */
const CountryCard = memo(function CountryCard({
  country,
  selectedCode,
  onSelect,
}: {
  country: CountryOption;
  selectedCode: string | null;
  onSelect: (code: string) => void;
}) {
  const isSelected = selectedCode === country.code;
  // const [showFlag, setShowFlag] = useState(false);

  // useEffect(() => {
  //   const id = requestAnimationFrame(() => setShowFlag(true));
  //   return () => cancelAnimationFrame(id);
  // }, []);

  return (
    <button
      type="button"
      onClick={() => onSelect(country.code)}
      className={`group flex flex-col items-center rounded-xl border px-4 py-4 transition-all duration-150 w-[47%] sm:w-full ${isSelected
          ? "border-[#FECB02] ring-2 ring-[#FECB02]/40 shadow-sm"
          : "border-gray-200 hover:border-[#FECB02]/60 hover:shadow-sm hover:cursor-pointer"
        }`}
    >
      <div
        className={`mb-3 flex h-14 w-14 items-center justify-center rounded-full transition ${isSelected ? "bg-[#FECB02]/20" : "bg-gray-100 group-hover:bg-[#FECB02]/10"
          }`}
      >
        {/* {showFlag ? <ReactCountryFlag countryCode={country.code} svg style={{ width: "2.2em", height: "2.2em" }} /> : <div style={{ width: "2.2em", height: "2.2em" }} />} */}
        <ReactCountryFlag countryCode={country.code} svg style={{ width: "2.2em", height: "2.2em" }} />
      </div>
      <span className="text-center text-sm font-medium text-gray-800">{country.name}</span>
    </button>
  );
});

/* ---------------- Modal Component ---------------- */
export default function CountrySelectorModal({ open, onClose, onCountryChange }: Props) {
  const t = useTranslations();

  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [renderList, setRenderList] = useState(false);
  const [error, setError] = useState(false); // <-- new

  const { countries: contextCountries } = useCountry();

  /* ---------------- Render List Animation ---------------- */
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => setRenderList(true));
    return () => cancelAnimationFrame(id);
  }, [open]);

  /* ---------------- Fetch Countries ---------------- */
  const fetchCountries = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      if (contextCountries?.length) {
        setCountries(contextCountries.map((c) => ({ id: c._id, code: c.countryCode, name: c.countryName })));
        return;
      }

      if (countriesCache) {
        setCountries(countriesCache);
        return;
      }

      if (!countriesPromise) {
        countriesPromise = CountryService.getCountries()
          .then((payload) => {
            const apiCountries = (payload as any)?.data ?? [];
            const mapped: CountryOption[] = (apiCountries as CountryApiItem[]).map((c) => ({
              id: c._id,
              code: c.countryCode,
              name: c.countryName,
            }));
            countriesCache = mapped;
            return mapped;
          })
          .catch(() => {
            setError(true);
            return [];
          })
          .finally(() => setLoading(false));
      }

      const data = await countriesPromise;
      setCountries(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [contextCountries]);

  useEffect(() => {
    if (!open) return;

    const existingCode = (getCookie(COUNTRY_CODE) as string | undefined) || DEFAULT_COUNTRY_CODE;
    setSelectedCode(existingCode);

    fetchCountries();
  }, [open, fetchCountries]);

  /* ---------------- Handlers ---------------- */
  const handleSelect = (code: string) => setSelectedCode(code);

  const handleContinue = () => {
    if (error) return; // cannot continue if error

    const selected = countries.find((c) => c.code === selectedCode) ?? countries[0];
    if (!selected) return;

    const cookieOptions = { maxAge: 60 * 60 * 24 * 365 };
    setCookie(COUNTRY_CODE, selected.code, cookieOptions);
    setCookie(COUNTRY, selected.name || DEFAULT_COUNTRY, cookieOptions);
    setCookie("C_id", selected.id, cookieOptions);

    window.dispatchEvent(new CustomEvent("countryChanged", { detail: { id: selected.id } }));
    onCountryChange?.(selected);
    onClose();
  };

  const handleRetry = () => fetchCountries();

  const countryList = useMemo(() => countries.map((country) => (
    <CountryCard key={country.id} country={country} selectedCode={selectedCode} onSelect={handleSelect} />
  )), [countries, selectedCode]);

  if (!open) return null;

  return (
    <Dialog open>
      <DialogContent showCloseButton={false} disableOutsideClose disableEscapeClose className="p-5 sm:max-w-2xl sm:p-6">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-gray-300 sm:hidden" />

        <DialogHeader className="pt-2 text-center sm:text-left">
          <DialogTitle>{t("countryModalTitle")}</DialogTitle>
          <DialogDescription>{t("contrySelectorDesc")}</DialogDescription>
        </DialogHeader>

        <div className="mt-6 max-h-[55vh] overflow-y-auto pr-1 text-center">
          {loading ? (
            <Loader />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10 gap-4 text-gray-500">
              {/* Modern SVG */}
              <svg className="w-24 h-24 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">{t("serviceDownMessage")}</p>
              <Button onClick={handleRetry} className="mt-3">{t("retry")}</Button>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center sm:grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 py-1">
              {countryList}
            </div>
          )}
        </div>

        <DialogFooter className="mt-6 gap-3 sm:mt-8">
          <Button variant="primary" disabled={!selectedCode || error} onClick={handleContinue} className="w-full sm:w-auto btn-primary">
            {t("countryModalContinue")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}