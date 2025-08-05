# AI Prompts Location

All AI prompts have been refactored to use YAML files compatible with GitHub's evaluation tools.

## Prompt Files

The prompts are located in:
- **Source directory**: `/src/prompts/` (for development)
- **Public directory**: `/public/prompts/` (for runtime access)

### Available Prompt Files

1. **`packing-suggestions.prompt.yaml`**
   - Generates comprehensive packing lists based on trip details
   - Used in: `src/lib/trip-generator.ts` - `generatePackingSuggestions()`

2. **`trip-itinerary.prompt.yaml`**
   - Creates detailed multi-day itineraries 
   - Used in: `src/lib/trip-generator.ts` - `generateItinerary()`

3. **`photo-search-terms.prompt.yaml`**
   - Generates optimal search terms for location-specific photos
   - Used in: `src/lib/photo-service.ts` - `generatePhotosForActivity()`

4. **`hero-photo-search.prompt.yaml`**
   - Generates search terms for destination hero photos
   - Used in: `src/lib/photo-service.ts` - `generateDestinationHeroPhoto()`

## Usage

The prompts are loaded and rendered using the `prompt-service.ts`:

```typescript
import { renderPrompt, createSparkPrompt } from '@/lib/prompt-service'

// Load and render a prompt with variables
const { prompt, model, outputFormat } = await renderPrompt('prompt-name', {
  variable1: 'value1',
  variable2: 'value2'
})

// Create spark prompt and execute
const sparkPrompt = createSparkPrompt(prompt)
const response = await spark.llm(sparkPrompt, model, outputFormat === 'json')
```

## YAML Structure

Each prompt file follows this structure:

```yaml
name: "Prompt Name"
description: "Description of what this prompt does"

variables:
  - name: "variableName"
    type: "string|number|boolean"
    description: "What this variable represents"

prompt: |
  Your prompt template here with {{variableName}} placeholders.
  
  {{#if booleanVariable}}
  Conditional content when boolean is true
  {{else}}
  Content when boolean is false
  {{/if}}

output_format: "json"  # or "text"
model: "gpt-4o"        # or "gpt-4o-mini"
```

This structure makes the prompts compatible with GitHub's evaluation tools while maintaining full functionality in the application.