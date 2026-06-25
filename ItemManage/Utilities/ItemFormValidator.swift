import Foundation

enum ItemFormValidator {
    struct Input {
        var name: String
        var priceText: String
        var area: Area?
        var startDate: Date
        var endDate: Date?
    }

    enum ValidationError: Equatable {
        case emptyName
        case invalidPrice
        case missingArea
        case startAfterEnd
    }

    static func validate(_ input: Input) -> ValidationError? {
        if input.name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            return .emptyName
        }

        guard let price = parsePrice(input.priceText), price >= 0 else {
            return .invalidPrice
        }

        guard input.area != nil else {
            return .missingArea
        }

        if let endDate = input.endDate {
            let calendar = Calendar.current
            let startDay = calendar.startOfDay(for: input.startDate)
            let endDay = calendar.startOfDay(for: endDate)
            if startDay > endDay {
                return .startAfterEnd
            }
        }

        return nil
    }

    static func parsePrice(_ text: String) -> Decimal? {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return nil }
        return Decimal(string: trimmed)
    }
}
