# prepareExo & prepareExoClass Cheat Sheet

## prepareExoClass

**What it is:**
- Returns maker function for creating instances
- Use for: factories, multiple objects

**State Behavior:**
- Has init function that returns initial state
- Init runs ONLY on fresh deployment
- Init does NOT run on upgrades
- Old state fields: ✅ Preserved with values
- New state fields: ❌ undefined (need migration)
- Access state: `this.state.field`
- Migration: `if (!('field' in state)) state.field = 'default'`

**Interface Behavior:**
- ✅ Safe: Keep methods same, change implementation
- ⚠️ Caution: Add new method (test first)
- ❌ DANGEROUS: Change signature, remove method, rename method
- Danger result: Baggage corruption = ALL data lost

---

## prepareExo

**What it is:**
- Returns singleton instance immediately
- Use for: single public facet

**State Behavior:**
- NO init function (uses empty state `{}`)
- State managed externally (in baggage or closure scope)
- Cannot define initial state in exo
- Common pattern: Store state directly in baggage
- Example: `baggage.init('counter', 0)` then `baggage.get('counter')`

**Interface Behavior:**
- ✅ Safe: Keep methods same, change implementation
- ⚠️ Caution: Add new method (test first)
- ❌ DANGEROUS: Change signature, remove method, rename method
- Danger result: Baggage corruption = ALL data lost

---