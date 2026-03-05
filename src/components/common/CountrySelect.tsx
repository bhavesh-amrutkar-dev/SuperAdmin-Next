"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

import { Button } from "@/src/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/src/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/src/components/ui/popover";

import { CountryCurrency } from "@/src/models/api/response/auth";

type Props = {
    countries: CountryCurrency[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
};

export default function CountrySelect({
    countries,
    value,
    onChange,
    placeholder = "Select country",
}: Props) {
    const [open, setOpen] = useState(false);

    const selected = countries.find((c) => c.countryCode === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between h-[44px] border border-gray-600 text-black hover:border-yellow-500 hover:bg-gray-100 hover:text-black"
                >
                    {selected ? (
                        <span>
                            {selected.emoji} {selected.name}
                        </span>
                    ) : (
                        placeholder
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent
                align="start"
                className="z-50 w-[var(--radix-popover-trigger-width)] p-0 bg-background border border-border rounded-md shadow-md"
            >
                <Command>
                    <CommandInput
                        placeholder="Search country..."
                        className="h-10 "
                    />

                    <CommandEmpty>No country found.</CommandEmpty>

                    <CommandGroup className="max-h-[250px] overflow-y-auto">
                        {countries.map((country) => (
                            <CommandItem
                                key={country._id}
                                value={country.name}
                                className="cursor-pointer"
                                onSelect={() => {
                                    onChange(country.countryCode);
                                    setOpen(false);
                                }}
                            >
                                <span className="flex items-center gap-2">
                                    {country.emoji}
                                    {country.name}
                                </span>

                                {value === country.countryCode && (
                                    <Check className="ml-auto h-4 w-4" />
                                )}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}