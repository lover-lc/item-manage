import SwiftData

enum ModelContainerFactory {
    static let presetAreaNames = ["客厅", "卧室", "厨房", "卫生间", "储藏室"]

    @MainActor
    static func create(isStoredInMemoryOnly: Bool = false) -> ModelContainer {
        let schema = Schema([Area.self, Item.self])
        let config = ModelConfiguration(isStoredInMemoryOnly: isStoredInMemoryOnly)
        let container = try! ModelContainer(for: schema, configurations: config)
        seedIfNeeded(container: container)
        return container
    }

    @MainActor
    static func seedIfNeeded(container: ModelContainer) {
        let context = container.mainContext
        let descriptor = FetchDescriptor<Area>()
        guard (try? context.fetchCount(descriptor)) == 0 else { return }

        for name in presetAreaNames {
            context.insert(Area(name: name))
        }
        context.insert(Area(name: Area.uncategorizedName, isSystemReserved: true))
        try? context.save()
    }
}
