/**
 * Prompt validation script - tests that all YAML prompts can be loaded and rendered
 */
import { renderPrompt } from './lib/prompt-service'

export async function validatePrompts() {
  const testCases = [
    {
      name: 'packing-suggestions',
      variables: {
        days: 5,
        destination: 'Paris, France',
        activitiesList: 'Visit Eiffel Tower, Louvre Museum, Seine River cruise',
        activityType: 'cultural',
        weatherCondition: 'mild and partly cloudy',
        temperature: '65°F',
        hasChildren: false
      }
    },
    {
      name: 'trip-itinerary',
      variables: {
        days: 3,
        destination: 'Tokyo, Japan',
        activityType: 'cultural',
        childrenText: 'activities for adults',
        hasChildren: false
      }
    },
    {
      name: 'photo-search-terms',
      variables: {
        destination: 'Rome, Italy',
        activity: 'Visit the Colosseum',
        activityType: 'cultural'
      }
    },
    {
      name: 'hero-photo-search',
      variables: {
        destination: 'Barcelona, Spain'
      }
    }
  ]

  const results = []

  for (const testCase of testCases) {
    try {
      const result = await renderPrompt(testCase.name, testCase.variables)
      results.push({
        prompt: testCase.name,
        status: 'success',
        promptLength: result.prompt.length,
        model: result.model,
        outputFormat: result.outputFormat
      })
      console.log(`✅ ${testCase.name}: Successfully rendered (${result.prompt.length} chars)`)
    } catch (error) {
      results.push({
        prompt: testCase.name,
        status: 'error',
        error: error.message
      })
      console.error(`❌ ${testCase.name}: ${error.message}`)
    }
  }

  return results
}

// Export for use in other parts of the app if needed
export { renderPrompt } from './lib/prompt-service'