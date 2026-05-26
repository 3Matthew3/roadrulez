import DashboardPage from "@/components/dashboard/dashboard-page"
import { getDictionary } from "@/lib/dictionaries"

export default async function MapPage({ params }: { params: { lang: string } }) {
    const dict = await getDictionary(params.lang)

    return <DashboardPage labels={{ dashboard: dict.dashboard, search: dict.search }} />
}
