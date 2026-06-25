import SwiftUI

enum ItemStatus {
    case active, expiringSoon, expired, usedUp

    var color: Color {
        switch self {
        case .active: .green
        case .expiringSoon: .yellow
        case .expired: .red
        case .usedUp: .gray
        }
    }

    var iconName: String {
        switch self {
        case .active: "checkmark.circle.fill"
        case .expiringSoon: "exclamationmark.triangle.fill"
        case .expired: "xmark.circle.fill"
        case .usedUp: "minus.circle.fill"
        }
    }
}
