import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            ItemListView()
                .tabItem { Label("物品", systemImage: "house") }
            SearchView()
                .tabItem { Label("搜索", systemImage: "magnifyingglass") }
            AreaManageView()
                .tabItem { Label("区域", systemImage: "folder") }
        }
    }
}
