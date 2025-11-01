/**
 * 🎯 Prompt Builder - Construiește prompt-uri structurate pentru Ollama
 * Acest modul creează prompt-uri optimizate pentru diferite tipuri de analiză de cod
 */

class PromptBuilder {
  constructor() {
    this.systemContext = `You are an expert code reviewer and software engineer. 
Your role is to analyze code, identify issues, suggest improvements, and provide clear, actionable feedback.
Always format your responses in Markdown with proper code blocks.`;
  }

  /**
   * 🔍 Prompt pentru "Ask About This Code"
   */
  buildAskPrompt(code, language, fileName, question) {
    return `${this.systemContext}

## 📋 Task
Answer the following question about the provided code with detailed explanations.

## ❓ User Question
${question}

## 📄 File Context
- **File Name:** \`${fileName}\`
- **Language:** ${language}
- **Lines of Code:** ${code.split('\n').length}

## 💻 Code to Analyze
\`\`\`${language}
${code}
\`\`\`

## 📝 Instructions
1. **Understand the question** - Make sure you fully understand what the user is asking
2. **Analyze the code** - Review the code in context of the question
3. **Provide a clear answer** - Give a detailed, well-structured response
4. **Use examples** - If helpful, show code examples in your explanation
5. **Be specific** - Reference specific lines or patterns in the code

## 🎯 Response Format
Structure your response with:
- A brief summary of your answer
- Detailed explanation with code references
- Examples or suggestions if applicable
- Any warnings or important notes

Please provide your analysis now:`;
  }

  /**
   * 🔧 Prompt pentru "Quick Fix"
   */
  buildQuickFixPrompt(code, language, issue) {
    return `${this.systemContext}

## 🔧 Task
Fix the following code issue and provide the corrected version with explanations.

## 🐛 Reported Issue
${issue}

## 💻 Code with Issue
\`\`\`${language}
${code}
\`\`\`

## 📝 Instructions
1. **Identify the problem** - Explain what's wrong with the current code
2. **Provide the fix** - Show the corrected code with clear changes
3. **Explain the solution** - Describe why this fix works
4. **Add best practices** - Suggest any additional improvements

## 🎯 Response Format
Please structure your response as follows:

### 🔍 Problem Identified
[Explain the issue]

### ✅ Fixed Code
\`\`\`${language}
[Your fixed code here]
\`\`\`

### 📖 Explanation
[Why this fix works]

### 💡 Additional Recommendations
[Any other improvements]

Please provide your fix now:`;
  }

  /**
   * 🔬 Prompt pentru "Review with Dependencies"
   */
  buildReviewWithDepsPrompt(code, language, fileName, dependencies, issue) {
    const depsSummary = dependencies ? `

## 📦 Dependencies Analyzed
${dependencies}` : '';

    return `${this.systemContext}

## 🔬 Task
Perform a comprehensive code review including dependencies to solve the reported issue.

## 🐛 Reported Issue
${issue}

## 📄 Main File Context
- **File Name:** \`${fileName}\`
- **Language:** ${language}
- **Lines of Code:** ${code.split('\n').length}

## 💻 Main File Code
\`\`\`${language}
${code}
\`\`\`
${depsSummary}

## 📝 Instructions
1. **Analyze the main file** - Review the primary code structure and logic
2. **Check dependencies** - Look for issues in imported modules/files
3. **Identify the root cause** - Find what's causing the reported issue
4. **Trace the flow** - Follow the execution path across files
5. **Provide a solution** - Suggest fixes in the appropriate file(s)

## 🎯 Response Format
Please structure your response as:

### 🔍 Root Cause Analysis
[What's causing the issue and where]

### 📂 Files Affected
[List which files need changes]

### ✅ Proposed Solution
[Detailed fix with code examples]

### 🔄 Implementation Steps
[Step-by-step guide to apply the fix]

### ⚠️ Potential Side Effects
[Any warnings or considerations]

Please provide your comprehensive review now:`;
  }

  /**
   * 🎨 Prompt pentru explicații generale de cod
   */
  buildExplainPrompt(code, language, fileName) {
    return `${this.systemContext}

## 📖 Task
Provide a comprehensive explanation of the following code.

## 📄 File Context
- **File Name:** \`${fileName}\`
- **Language:** ${language}

## 💻 Code to Explain
\`\`\`${language}
${code}
\`\`\`

## 📝 Instructions
1. **High-level overview** - What does this code do?
2. **Structure breakdown** - Explain major components/functions
3. **Logic flow** - Describe how the code executes
4. **Key patterns** - Identify important patterns or techniques used
5. **Potential improvements** - Suggest optimizations or best practices

## 🎯 Response Format

### 📌 Overview
[Brief summary of what the code does]

### 🏗️ Structure
[Break down the components]

### 🔄 Flow
[Explain the execution flow]

### 💡 Insights
[Key takeaways and suggestions]

Please provide your explanation now:`;
  }

  /**
   * 🚀 Prompt pentru optimizare de performanță
   */
  buildOptimizePrompt(code, language, fileName) {
    return `${this.systemContext}

## 🚀 Task
Analyze the code for performance optimization opportunities.

## 📄 File Context
- **File Name:** \`${fileName}\`
- **Language:** ${language}

## 💻 Code to Optimize
\`\`\`${language}
${code}
\`\`\`

## 📝 Instructions
1. **Performance analysis** - Identify bottlenecks and inefficiencies
2. **Memory usage** - Check for memory leaks or excessive allocations
3. **Algorithmic complexity** - Evaluate Big O complexity
4. **Best practices** - Compare against language-specific optimizations
5. **Provide optimized version** - Show improved code

## 🎯 Response Format

### ⚡ Performance Issues Found
[List identified issues]

### 📊 Current Complexity
[Big O analysis]

### ✅ Optimized Code
\`\`\`${language}
[Optimized version]
\`\`\`

### 📈 Improvements Made
[Explain the optimizations]

### 🔢 Expected Performance Gain
[Estimated improvement]

Please provide your optimization analysis now:`;
  }
}

module.exports = { PromptBuilder };