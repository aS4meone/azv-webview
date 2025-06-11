# Universal Tab Components

A comprehensive, accessible, and flexible tab component system for React applications.

## Components

### `Tabs`
The main container component that provides context and state management.

**Props:**
- `defaultValue?: string` - Initial tab value (required for uncontrolled mode)
- `value?: string` - Current tab value (for controlled mode)
- `onValueChange?: (value: string) => void` - Callback when tab changes (for controlled mode)
- `children: React.ReactNode` - Child components
- `className?: string` - Additional CSS classes

### `TabsList`
Container for tab trigger buttons with different styling variants.

**Props:**
- `children: React.ReactNode` - TabsTrigger components
- `className?: string` - Additional CSS classes
- `variant?: "default" | "rounded" | "pills"` - Visual style variant

**Variants:**
- `default`: Rounded full background (`bg-[#F8F8F8] rounded-full`)
- `rounded`: Rounded corners (`bg-gray-100 rounded-xl`)
- `pills`: Individual pill-style buttons with gaps

### `TabsTrigger`
Individual tab button with automatic active state management.

**Props:**
- `value: string` - Unique identifier for this tab
- `children: React.ReactNode` - Button content
- `className?: string` - Additional CSS classes
- `disabled?: boolean` - Whether the tab is disabled

### `TabsContent`
Content container that shows/hides based on active tab.

**Props:**
- `value: string` - Tab identifier that this content belongs to
- `children: React.ReactNode` - Content to display
- `className?: string` - Additional CSS classes
- `forceMount?: boolean` - Keep content mounted even when inactive

### `TabButton` (Legacy)
Backward-compatible component for existing implementations.

**Props:**
- `isActive: boolean` - Whether this tab is active
- `onClick: () => void` - Click handler
- `children: React.ReactNode` - Button content
- `className?: string` - Additional CSS classes

## Usage Examples

### Basic Uncontrolled Tabs
```tsx
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  
  <TabsContent value="tab1">
    Content for Tab 1
  </TabsContent>
  
  <TabsContent value="tab2">
    Content for Tab 2
  </TabsContent>
</Tabs>
```

### Controlled Tabs
```tsx
const [activeTab, setActiveTab] = useState("profile");

<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList variant="rounded">
    <TabsTrigger value="profile">Profile</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  
  <TabsContent value="profile">Profile content</TabsContent>
  <TabsContent value="settings">Settings content</TabsContent>
</Tabs>
```

### Different Variants
```tsx
// Default variant (current app style)
<TabsList>
  <TabsTrigger value="option1">Option 1</TabsTrigger>
  <TabsTrigger value="option2">Option 2</TabsTrigger>
</TabsList>

// Rounded variant (like rental page)
<TabsList variant="rounded">
  <TabsTrigger value="minutes">Minutes</TabsTrigger>
  <TabsTrigger value="hours">Hours</TabsTrigger>
  <TabsTrigger value="days">Days</TabsTrigger>
</TabsList>

// Pills variant (individual buttons)
<TabsList variant="pills">
  <TabsTrigger value="all">All</TabsTrigger>
  <TabsTrigger value="active">Active</TabsTrigger>
  <TabsTrigger value="completed">Completed</TabsTrigger>
</TabsList>
```

### With Disabled Tabs
```tsx
<TabsList>
  <TabsTrigger value="available">Available</TabsTrigger>
  <TabsTrigger value="coming-soon" disabled>Coming Soon</TabsTrigger>
</TabsList>
```

## Migration Guide

### From TabButton to Universal Tabs

**Before:**
```tsx
const [activeTab, setActiveTab] = useState<"trips" | "fines">("trips");

<div className="flex gap-2 p-1 bg-[#F8F8F8] rounded-full">
  <TabButton
    isActive={activeTab === "trips"}
    onClick={() => setActiveTab("trips")}
  >
    Trips
  </TabButton>
  <TabButton
    isActive={activeTab === "fines"}
    onClick={() => setActiveTab("fines")}
  >
    Fines
  </TabButton>
</div>

{activeTab === "trips" && <TripsContent />}
{activeTab === "fines" && <FinesContent />}
```

**After:**
```tsx
<Tabs defaultValue="trips">
  <TabsList>
    <TabsTrigger value="trips">Trips</TabsTrigger>
    <TabsTrigger value="fines">Fines</TabsTrigger>
  </TabsList>
  
  <TabsContent value="trips">
    <TripsContent />
  </TabsContent>
  
  <TabsContent value="fines">
    <FinesContent />
  </TabsContent>
</Tabs>
```

## Features

- ✅ **Automatic State Management**: No need to manage active state manually
- ✅ **Accessibility**: Proper ARIA attributes and keyboard navigation
- ✅ **TypeScript Support**: Full type safety and IntelliSense
- ✅ **Flexible Styling**: Multiple variants and custom className support
- ✅ **Controlled & Uncontrolled**: Support for both modes
- ✅ **Backward Compatibility**: Existing TabButton component still works
- ✅ **Performance**: Optimized rendering with minimal re-renders
- ✅ **Disabled State**: Support for disabled tabs
- ✅ **Force Mount**: Option to keep content mounted when inactive

## Styling

The components use your existing design system:
- Active tab: `bg-[#191919] text-white`
- Inactive tab: `bg-transparent text-[#191919]`
- Container backgrounds: `bg-[#F8F8F8]` (default) or `bg-gray-100` (rounded)
- Smooth transitions and hover effects
- Focus states for accessibility

## Best Practices

1. **Use descriptive values**: Choose meaningful tab values like "profile", "settings" instead of "tab1", "tab2"
2. **Prefer uncontrolled mode**: Unless you need external control, use `defaultValue` for simpler code
3. **Keep content organized**: Group related TabsContent components near their TabsList
4. **Accessibility**: Always provide meaningful labels for tab triggers
5. **Performance**: Use `forceMount` sparingly, only when content needs to stay alive 