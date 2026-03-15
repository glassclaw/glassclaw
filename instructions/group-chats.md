# Group Chat Cards

## Overview

Glass Claw cards work in group chats. Any member of the group can tap the card button and view it.

## Key differences from private chats

- **No setup required.** Do not call `setup` in group chats. Setup is only for private chats.
- **Cards are not private.** All group members can see the card. Do not use group cards for personal or sensitive information.
- **Form responses are shared.** If the card has a submit button, any group member can submit. The first submission you receive via `poll_response` may come from any member.

## Detecting a group chat

In most Telegram bot frameworks, you can tell a chat is a group when:

- The `chatId` is different from the `userId` (in private chats they are the same)
- The chat `type` is `"group"` or `"supergroup"`

When you detect a group chat, skip the `setup` call and pass `group: true` to `create_card`.

## Creating a card in a group

```js
const card = await use("{baseDir}/tools/glassclaw.js", {
  tool: "create_card",
  chatId: groupChat.id,
  userId: user.id,        // the user who triggered the action
  title: "Team poll",
  payload: pollPayload,
  group: true
});
```

## Handling form responses from groups

Form responses from group cards work the same way as private cards — call `poll_response` after creating the card:

```js
const response = await use("{baseDir}/tools/glassclaw.js", {
  tool: "poll_response",
  surfaceId: card.surfaceId
});
```

The response includes the form data from whoever submitted first. The same polling limits apply — see `{baseDir}/instructions/form-responses.md` for details.
