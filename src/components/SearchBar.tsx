import { FormEvent } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search } from "lucide-react";

interface SearchBarProps {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = "Search..." }: SearchBarProps) {
    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        onChange(value.trim());
    }

    return (
        <div className="w-full h-16 bg-white border-1 border-gray-300 px-3 rounded-full shadow-lg focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] transition-[color,box-shadow]">
            <div className="flex size-full items-center gap-3">
                <Input
                    type="text"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="border-none shadow-none focus-visible:border-none focus-visible:ring-0"
                />
                <Button
                    type="submit"
                    variant="ghost"
                    className="rounded-full text-white bg-red-400 size-12 aspect-square"
                    aria-label="Search"
                    onClick={handleSubmit}
                >
                    <Search className="size-6" />
                </Button>
            </div>
        </div>
    );
}
