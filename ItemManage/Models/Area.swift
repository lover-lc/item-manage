import Foundation
import SwiftData

@Model
final class Area {
    @Attribute(.unique) var id: UUID
    var name: String
    var createdAt: Date
    var isSystemReserved: Bool
    @Relationship(deleteRule: .nullify, inverse: \Item.area)
    var items: [Item] = []

    init(name: String, isSystemReserved: Bool = false) {
        self.id = UUID()
        self.name = name
        self.createdAt = Date()
        self.isSystemReserved = isSystemReserved
    }

    static let uncategorizedName = "未分类"
}
