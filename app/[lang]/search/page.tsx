import { CountrySearch } from "@/components/country-search"

export default function SearchPage() {
    return (
        <div className="container py-20 flex flex-col items-center">
            <div className="text-center space-y-4 mb-10">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                    Where are you driving next?
                </h1>
                <p className="text-xl text-muted-foreground max-w-[600px] mx-auto">
                    Search for your destination to discover essential traffic rules and driving etiquette.
                </p>
            </div>

            <CountrySearch />
        </div>
    )
}
