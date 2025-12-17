/**
 * Agricultural Irrigation Project Calculation Tools
 * Calculate material needs for irrigation projects
 */

/**
 * Drip Irrigation System Calculator
 */
export interface DripIrrigationParams {
  fieldArea: number          // in square meters
  rowSpacing: number         // in meters (e.g., 1.5m for vegetables)
  dripperSpacing: number     // in cm (e.g., 30cm)
  flowRatePerDripper: number // in L/hour
  irrigationDuration: number // in hours per day
}

export interface DripIrrigationResult {
  totalRows: number
  lateralPipeLength: number      // Total lateral pipe needed (m)
  numberOfDrippers: number
  totalWaterPerDay: number       // L/day
  totalWaterPerMonth: number     // L/month
  mainPipeRequired: number       // Main pipe length estimate (m)
  filterCapacityRequired: number // m³/hour
  pumpCapacityRequired: number   // L/min
  estimatedCost: {
    lateralPipe: number
    drippers: number
    mainPipe: number
    filter: number
    pump: number
    total: number
  }
}

export function calculateDripIrrigation(params: DripIrrigationParams): DripIrrigationResult {
  const {
    fieldArea,
    rowSpacing,
    dripperSpacing,
    flowRatePerDripper,
    irrigationDuration,
  } = params

  // Calculate dimensions
  const fieldWidth = Math.sqrt(fieldArea) // Assume square field for simplicity
  const totalRows = Math.ceil(fieldWidth / rowSpacing)
  const lateralPipeLength = totalRows * fieldWidth

  // Calculate drippers
  const drippersPerRow = Math.ceil((fieldWidth * 100) / dripperSpacing)
  const numberOfDrippers = drippersPerRow * totalRows

  // Water consumption
  const totalFlowRate = numberOfDrippers * flowRatePerDripper
  const totalWaterPerDay = totalFlowRate * irrigationDuration
  const totalWaterPerMonth = totalWaterPerDay * 30

  // Main pipe (assume 20% of lateral length for main distribution)
  const mainPipeRequired = lateralPipeLength * 0.2

  // Filter capacity (total flow rate in m³/hour)
  const filterCapacityRequired = totalFlowRate / 1000

  // Pump capacity (L/min with 20% safety margin)
  const pumpCapacityRequired = (totalFlowRate / 60) * 1.2

  // Cost estimation (simplified pricing)
  const estimatedCost = {
    lateralPipe: lateralPipeLength * 1.25,        // 1.25 TL/m for 16mm drip tape
    drippers: numberOfDrippers * 2.5,             // 2.5 TL per dripper
    mainPipe: mainPipeRequired * 30,              // 30 TL/m for main pipe
    filter: 2000,                                  // Base filter cost
    pump: pumpCapacityRequired * 400,             // 400 TL per L/min capacity
    total: 0,
  }
  estimatedCost.total = Object.values(estimatedCost).reduce((a, b) => a + b, 0) - estimatedCost.total

  return {
    totalRows,
    lateralPipeLength,
    numberOfDrippers,
    totalWaterPerDay,
    totalWaterPerMonth,
    mainPipeRequired,
    filterCapacityRequired,
    pumpCapacityRequired,
    estimatedCost,
  }
}

/**
 * Sprinkler Irrigation System Calculator
 */
export interface SprinklerIrrigationParams {
  fieldArea: number           // in square meters
  sprinklerRadius: number     // coverage radius in meters
  flowRatePerSprinkler: number // L/min
  irrigationDuration: number  // hours per day
  applicationRate: number     // mm/hour (typically 10-15 mm/hour)
}

export interface SprinklerIrrigationResult {
  numberOfSprinklers: number
  totalCoverage: number          // square meters
  totalWaterPerDay: number       // L/day
  pipeLength: number             // Total pipe needed (m)
  pumpCapacityRequired: number   // L/min
  estimatedCost: {
    sprinklers: number
    pipes: number
    pump: number
    total: number
  }
}

export function calculateSprinklerIrrigation(params: SprinklerIrrigationParams): SprinklerIrrigationResult {
  const {
    fieldArea,
    sprinklerRadius,
    flowRatePerSprinkler,
    irrigationDuration,
  } = params

  // Sprinkler coverage area (circular)
  const sprinklerCoverage = Math.PI * sprinklerRadius * sprinklerRadius

  // Number of sprinklers needed (with 10% overlap)
  const numberOfSprinklers = Math.ceil((fieldArea / sprinklerCoverage) * 1.1)

  // Total coverage
  const totalCoverage = numberOfSprinklers * sprinklerCoverage

  // Water consumption
  const totalFlowRate = numberOfSprinklers * flowRatePerSprinkler
  const totalWaterPerDay = totalFlowRate * irrigationDuration * 60

  // Pipe length estimate (grid layout)
  const gridSpacing = sprinklerRadius * 2
  const rows = Math.ceil(Math.sqrt(fieldArea) / gridSpacing)
  const pipeLength = rows * Math.sqrt(fieldArea) * 1.5 // 1.5x for connections

  // Pump capacity
  const pumpCapacityRequired = totalFlowRate * 1.2 // 20% safety margin

  // Cost estimation
  const estimatedCost = {
    sprinklers: numberOfSprinklers * 85,      // 85 TL per sprinkler
    pipes: pipeLength * 35,                    // 35 TL/m for 32mm pipe
    pump: pumpCapacityRequired * 500,         // 500 TL per L/min
    total: 0,
  }
  estimatedCost.total = Object.values(estimatedCost).reduce((a, b) => a + b, 0) - estimatedCost.total

  return {
    numberOfSprinklers,
    totalCoverage,
    totalWaterPerDay,
    pipeLength,
    pumpCapacityRequired,
    estimatedCost,
  }
}

/**
 * Water Requirement Calculator
 * Calculate daily water needs based on crop type and climate
 */
export interface WaterRequirementParams {
  cropType: "vegetables" | "fruits" | "cereals" | "greenhouse" | "landscape"
  fieldArea: number        // square meters
  climate: "hot-dry" | "moderate" | "humid"
  season: "spring" | "summer" | "fall" | "winter"
}

export interface WaterRequirementResult {
  dailyWaterNeed: number      // L/day
  monthlyWaterNeed: number    // L/month
  evapotranspirationRate: number // mm/day
  irrigationFrequency: string
  recommendedSystem: "drip" | "sprinkler" | "surface"
}

export function calculateWaterRequirement(params: WaterRequirementParams): WaterRequirementResult {
  const { cropType, fieldArea, climate, season } = params

  // ET0 rates (evapotranspiration) in mm/day
  const ET0_BASE_RATES = {
    "hot-dry": { spring: 5, summer: 8, fall: 4, winter: 2 },
    "moderate": { spring: 4, summer: 6, fall: 3, winter: 1.5 },
    "humid": { spring: 3, summer: 5, fall: 2.5, winter: 1 },
  }

  // Crop coefficients
  const CROP_COEFFICIENTS = {
    vegetables: 0.8,
    fruits: 0.7,
    cereals: 0.6,
    greenhouse: 0.9,
    landscape: 0.7,
  }

  // Calculate ET
  const et0 = ET0_BASE_RATES[climate][season]
  const cropCoefficient = CROP_COEFFICIENTS[cropType]
  const evapotranspirationRate = et0 * cropCoefficient

  // Water need in liters
  const dailyWaterNeed = (evapotranspirationRate * fieldArea) // mm * m² = liters
  const monthlyWaterNeed = dailyWaterNeed * 30

  // Irrigation frequency recommendation
  let irrigationFrequency = ""
  if (evapotranspirationRate > 6) irrigationFrequency = "Daily"
  else if (evapotranspirationRate > 4) irrigationFrequency = "Every 2 days"
  else if (evapotranspirationRate > 2) irrigationFrequency = "Every 3 days"
  else irrigationFrequency = "Weekly"

  // System recommendation
  let recommendedSystem: "drip" | "sprinkler" | "surface" = "drip"
  if (cropType === "landscape" || cropType === "cereals") recommendedSystem = "sprinkler"
  if (fieldArea > 100000) recommendedSystem = "surface" // Large fields

  return {
    dailyWaterNeed,
    monthlyWaterNeed,
    evapotranspirationRate,
    irrigationFrequency,
    recommendedSystem,
  }
}

/**
 * Pipe Sizing Calculator
 * Calculate required pipe diameter based on flow rate and length
 */
export interface PipeSizingParams {
  flowRate: number      // L/min
  pipeLength: number    // meters
  maxPressureLoss: number // bar (typically 0.2-0.5 bar per 100m)
}

export interface PipeSizingResult {
  recommendedDiameter: number  // mm
  velocity: number             // m/s
  pressureLoss: number         // bar
  frictionLoss: number         // bar per 100m
}

export function calculatePipeSizing(params: PipeSizingParams): PipeSizingResult {
  const { flowRate, pipeLength, maxPressureLoss } = params

  // Convert flow rate to m³/s
  const flowM3s = (flowRate / 1000) / 60

  // Standard pipe diameters in mm
  const standardDiameters = [16, 20, 25, 32, 40, 50, 63, 75, 90, 110]

  // Find appropriate diameter
  let recommendedDiameter = 16
  let velocity = 0
  let pressureLoss = 0

  for (const diameter of standardDiameters) {
    const area = Math.PI * Math.pow(diameter / 2000, 2) // m²
    velocity = flowM3s / area // m/s

    // Hazen-Williams formula for pressure loss (simplified)
    // Using C = 140 for plastic pipes
    const frictionFactor = 0.0826 * Math.pow(flowM3s, 1.85) / Math.pow(diameter / 1000, 4.87)
    pressureLoss = frictionFactor * (pipeLength / 100)

    // Check if velocity is in acceptable range (0.5 - 2.5 m/s)
    if (velocity >= 0.5 && velocity <= 2.5 && pressureLoss <= maxPressureLoss) {
      recommendedDiameter = diameter
      break
    }
  }

  const frictionLoss = pressureLoss / (pipeLength / 100)

  return {
    recommendedDiameter,
    velocity,
    pressureLoss,
    frictionLoss,
  }
}

/**
 * Format area in different units
 */
export function formatArea(squareMeters: number): {
  m2: string
  dekar: string
  hectare: string
} {
  const dekar = squareMeters / 1000 // 1 dekar = 1000 m²
  const hectare = squareMeters / 10000 // 1 hectare = 10000 m²

  return {
    m2: `${squareMeters.toLocaleString("tr-TR")} m²`,
    dekar: `${dekar.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} dekar`,
    hectare: `${hectare.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} hektar`,
  }
}
