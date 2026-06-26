import SwiftUI

struct YMDWheelDatePicker: View {
    @Binding var date: Date

    private let calendar = Calendar.current
    private let yearRange: ClosedRange<Int>

    @State private var year: Int
    @State private var month: Int
    @State private var day: Int

    init(date: Binding<Date>, yearRange: ClosedRange<Int> = 1970...2100) {
        _date = date
        self.yearRange = yearRange

        let components = Calendar.current.dateComponents([.year, .month, .day], from: date.wrappedValue)
        _year = State(initialValue: components.year ?? Calendar.current.component(.year, from: Date()))
        _month = State(initialValue: components.month ?? 1)
        _day = State(initialValue: components.day ?? 1)
    }

    var body: some View {
        HStack(spacing: 0) {
            Picker("年", selection: $year) {
                ForEach(Array(yearRange), id: \.self) { value in
                    Text(String(value)).tag(value)
                }
            }
            .pickerStyle(.wheel)
            .frame(maxWidth: .infinity)

            Picker("月", selection: $month) {
                ForEach(1...12, id: \.self) { value in
                    Text(String(format: "%02d", value)).tag(value)
                }
            }
            .pickerStyle(.wheel)
            .frame(maxWidth: .infinity)

            Picker("日", selection: $day) {
                ForEach(1...daysInMonth, id: \.self) { value in
                    Text(String(format: "%02d", value)).tag(value)
                }
            }
            .pickerStyle(.wheel)
            .frame(maxWidth: .infinity)
        }
        .labelsHidden()
        .onChange(of: year) { _, _ in
            clampDay()
            syncDate()
        }
        .onChange(of: month) { _, _ in
            clampDay()
            syncDate()
        }
        .onChange(of: day) { _, _ in
            syncDate()
        }
        .onChange(of: date) { _, newDate in
            applyDate(newDate)
        }
    }

    private var daysInMonth: Int {
        var components = DateComponents()
        components.year = year
        components.month = month
        guard
            let monthDate = calendar.date(from: components),
            let range = calendar.range(of: .day, in: .month, for: monthDate)
        else {
            return 31
        }
        return range.count
    }

    private func clampDay() {
        if day > daysInMonth {
            day = daysInMonth
        }
    }

    private func syncDate() {
        var components = DateComponents()
        components.year = year
        components.month = month
        components.day = min(day, daysInMonth)

        guard let newDate = calendar.date(from: components) else { return }
        let normalized = calendar.startOfDay(for: newDate)
        if normalized != date {
            date = normalized
        }
    }

    private func applyDate(_ newDate: Date) {
        let components = calendar.dateComponents([.year, .month, .day], from: newDate)
        if let value = components.year, value != year { year = value }
        if let value = components.month, value != month { month = value }
        if let value = components.day {
            clampDay()
            if value != day { day = min(value, daysInMonth) }
        }
    }
}

struct FormYMDDatePicker: View {
    let title: String
    @Binding var date: Date

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
            YMDWheelDatePicker(date: $date)
        }
    }
}
