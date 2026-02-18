"use client";

import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  memo,
} from "react";
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

type CountryOption = {
  id: string;
  code: string;
  name: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCountryChange?: (country: CountryOption) => void;
};

/* ------------------ */
/* Global Cache (Important) */
/* ------------------ */

let countriesCache: CountryOption[] | null = null;
let countriesPromise: Promise<CountryOption[]> | null = null;

/* ------------------ */
/* Memoized Country Card */
/* ------------------ */

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

  return (
    <button
      type="button"
      onClick={() => onSelect(country.code)}
      className={`
        group flex flex-col items-center rounded-xl border
        px-4 py-4 transition-all duration-150
        ${isSelected
          ? "border-[#FECB02] ring-2 ring-[#FECB02]/40 shadow-sm"
          : "border-gray-200 hover:border-[#FECB02]/60 hover:shadow-sm hover:cursor-pointer"
        }
      `}
    >
      {/* Flag Circle */}
      <div
        className={`
          mb-3 flex h-14 w-14 items-center justify-center
          rounded-full transition
          ${isSelected
            ? "bg-[#FECB02]/20"
            : "bg-gray-100 group-hover:bg-[#FECB02]/10"
          }
        `}
      >
        <ReactCountryFlag
          countryCode={country.code}
          svg
          style={{
            width: "2.2em",
            height: "2.2em",
          }}
        />
      </div>

      <span className="text-center text-sm font-medium text-gray-800">
        {country.name}
      </span>
    </button>
  );
});

/* ------------------ */
/* Component */
/* ------------------ */

export default function CountrySelectorModal({
  open,
  onClose,
  onCountryChange,
}: Props) {
  const t = useTranslations();

  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [loading, setLoading] = useState(false);

  /* ------------------ */
  /* Fetch Countries (Context) */
  /* ------------------ */

  // Use context data instead of fetching
  const { countries: contextCountries } = useCountry();

  useEffect(() => {
    if (!open) return;

    const existingCode =
      (getCookie(COUNTRY_CODE) as string | undefined) ||
      DEFAULT_COUNTRY_CODE;

    setSelectedCode(existingCode);

    // Hydrate from context immediately
    if (contextCountries && contextCountries.length > 0) {
      setCountries(contextCountries.map((c) => ({
        id: c._id,
        code: c.countryCode,
        name: c.countryName,
      })));
      return;
    }

    // Fallback to fetch if context is empty (shouldn't happen if server fetch works)
    if (countriesCache) {
      setCountries(countriesCache);
      return;
    }

    if (!countriesPromise) {
      setLoading(true);

      countriesPromise = CountryService.getCountries()
        .then((payload) => {
          const apiCountries = (payload as any)?.data ?? [];

          const mapped: CountryOption[] = (
            apiCountries as CountryApiItem[]
          ).map((c) => ({
            id: c._id,
            code: c.countryCode,
            name: c.countryName,
          }));

          countriesCache = mapped;
          return mapped;
        })
        .finally(() => setLoading(false));
    }

    countriesPromise.then((data) => {
      setCountries(data);
    });
  }, [open, contextCountries]);

  /* ------------------ */
  /* Memoized Handlers */
  /* ------------------ */

  const handleSelect = useCallback((code: string) => {
    setSelectedCode(code);
  }, []);

  const handleContinue = useCallback(() => {
    const selected =
      countries.find((c) => c.code === selectedCode) ??
      countries[0];

    if (!selected) return;

    const cookieOptions = { maxAge: 60 * 60 * 24 * 365 };

    setCookie(COUNTRY_CODE, selected.code, cookieOptions);
    setCookie(COUNTRY, selected.name || DEFAULT_COUNTRY, cookieOptions);
    setCookie("C_id", selected.id, cookieOptions);

    // try {
    //   window.localStorage.setItem("C_code", selected.code);
    //   window.dispatchEvent(
    //     new CustomEvent("countryChanged", { detail: selected })
    //   );
    // } catch { }

    onCountryChange?.(selected);
    onClose();
  }, [countries, selectedCode, onClose, onCountryChange]);

  /* ------------------ */
  /* Memoized Country List */
  /* ------------------ */

  const countryList = useMemo(
    () =>
      countries.map((country) => (
        <CountryCard
          key={country.id}
          country={country}
          selectedCode={selectedCode}
          onSelect={handleSelect}
        />
      )),
    [countries, selectedCode, handleSelect]
  );

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        disableOutsideClose
        disableEscapeClose
        className="p-5 sm:max-w-2xl sm:p-6">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-gray-300 sm:hidden" />

        <DialogHeader className="pt-2 text-center sm:text-left">
          <DialogTitle>{t("countryModalTitle")}</DialogTitle>
          <DialogDescription>
            {t("contrySelectorDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 max-h-[55vh] overflow-y-auto pr-1">
          {loading ? (
            <div className="text-center text-sm text-gray-500 py-10">
              <Loader />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {countryList}
            </div>
          )}
        </div>

        <DialogFooter className="mt-6 gap-3 sm:mt-8">
          <Button
            variant="primary"
            disabled={!selectedCode}
            onClick={handleContinue}
            className="w-full sm:w-auto"
          >
            {t("countryModalContinue")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
