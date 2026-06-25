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
            OnboardingView()
        }
    }
}
