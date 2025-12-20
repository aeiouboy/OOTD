# Interactive Test Mode - User Guide

## Overview

The Enhanced Interactive Test Mode allows you to test and compare up to 4 different LLM models simultaneously with real-time, natural chat interactions. This replaces the previous single-shot test mode with a full conversational interface.

## Key Features

### Multi-Panel Layout
- **Up to 4 Panels**: Test up to 4 different models at the same time
- **Responsive Grid**: Automatically adjusts layout based on number of panels
  - 1 panel: Full width
  - 2 panels: Side by side (on desktop)
  - 3 panels: 2 columns, 3 rows
  - 4 panels: 2x2 grid
- **Color-Coded**: Each panel has a distinct color for easy identification

### Interactive Chat
- **Natural Conversation**: Type and interact like a real chat interface
- **Multi-Turn Conversations**: Build context across multiple messages
- **Real-Time Responses**: See model responses as they arrive
- **Typing Indicators**: Visual feedback while models are processing

### Cost & Budget Tracking
- **Shared Budget**: $5.00 default budget shared across all panels
- **Real-Time Cost Tracking**: See costs per message and cumulative per panel
- **Token Usage**: Track prompt, completion, and total tokens
- **Budget Warnings**: Visual alerts at 80% and 100% usage
- **Auto-Disable**: Panels automatically disable when budget is exceeded

### Per-Panel Features
- **Model Selection**: Choose any model from the dropdown
- **Message History**: Full conversation history with timestamps
- **Stats Display**: Token count and cost per panel
- **Clear Conversation**: Reset individual panel history
- **Remove Panel**: Remove panels you don't need

## How to Use

### Enabling Test Mode

1. Set `NEXT_PUBLIC_ENABLE_TEST_MODE=true` in your `.env.local` file
2. Click the "Test Mode" button in the chat interface header
3. The interface switches to Interactive Test Mode

### Adding Panels

1. Click "Add Panel" button (top right)
2. You can add up to 4 panels simultaneously
3. Each panel is independent with its own conversation

### Selecting Models

1. Click the dropdown at the top of each panel
2. Select from available models (configured in `config/models.json`)
3. Models include:
   - Gemini 2.0 Flash (Free)
   - GPT-4 Turbo
   - Claude 3.5 Sonnet
   - Claude Sonnet 4.5
   - Qwen 2.5 72B
   - DeepSeek Chat
   - And more...

### Starting Conversations

1. Type your message in the text area at the bottom of each panel
2. Press Enter or click the Send button
3. Wait for the model to respond
4. Continue the conversation naturally

### Managing Conversations

- **Clear a Panel**: Click the trash icon to clear that panel's history
- **Remove a Panel**: Click the X icon to remove the panel entirely
- **View Stats**: Check the stats bar for token usage and cost
- **Monitor Budget**: Keep an eye on the shared budget tracker at the top

### Exporting Results

1. Click "Export All" button (top right)
2. Downloads a JSON file with:
   - All panel conversations
   - Model configurations
   - Token usage and costs
   - Timestamps

### Resetting

1. Click "Reset" button (top right)
2. Confirms before clearing all panels and resetting budget
3. This action cannot be undone

## Technical Details

### File Structure

```
frontend/
├── components/chat/
│   ├── InteractiveTestMode.tsx       # Main container
│   ├── InteractiveChatPanel.tsx      # Individual panel
│   ├── ChatInterface.tsx              # Updated to use new mode
│   └── ChatAssistant.tsx              # Updated to use new mode
├── lib/
│   └── types/
│       └── interactive-test-types.ts  # Type definitions
└── config/
    └── models.json                    # Model configurations
```

### Data Persistence

- **Session Storage**: Conversations and budget are saved in `sessionStorage`
- **Keys Used**:
  - `interactive-test-panels`: Panel conversations
  - `interactive-test-cost`: Total cost across all panels
- **Auto-Save**: Data is automatically saved on every update
- **Survives Refresh**: Data persists through page refreshes
- **Cleared on Tab Close**: Data is lost when the browser tab is closed

### Cost Calculation

Cost per message is calculated as:
```
cost = (promptTokens × inputPricePerMillion / 1,000,000) +
       (completionTokens × outputPricePerMillion / 1,000,000)
```

### API Integration

- Uses OpenRouter API via `OpenRouterClient`
- Requires `NEXT_PUBLIC_OPENROUTER_API_KEY` in environment
- Includes retry logic for rate limiting
- Timeout handling (30s default)

## Comparison with Previous Test Mode

| Feature | Old Test Mode | New Interactive Test Mode |
|---------|---------------|---------------------------|
| Panels | Single panel | Up to 4 panels |
| Interaction | One-shot queries | Multi-turn conversations |
| Model Testing | One at a time | Multiple simultaneously |
| Conversation History | Single result | Full chat history |
| Layout | Fixed panel | Responsive grid |
| Data Persistence | Session only | Session with auto-save |

## Tips for Best Results

1. **Start Small**: Begin with 1-2 panels to understand the interface
2. **Watch Budget**: Monitor the budget tracker to avoid exceeding limits
3. **Compare Responses**: Use multiple panels to compare model responses side-by-side
4. **Export Regularly**: Export results before resetting or closing the tab
5. **Clear When Done**: Clear individual panels instead of resetting all to preserve other tests

## Troubleshooting

### Panel Won't Send Message
- Check if a model is selected
- Verify budget hasn't been exceeded
- Ensure API key is configured

### Budget Exceeded
- Click "Reset" to clear budget and start fresh
- Export results first if needed
- Consider increasing `DEFAULT_BUDGET` in code

### Models Not Loading
- Check `config/models.json` is properly formatted
- Verify file path in import statement
- Check browser console for errors

### Session Data Lost
- Data is stored in `sessionStorage` (cleared on tab close)
- Use "Export All" to save conversations permanently
- Consider implementing localStorage for longer persistence

## Future Enhancements

Potential improvements for future versions:
- Adjustable budget per session
- Model presets for quick testing
- Side-by-side message comparison view
- Export to CSV/Excel formats
- Conversation templates
- Response time charts
- Cost optimization suggestions

## Support

For issues or feature requests, please refer to the project documentation or contact the development team.
