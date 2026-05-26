import { CountrySearch } from "@/components/country-search"
import { getDictionary } from "@/lib/dictionaries"

export default async function SearchPage({ params }: { params: { lang: string } }) {
    const dict = await getDictionary(params.lang)

    return (
        <div className="container py-20 flex flex-col items-center">
            <div className="text-center space-y-4 mb-10">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                    {dict.search.title}
                </h1>
                <p className="text-xl text-muted-foreground max-w-[600px] mx-auto">
                    {dict.search.description}
                </p>
            </div>

            <CountrySearch labels={dict.search} />
        </div>
    )
}
