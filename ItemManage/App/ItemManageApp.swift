import SwiftUI
import SwiftData

@main
struct ItemManageApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(for: [Area.self, Item.self])
    }
}
