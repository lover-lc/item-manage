import Foundation
import SwiftData

@Model
final class Item {
    @Attribute(.unique) var id: UUID
    var name: String
    var purchasePrice: Decimal
    var startDate: Date
    var endDate: Date?
    var expiryDate: Date?
    var specificLocation: String
    var createdAt: Date
    var updatedAt: Date
    var area: Area?

    init(name: String, purchasePrice: Decimal, startDate: Date, area: Area, specificLocation: String) {
        self.id = UUID()
        self.name = name
        self.purchasePrice = purchasePrice
        self.startDate = startDate
        self.area = area
        self.specificLocation = specificLocation
        self.createdAt = Date()
        self.updatedAt = Date()
    }

    var isUsedUp: Bool { endDate != nil }

    var isExpired: Bool {
        guard !isUsedUp, let expiry = expiryDate else { return false }
        return Calendar.current.startOfDay(for: expiry) < Calendar.current.startOfDay(for: Date())
    }

    var isExpiringSoon: Bool {
        guard !isUsedUp, !isExpired, let expiry = expiryDate else { return false }
        let today = Calendar.current.startOfDay(for: Date())
        guard let sevenDaysLater = Calendar.current.date(byAdding: .day, value: 7, to: today) else { return false }
        let expiryDay = Calendar.current.startOfDay(for: expiry)
        return expiryDay >= today && expiryDay <= sevenDaysLater
    }

    var usedDays: Int {
        let end = endDate ?? Date()
        return ItemCostCalculator.usedDays(from: startDate, to: end)
    }

    var dailyCost: Decimal {
        ItemCostCalculator.dailyCost(price: purchasePrice, usedDays: usedDays)
    }

    var displayStatus: ItemStatus {
        if isUsedUp { return .usedUp }
        if isExpired { return .expired }
        if isExpiringSoon { return .expiringSoon }
        return .active
    }
}
