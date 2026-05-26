import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CountryInlineEditContext, TrafficRules } from "@/types/country"
import { InlineEdit } from "@/components/inline-edit"

interface DetailedRulesAccordionProps {
    rules: TrafficRules
    dict: any
    inlineEdit?: CountryInlineEditContext
}

export default function DetailedRulesAccordion({ rules, dict, inlineEdit }: DetailedRulesAccordionProps) {
    const editable = inlineEdit?.enabled ? inlineEdit : null

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">{dict.rules.detailed_rules}</h3>
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="phone" className="border-slate-800">
                    <AccordionTrigger className="text-slate-200 hover:text-white">{dict.rules.phone_distractions}</AccordionTrigger>
                    <AccordionContent className="text-slate-400">
                        {editable ? (
                            <InlineEdit
                                countryCode={editable.countryCode}
                                field="phone_usage_rules"
                                value={rules.phone_usage_rules}
                                renderValue={(value) => String(value)}
                            />
                        ) : rules.phone_usage_rules}
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="lights" className="border-slate-800">
                    <AccordionTrigger className="text-slate-200 hover:text-white">{dict.rules.lights_parking}</AccordionTrigger>
                    <AccordionContent className="text-slate-400 space-y-2">
                        <div>
                            <strong className="text-slate-300">{dict.props.headlights}:</strong>{" "}
                            {editable ? (
                                <InlineEdit
                                    countryCode={editable.countryCode}
                                    field="headlights_rules"
                                    value={rules.headlights_rules}
                                    renderValue={(value) => <span>{String(value)}</span>}
                                />
                            ) : (
                                <span>{rules.headlights_rules}</span>
                            )}
                        </div>
                        <div>
                            <strong className="text-slate-300">{dict.props.parking}:</strong>{" "}
                            {editable ? (
                                <InlineEdit
                                    countryCode={editable.countryCode}
                                    field="parking_rules"
                                    value={rules.parking_rules}
                                    renderValue={(value) => <span>{String(value)}</span>}
                                />
                            ) : (
                                <span>{rules.parking_rules}</span>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}
