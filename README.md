# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.


## AI Chat Improvements & Fixes
- **Request Resilience:** Increased axios timeout to 60 seconds for chat endpoints to match backend processing expectations.
- **Polling Recovery:** Implemented a silent 30-second polling retry mechanism to recover AI responses if the backend connection drops (e.g., 504/524 Gateway Timeouts).
- **Voice Flow:**
  - Added an 'X' (cancel) button to the voice waveform UI.
  - Cancelling the recording instantly unloads the audio and dismisses the waveform without transcribing or sending anything to the AI.
  - The cancel button now also works during the in-flight transcription phase, securely discarding the payload.
- **Message Rendering:**
  - Filtered out backend 'insight' messages from the chat UI to prevent empty chat bubbles.
  - Fixed sender mapping logic to reliably map roles to 'ai' or 'user' avatars.
  - Corrected the 'AI is typing...' indicator logic to align with the new filtered message list.

