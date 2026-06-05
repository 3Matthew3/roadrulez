export type SpeedUnit = "km/h" | "mph"

export function alternateSpeedUnit(unit: SpeedUnit): SpeedUnit {
    return unit === "mph" ? "km/h" : "mph"
}

export function convertSpeedValue(value: number, from: SpeedUnit): number {
    if (from === "mph") {
        return Math.round(value * 1.60934)
    }
    return Math.round(value * 0.621371)
}

/** Primary speed in the country's posted unit; secondary shows the converted value. */
export function formatSpeedWithConversion(value: number, primaryUnit: SpeedUnit) {
    const altUnit = alternateSpeedUnit(primaryUnit)
    const altValue = convertSpeedValue(value, primaryUnit)
    return {
        primary: `${value} ${primaryUnit}`,
        secondary: `${altValue} ${altUnit}`,
    }
}
