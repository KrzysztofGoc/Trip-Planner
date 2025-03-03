import { Form } from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search } from 'lucide-react';

export default function SearchBar() {
    return (
        <div className="h-auto w-auto ">
            <div
                className="w-auto h-16 bg-white border-1 border-gray-300 mx-6 mt-3 px-3 rounded-full shadow-lg focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] transition-[color,box-shadow]"
            >
                <Form>
                    <form className="flex size-full items-center gap-3">
                        <Input
                            type="text"
                            placeholder="Search..."
                            className="border-none shadow-none focus-visible:border-none focus-visible:ring-0"
                        />
                        <Button variant="ghost" className="rounded-full text-white bg-red-400 size-12 aspect-square">
                            <Search className="size-6"/>
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}