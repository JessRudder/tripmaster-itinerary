/**
 * Prompt Service - YAML-based prompt management for GitHub eval tools
 * 
 * This service loads and renders prompt templates from YAML files,
 * making them compatible with GitHub's evaluation tools while 
 * maintaining runtime functionality.
 */

interface PromptConfig {
  name: string
  description: string
  variables: Array<{
    name: string
    type: string
    description: string
  }>
  prompt: string
  output_format?: string
  model?: string
}

interface PromptVariables {
  [key: string]: any
}

/**
 * Simple template renderer for basic variable substitution
 * Supports {{variable}} syntax and {{#if condition}}{{/if}} blocks
 */
function renderTemplate(template: string, variables: PromptVariables): string {
  let rendered = template

  // Handle simple variable substitution {{variable}}
  rendered = rendered.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
    return variables[variable]?.toString() || match
  })

  // Handle conditional blocks {{#if variable}}content{{/if}}
  rendered = rendered.replace(/\{\{#if (\w+)\}\}(.*?)\{\{\/if\}\}/g, (match, variable, content) => {
    return variables[variable] ? content : ''
  })

  // Handle conditional blocks with else {{#if variable}}content{{else}}other{{/if}}
  rendered = rendered.replace(/\{\{#if (\w+)\}\}(.*?)\{\{else\}\}(.*?)\{\{\/if\}\}/g, (match, variable, ifContent, elseContent) => {
    return variables[variable] ? ifContent : elseContent
  })

  return rendered
}

/**
 * Cache for loaded prompt configs to avoid re-parsing
 */
const promptCache = new Map<string, PromptConfig>()

/**
 * Loads and parses a YAML prompt file
 */
async function loadPromptConfig(promptName: string): Promise<PromptConfig> {
  // Check cache first
  if (promptCache.has(promptName)) {
    return promptCache.get(promptName)!
  }

  try {
    // Try to fetch the YAML file from the public directory
    const response = await fetch(`/prompts/${promptName}.prompt.yaml`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const yamlContent = await response.text()
    
    // Simple YAML parser for our prompt structure
    const config = parseSimpleYaml(yamlContent)
    
    // Cache the result
    promptCache.set(promptName, config)
    
    return config
  } catch (error) {
    console.error(`Failed to load prompt config: ${promptName}`, error)
    throw new Error(`Prompt configuration not found: ${promptName}`)
  }
}

/**
 * Simple YAML parser for our specific prompt file structure
 * Note: This is a basic parser for our use case, not a full YAML implementation
 */
function parseSimpleYaml(yamlContent: string): PromptConfig {
  const lines = yamlContent.split('\n')
  const config: any = {}
  let currentKey = ''
  let inMultilineString = false
  let multilineContent = ''
  let variables: any[] = []
  let currentVariable: any = {}
  let inVariables = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmedLine = line.trim()

    if (inMultilineString) {
      if (currentKey === 'prompt' && line.startsWith('output_format:')) {
        // End of multiline prompt, process next key
        config[currentKey] = multilineContent.trim()
        inMultilineString = false
        currentKey = ''
        multilineContent = ''
        // Process the current line
        const [key, value] = line.split(':').map(s => s.trim())
        config[key] = value.replace(/"/g, '')
      } else {
        multilineContent += line + '\n'
      }
      continue
    }

    if (trimmedLine.startsWith('- name:') && inVariables) {
      // Save previous variable if exists
      if (currentVariable.name) {
        variables.push({ ...currentVariable })
      }
      currentVariable = { name: trimmedLine.split(':')[1].trim().replace(/"/g, '') }
    } else if (trimmedLine.startsWith('type:') && inVariables) {
      currentVariable.type = trimmedLine.split(':')[1].trim().replace(/"/g, '')
    } else if (trimmedLine.startsWith('description:') && inVariables) {
      currentVariable.description = trimmedLine.split(':')[1].trim().replace(/"/g, '')
    } else if (trimmedLine === 'variables:') {
      inVariables = true
    } else if (trimmedLine.startsWith('prompt:') && trimmedLine.includes('|')) {
      currentKey = 'prompt'
      inMultilineString = true
      inVariables = false
      // Save last variable if in variables section
      if (currentVariable.name) {
        variables.push({ ...currentVariable })
        currentVariable = {}
      }
    } else if (trimmedLine.includes(':') && !inVariables) {
      inVariables = false
      const [key, value] = trimmedLine.split(':').map(s => s.trim())
      if (value) {
        config[key] = value.replace(/"/g, '')
      }
    }
  }

  // Handle end of file
  if (inMultilineString && currentKey === 'prompt') {
    config[currentKey] = multilineContent.trim()
  }
  if (currentVariable.name) {
    variables.push(currentVariable)
  }

  config.variables = variables
  return config as PromptConfig
}

/**
 * Main function to load a prompt, render it with variables, and return the formatted prompt
 */
export async function renderPrompt(promptName: string, variables: PromptVariables): Promise<{
  prompt: string
  model?: string
  outputFormat?: 'json' | 'text'
}> {
  const config = await loadPromptConfig(promptName)
  const renderedPrompt = renderTemplate(config.prompt, variables)
  
  return {
    prompt: renderedPrompt,
    model: config.model,
    outputFormat: config.output_format === 'json' ? 'json' : 'text'
  }
}

/**
 * Helper function to create a spark.llmPrompt from a rendered template
 */
export function createSparkPrompt(renderedPrompt: string): string {
  return spark.llmPrompt`${renderedPrompt}`
}