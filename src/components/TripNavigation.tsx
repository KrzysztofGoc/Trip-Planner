import { ChevronLeft, Ellipsis, SquareArrowOutUpRight } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

export default function TripNavigation() {
    return (
        <div className="fixed z-999 top-4 left-0 w-full flex justify-between">
            {/* Back Button */}
            <Link to=".." className="size-12 flex justify-center items-center">
                <div className="size-10 flex justify-center items-center backdrop-blur-md rounded-full">
                    <ChevronLeft className="size-6 text-white" />
                </div>
            </Link>


            {/* Share and Menu Buttons */}
            <div className="flex gap-2 w-fit">
                <Button className="size-12 flex justify-center items-center bg-transparent shadow-none">
                    <div className="size-10 aspect-square flex justify-center items-center backdrop-blur-md rounded-full">
                        <SquareArrowOutUpRight className="size-6 text-white" />
                    </div>
                </Button>
                <Button className="size-12 flex justify-center items-center bg-transparent shadow-none">
                    <div className="size-10 aspect-square flex justify-center items-center backdrop-blur-md rounded-full">
                        <Ellipsis className="size-6 text-white" />
                    </div>
                </Button>
            </div>
        </div>
    );
}