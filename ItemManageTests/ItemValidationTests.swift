import XCTest
@testable import ItemManage

final class ItemValidationTests: XCTestCase {
    private let calendar = Calendar.current

    private func makeArea() -> Area {
        Area(name: "厨房")
    }

    private func validInput(
        name: String = "毛巾",
        priceText: String = "29.9",
        area: Area? = nil,
        startDate: Date = Date(),
        endDate: Date? = nil
    ) -> ItemFormValidator.Input {
        ItemFormValidator.Input(
            name: name,
            priceText: priceText,
            area: area ?? makeArea(),
            startDate: startDate,
            endDate: endDate
        )
    }

    func testEmptyNameFails() {
        let input = validInput(name: "   ")
        XCTAssertEqual(ItemFormValidator.validate(input), .emptyName)
    }

    func testNegativePriceFails() {
        let input = validInput(priceText: "-1")
        XCTAssertEqual(ItemFormValidator.validate(input), .invalidPrice)
    }

    func testMissingAreaFails() {
        let input = validInput(area: nil)
        XCTAssertEqual(ItemFormValidator.validate(input), .missingArea)
    }

    func testStartDateAfterEndDateFails() {
        var startComponents = DateComponents()
        startComponents.year = 2026
        startComponents.month = 6
        startComponents.day = 10
        let startDate = calendar.date(from: startComponents)!

        var endComponents = DateComponents()
        endComponents.year = 2026
        endComponents.month = 6
        endComponents.day = 5
        let endDate = calendar.date(from: endComponents)!

        let input = validInput(startDate: startDate, endDate: endDate)
        XCTAssertEqual(ItemFormValidator.validate(input), .startAfterEnd)
    }

    func testValidInputPasses() {
        let input = validInput()
        XCTAssertNil(ItemFormValidator.validate(input))
    }

    func testExpiryDateNotValidated() {
        // Validator does not inspect expiryDate; only core fields matter.
        var startComponents = DateComponents()
        startComponents.year = 2026
        startComponents.month = 1
        startComponents.day = 1
        let startDate = calendar.date(from: startComponents)!

        var endComponents = DateComponents()
        endComponents.year = 2025
        endComponents.month = 12
        endComponents.day = 31
        let endDate = calendar.date(from: endComponents)!

        // endDate before startDate would fail, but nil endDate with any start passes
        // regardless of what expiryDate the form might hold elsewhere.
        let input = ItemFormValidator.Input(
            name: "物品",
            priceText: "0",
            area: makeArea(),
            startDate: startDate,
            endDate: nil
        )
        XCTAssertNil(ItemFormValidator.validate(input))
    }
}
