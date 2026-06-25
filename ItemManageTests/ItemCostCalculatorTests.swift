import XCTest
@testable import ItemManage

final class ItemCostCalculatorTests: XCTestCase {
    let calendar = Calendar.current

    func testUsedDaysSameDayReturnsOne() {
        let date = Date()
        XCTAssertEqual(ItemCostCalculator.usedDays(from: date, to: date, calendar: calendar), 1)
    }

    func testUsedDaysAcrossDays() {
        var comps = DateComponents()
        comps.year = 2026; comps.month = 6; comps.day = 1
        let start = calendar.date(from: comps)!
        comps.day = 10
        let end = calendar.date(from: comps)!
        XCTAssertEqual(ItemCostCalculator.usedDays(from: start, to: end, calendar: calendar), 9)
    }

    func testDailyCostZeroPrice() {
        let cost = ItemCostCalculator.dailyCost(price: 0, usedDays: 5)
        XCTAssertEqual(cost, 0)
    }

    func testDailyCostNormal() {
        let cost = ItemCostCalculator.dailyCost(price: 100, usedDays: 4)
        XCTAssertEqual(cost, Decimal(string: "25")!)
    }

    func testDailyCostSameDayPurchase() {
        let cost = ItemCostCalculator.dailyCost(price: 50, usedDays: 1)
        XCTAssertEqual(cost, Decimal(string: "50")!)
    }
}
