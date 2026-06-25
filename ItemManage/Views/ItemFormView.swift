import SwiftUI
import SwiftData

struct ItemFormView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    @Query(filter: #Predicate<Area> { !$0.isSystemReserved }, sort: \Area.name)
    private var areas: [Area]

    private let item: Item?

    @State private var name: String
    @State private var purchasePriceText: String
    @State private var selectedArea: Area?
    @State private var specificLocation: String
    @State private var startDate: Date
    @State private var hasEndDate: Bool
    @State private var endDate: Date
    @State private var hasExpiryDate: Bool
    @State private var expiryDate: Date

    @State private var showingNewAreaAlert = false
    @State private var newAreaName = ""
    @State private var showingValidationAlert = false
    @State private var validationMessage = ""

    init(item: Item?) {
        self.item = item
        _name = State(initialValue: item?.name ?? "")
        _purchasePriceText = State(initialValue: item.map { NSDecimalNumber(decimal: $0.purchasePrice).stringValue } ?? "")
        _selectedArea = State(initialValue: item?.area)
        _specificLocation = State(initialValue: item?.specificLocation ?? "")
        _startDate = State(initialValue: item?.startDate ?? Date())
        _hasEndDate = State(initialValue: item?.endDate != nil)
        _endDate = State(initialValue: item?.endDate ?? Date())
        _hasExpiryDate = State(initialValue: item?.expiryDate != nil)
        _expiryDate = State(initialValue: item?.expiryDate ?? Date())
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("基本信息") {
                    TextField("物品名称", text: $name)
                    TextField("买入价格", text: $purchasePriceText)
                        .keyboardType(.decimalPad)
                }

                Section("位置信息") {
                    Picker("区域", selection: $selectedArea) {
                        Text("请选择").tag(Optional<Area>.none)
                        ForEach(areas) { area in
                            Text(area.name).tag(Optional(area))
                        }
                    }

                    TextField("具体位置", text: $specificLocation)

                    Button("新建区域") {
                        newAreaName = ""
                        showingNewAreaAlert = true
                    }
                }

                Section("时间信息") {
                    DatePicker("开始使用时间", selection: $startDate, displayedComponents: .date)
                        .datePickerStyle(.wheel)

                    Toggle("设置用完时间", isOn: $hasEndDate)
                    if hasEndDate {
                        DatePicker("用完时间", selection: $endDate, displayedComponents: .date)
                            .datePickerStyle(.wheel)
                    }

                    Toggle("设置过期时间", isOn: $hasExpiryDate)
                    if hasExpiryDate {
                        DatePicker("过期时间", selection: $expiryDate, displayedComponents: .date)
                            .datePickerStyle(.wheel)
                    }
                }
            }
            .navigationTitle(item == nil ? "添加物品" : "编辑物品")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("取消") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("保存") {
                        save()
                    }
                }
            }
            .alert("新建区域", isPresented: $showingNewAreaAlert) {
                TextField("区域名称", text: $newAreaName)
                Button("取消", role: .cancel) {}
                Button("添加") {
                    addArea()
                }
            } message: {
                Text("请输入新区域名称")
            }
            .alert("无法保存", isPresented: $showingValidationAlert) {
                Button("确定", role: .cancel) {}
            } message: {
                Text(validationMessage)
            }
        }
    }

    private func addArea() {
        let trimmed = newAreaName.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }

        let area = Area(name: trimmed)
        modelContext.insert(area)
        selectedArea = area
    }

    private func save() {
        let input = ItemFormValidator.Input(
            name: name,
            priceText: purchasePriceText,
            area: selectedArea,
            startDate: startDate,
            endDate: hasEndDate ? endDate : nil
        )

        if let error = ItemFormValidator.validate(input) {
            validationMessage = message(for: error)
            showingValidationAlert = true
            return
        }

        guard let area = selectedArea,
              let price = ItemFormValidator.parsePrice(purchasePriceText) else {
            return
        }

        let trimmedName = name.trimmingCharacters(in: .whitespacesAndNewlines)
        let trimmedLocation = specificLocation.trimmingCharacters(in: .whitespacesAndNewlines)

        if let item {
            item.name = trimmedName
            item.purchasePrice = price
            item.area = area
            item.specificLocation = trimmedLocation
            item.startDate = startDate
            item.endDate = hasEndDate ? endDate : nil
            item.expiryDate = hasExpiryDate ? expiryDate : nil
            item.updatedAt = Date()
        } else {
            let newItem = Item(
                name: trimmedName,
                purchasePrice: price,
                startDate: startDate,
                area: area,
                specificLocation: trimmedLocation
            )
            newItem.endDate = hasEndDate ? endDate : nil
            newItem.expiryDate = hasExpiryDate ? expiryDate : nil
            modelContext.insert(newItem)
        }

        try? modelContext.save()
        dismiss()
    }

    private func message(for error: ItemFormValidator.ValidationError) -> String {
        switch error {
        case .emptyName:
            return "请输入物品名称"
        case .invalidPrice:
            return "请输入有效的价格（≥ 0）"
        case .missingArea:
            return "请选择区域"
        case .startAfterEnd:
            return "开始时间不能晚于用完时间"
        }
    }
}
