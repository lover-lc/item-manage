import Foundation

enum ItemCostCalculator {
    static func usedDays(from start: Date, to end: Date, calendar: Calendar = .current) -> Int {
        let startDay = calendar.startOfDay(for: start)
        let endDay = calendar.startOfDay(for: end)
        let days = calendar.dateComponents([.day], from: startDay, to: endDay).day ?? 0
        return max(days, 0) + 1  // inclusive; same day = 1
    }

    static func dailyCost(price: Decimal, usedDays: Int) -> Decimal {
        guard usedDays > 0 else { return 0 }
        if price == 0 { return 0 }
        var result = price / Decimal(usedDays)
        var rounded = Decimal()
        NSDecimalRound(&rounded, &result, 2, .plain)
        return rounded
    }

    static func formatDailyCost(_ cost: Decimal) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencySymbol = "¥"
        formatter.minimumFractionDigits = 2
        formatter.maximumFractionDigits = 2
        return (formatter.string(from: cost as NSDecimalNumber) ?? "¥0.00") + "/天"
    }
}
