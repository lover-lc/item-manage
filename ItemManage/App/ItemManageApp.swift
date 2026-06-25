import SwiftUI
import SwiftData

@main
struct ItemManageApp: App {
    var body: some Scene {
        WindowGroup {
            RootView()
        }
        .modelContainer(ModelContainerFactory.create())
    }
}

struct RootView: View {
    @AppStorage("hasCompletedOnboarding") private var hasCompletedOnboarding = false

    var body: some View {
        if hasCompletedOnboarding {
            ContentView()
        } else {
            // Temporary placeholder until Task 11 — use simple Text onboarding placeholder
            VStack {
                Text("欢迎使用物品整理")
                Button("开始使用") { hasCompletedOnboarding = true }
            }
        }
    }
}
