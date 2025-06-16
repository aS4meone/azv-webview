# RentalPage Optimization

## 🎯 Overview
The RentalPage has been completely refactored and optimized by breaking it down into smaller, reusable components and extracting business logic into custom hooks.

## 📁 New Structure

```
src/_pages/main/ui/widgets/renta-screen/
├── components/
│   ├── DurationSelector.tsx      # Duration increment/decrement controls
│   ├── MinutesInfoBox.tsx        # Yellow info box for minutes mode
│   ├── PricingDetails.tsx        # Pricing display component
│   ├── AdditionalInfo.tsx        # Tariff info and contract buttons
│   ├── RentalTabContent.tsx      # Unified tab content component
│   └── index.ts                  # Component exports
├── hooks/
│   └── usePricingCalculator.ts   # Custom hook for pricing logic and state
├── index.tsx                     # Main RentalPage component
└── README.md                     # This documentation
```

## 🧩 Components

### **DurationSelector**
Reusable component for duration selection with increment/decrement buttons.
- Props: `duration`, `maxDuration`, `getUnitText`, `onIncrement`, `onDecrement`
- Features: Disabled states, smooth animations, responsive design

### **MinutesInfoBox**
Information box that appears in minutes mode explaining automatic timing.
- No props required
- Styled with yellow theme to indicate important information

### **PricingDetails**
Displays pricing breakdown with proper formatting.
- Props: `config`, `car`, `pricePerUnit`, `baseCost`, `totalCost`
- Features: Different layouts for opening fee vs regular pricing

### **AdditionalInfo**
Container for additional action buttons (tariff info, contract).
- Props: `onTariffInfo?`, `onContract?`
- Features: Hover effects, consistent styling

### **RentalTabContent**
Unified component that combines all tab content elements.
- Props: All necessary data for a complete rental tab
- Features: Automatic mode detection, proper component composition

## 🎣 Custom Hook

### **usePricingCalculator**
Centralizes all pricing logic and state management.

**Returns:**
- `activeTab`: Current rental type
- `duration`: Current duration value
- `calculateCost`: Function to calculate costs for any rental type
- `handleTabChange`: Tab switching with duration reset
- `incrementDuration` / `decrementDuration`: Duration controls
- `getRentalData`: Returns complete rental data for submission

**Features:**
- Memoized calculations for performance
- Callback optimization with `useCallback`
- Type-safe rental configurations
- Centralized business logic

## 📊 Performance Improvements

### **Before Optimization:**
- ❌ 400+ lines in single file
- ❌ Mixed concerns (UI + business logic)
- ❌ Repetitive code in tab contents
- ❌ Manual state management
- ❌ Inline styling and hardcoded values

### **After Optimization:**
- ✅ ~50 lines in main component
- ✅ Separated concerns with custom hook
- ✅ Reusable components eliminate duplication
- ✅ Centralized state management
- ✅ Consistent styling and behavior

## 🔄 Migration Benefits

1. **Maintainability**: Easier to update individual features
2. **Reusability**: Components can be used in other parts of the app
3. **Testing**: Each component and hook can be tested independently
4. **Performance**: Memoized calculations and optimized re-renders
5. **Type Safety**: Better TypeScript support with proper interfaces
6. **Consistency**: Unified styling and behavior patterns

## 🚀 Usage Example

```tsx
// Simple usage - all complexity is hidden
export const RentalPage = ({ car, onBack, onRent }: RentalPageProps) => {
  const {
    activeTab,
    duration,
    calculateCost,
    handleTabChange,
    incrementDuration,
    decrementDuration,
    getRentalData,
  } = usePricingCalculator(car);

  const handleRent = () => {
    onRent(getRentalData());
  };

  // ... handlers for tariff info and contract

  return (
    <article className="bg-white min-h-screen">
      <CarImageCarousel car={car} height="h-80" onBack={onBack} />
      
      <div className="px-4 py-6 space-y-6">
        <CarInfoHeader car={car} />
        <CarSpecs car={car} />
        
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList variant="rounded">
            <TabsTrigger value="minutes">Минуты</TabsTrigger>
            <TabsTrigger value="hours">Часы</TabsTrigger>
            <TabsTrigger value="days">Дни</TabsTrigger>
          </TabsList>

          {["minutes", "hours", "days"].map((rentalType) => (
            <TabsContent key={rentalType} value={rentalType} className="mt-6">
              <RentalTabContent
                rentalType={rentalType as RentalType}
                car={car}
                duration={duration}
                totalCost={calculateCost(rentalType).totalCost}
                baseCost={calculateCost(rentalType).baseCost}
                onIncrement={incrementDuration}
                onDecrement={decrementDuration}
                onTariffInfo={handleTariffInfo}
                onContract={handleContract}
              />
            </TabsContent>
          ))}
        </Tabs>

        <div className="pt-4">
          <Button onClick={handleRent}>Забронировать</Button>
        </div>
      </div>
    </article>
  );
};
```

## 📝 Notes

- All components are fully typed with TypeScript
- Components follow the existing design system
- Business logic is centralized and testable
- Easy to extend with new rental types or features
- Maintains backward compatibility with existing APIs 