# Permissions Justification - ColorStation

## `activeTab`
Allows ColorStation to run only on the current active tab after explicit user action (toolbar click or command).

## `scripting`
Required to inject `content_script.js` programmatically only when picker mode starts.

## `storage`
Stores user preferences and local color history (up to 5 entries).

## `tabs`
Used for:
- `chrome.tabs.captureVisibleTab` (primary pixel sampling strategy)
- active tab targeting and runtime messaging during picker startup

## Host Permissions
No persistent host permissions are requested.
