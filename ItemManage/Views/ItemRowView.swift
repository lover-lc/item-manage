import SwiftUI

struct ItemRowView: View {
    let item: Item

    var body: some View {
        HStack(alignment: .center, spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text(item.name)
                    .font(.headline)
                Text(locationText)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer(minLength: 8)

            HStack(spacing: 6) {
                Text(ItemCostCalculator.formatDailyCost(item.dailyCost))
                    .font(.body.weight(.bold))
                    .foregroundStyle(.orange)

                Image(systemName: item.displayStatus.iconName)
                    .foregroundStyle(item.displayStatus.color)
            }
        }
        .padding(.vertical, 4)
    }

    private var locationText: String {
        let areaName = item.area?.name ?? "—"
        let location = item.specificLocation.isEmpty ? "—" : item.specificLocation
        return "\(areaName) > \(location)"
    }
}
