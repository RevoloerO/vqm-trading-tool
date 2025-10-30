# MTF Checklist Architecture

## Overview
The Multi-Timeframe (MTF) Checklist has been refactored following clean architecture principles with clear separation of concerns.

## Architecture Layers

### 1. Custom Hooks Layer (Business Logic)
Located in `/src/hooks/`

#### `useMTFChecklistState.js`
**Responsibility:** State management
- Manages all checklist state (higher/mid/lower timeframes)
- Handles step transitions
- Provides action handlers for all user interactions
- Integrates with localStorage for persistence

**Benefits:**
- Single source of truth for state
- Testable in isolation
- Reusable across components
- Clear API surface

#### `useMTFValidation.js`
**Responsibility:** Validation logic
- Validates each timeframe independently
- Calculates recommendations
- Computes locked/unlocked states
- Returns aggregated validation results

**Benefits:**
- Separates validation from UI
- Easy to test validation rules
- Can be modified without touching UI
- Automatic validation on state changes

#### `useRiskRewardCalculation.js`
**Responsibility:** R/R calculation
- Handles risk/reward ratio calculation
- Auto-checks R/R checkbox when threshold met
- Manages calculation state and errors
- Follows Single Responsibility Principle

**Benefits:**
- Extracted complex useEffect logic
- Reusable in other components
- Clear input/output contract
- Easy to unit test

#### `usePositionSizeCalculation.js`
**Responsibility:** Position sizing
- Calculates position size based on risk parameters
- Auto-checks position size when valid
- Validates against maximum risk limits
- Returns formatted results

**Benefits:**
- Encapsulates position sizing logic
- Prevents logic duplication
- Consistent validation rules
- Testable calculation logic

### 2. Utility Layer (Pure Functions)
Located in `/src/utils/`

#### `inputValidation.js` (NEW)
**Responsibility:** Centralized input validation
- Single source of truth for all validations
- Validates numeric inputs, prices, percentages
- Batch validation support
- Consistent error messages

**Benefits:**
- NO MORE REDUNDANT VALIDATIONS
- Validates once in the right layer
- Easy to maintain validation rules
- Consistent UX across app

**Functions:**
```javascript
validateNumericInput(value, options)
validatePrice(value, fieldName)
validatePercentage(value, fieldName, maxPercent)
validateAccountSize(value)
validateRiskPercent(value, maxRisk)
validateGapPercent(value)
validateAllFieldsFilled(fields, fieldNames)
validateFields(fields, validators)
```

#### `checklistValidation.js` (EXISTING)
**Responsibility:** Business rule validation
- Validates timeframe completion rules
- Calculates position recommendations
- Handles trading style-specific logic

#### `checklistStorage.js` (EXISTING)
**Responsibility:** Persistence
- localStorage management
- State serialization/deserialization
- Expiration handling

### 3. Presentation Layer (UI Components)
Located in `/src/components/MTFChecklist/`

#### `MTFChecklistRefactored.jsx` (NEW)
**Responsibility:** Container component
- Orchestrates hooks
- Maps state to props
- Handles user events
- NO business logic

**Size:** ~250 lines (down from 670)

#### `ChecklistHeader.jsx` (NEW)
**Responsibility:** Header UI
- Pure presentation component
- Receives props, renders UI
- No state, no logic

#### Existing Section Components
- `HigherTimeframeSection.jsx`
- `MidTimeframeSection.jsx`
- `LowerTimeframeSection.jsx`
- `FinalDecisionPanel.jsx`
- `ProgressBar.jsx`
- `TradingStyleSelector.jsx`

## Before vs After

### Before (Problems)
```
MTFChecklist.jsx (670 lines)
├── State management (100 lines)
├── Validation logic (150 lines)
├── Event handlers (100 lines)
├── useEffects (100 lines)
├── Storage logic (50 lines)
└── Render logic (170 lines)

Issues:
❌ 600+ lines in one file
❌ Mixed concerns
❌ Hard to test
❌ Redundant validations
❌ Complex useEffects
❌ Tight coupling
```

### After (Solutions)
```
MTFChecklistRefactored.jsx (250 lines)
├── useMTFChecklistState() - state
├── useMTFValidation() - validation
└── Presentation components

Hooks:
├── useMTFChecklistState.js (250 lines)
├── useMTFValidation.js (120 lines)
├── useRiskRewardCalculation.js (50 lines)
└── usePositionSizeCalculation.js (60 lines)

Utils:
├── inputValidation.js (NEW - 200 lines)
├── checklistValidation.js (existing)
└── checklistStorage.js (existing)

Benefits:
✅ Single Responsibility Principle
✅ Testable in isolation
✅ Clear separation of concerns
✅ No redundant validation
✅ Reusable hooks
✅ Easy to maintain
```

## Data Flow

```
User Interaction
    ↓
Container Component (MTFChecklistRefactored)
    ↓
Custom Hook (useMTFChecklistState)
    ↓
Validation Hook (useMTFValidation)
    ↓
Utility Functions (checklistValidation)
    ↓
Input Validation (inputValidation)
    ↓
Storage (checklistStorage)
```

## Testing Strategy

### Unit Tests
```javascript
// Test hooks in isolation
test('useMTFChecklistState handles style selection', () => {
  const { result } = renderHook(() => useMTFChecklistState());
  act(() => result.current.handleStyleSelect('day'));
  expect(result.current.state.tradingStyle).toBe('day');
});

// Test validation logic
test('validatePrice rejects invalid inputs', () => {
  expect(validatePrice('abc').isValid).toBe(false);
  expect(validatePrice('50').isValid).toBe(true);
});
```

### Integration Tests
```javascript
// Test component with custom hooks
test('MTFChecklist progresses through steps', () => {
  render(<MTFChecklist />);
  // Select style
  // Fill higher TF
  // Continue to mid TF
  // Assert state changes
});
```

## Migration Path

1. ✅ Create new hooks
2. ✅ Extract validation utilities
3. ✅ Create presentation components
4. ✅ Build refactored container
5. 🔄 Test new implementation
6. 🔄 Switch HomePage to use `MTFChecklistRefactored`
7. 🔄 Remove old `MTFChecklist.jsx`

## Usage

```javascript
// In HomePage.jsx
import MTFChecklist from './components/MTFChecklist/MTFChecklistRefactored';

// That's it! The component manages everything internally
<MTFChecklist />
```

## Key Principles Followed

1. **Single Responsibility**: Each module does one thing well
2. **Separation of Concerns**: UI, logic, and data are separate
3. **DRY**: No redundant validation logic
4. **Testability**: Pure functions and isolated hooks
5. **Maintainability**: Changes isolated to specific layers
6. **Reusability**: Hooks can be used in other components

## Performance Benefits

- Hooks allow for granular re-renders
- Memoization opportunities with `useCallback`
- Validation only runs when needed
- Storage operations isolated from render

## Future Improvements

1. Add TypeScript types
2. Implement comprehensive test suite
3. Add error boundaries
4. Consider state machine for step transitions
5. Add performance monitoring
6. Extract more reusable hooks
