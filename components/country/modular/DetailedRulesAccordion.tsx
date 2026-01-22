import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { TrafficRules } from "@/types/country"

interface DetailedRulesAccordionProps {
    rules: TrafficRules
    dict: any
}

export default function DetailedRulesAccordion({ rules, dict }: DetailedRulesAccordionProps) {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">{dict.rules.detailed_rules}</h3>
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="phone" className="border-slate-800">
                    <AccordionTrigger className="text-slate-200 hover:text-white">{dict.rules.phone_distractions}</AccordionTrigger>
                    <AccordionContent className="text-slate-400">
                        {rules.phone_usage_rules}
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="lights" className="border-slate-800">
                    <AccordionTrigger className="text-slate-200 hover:text-white">{dict.rules.lights_parking}</AccordionTrigger>
                    <AccordionContent className="text-slate-400 space-y-2">
                        <p><strong className="text-slate-300">{dict.props.headlights}:</strong> {rules.headlights_rules}</p>
                        <p><strong className="text-slate-300">{dict.props.parking}:</strong> {rules.parking_rules}</p>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}
