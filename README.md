# University Facility Helpdesk Mobile Application

## Introduction

This project is a **Facility Helpdesk Mobile Application** designed for university environments. It enables students and staff to report facility issues and track requests. It also centralizes the operation for the maintenance workers and administrators for managing reported issues. Worth to mention features would be auto task assignment and AI analysis using LLM. Built with [React Native](https://reactnative.dev), the app runs on both Android and iOS platforms, providing a seamless and accessible experience for all users.

## Prerequisites

Before installing and running the application, ensure you have the following tools and dependencies set up on your development machine:

- **Node.js** (Recommended: v18 or higher)  
  [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js) or [Yarn](https://classic.yarnpkg.com/lang/en/)
- **Git**  
  [Download Git](https://git-scm.com/)
- **Android Studio** (for Android development/emulation)  
  [Download Android Studio](https://developer.android.com/studio)
- **Xcode** (for iOS development, macOS only)  
  [Download Xcode](https://developer.apple.com/xcode/)
- **CocoaPods** (for iOS dependencies, macOS only)  
  Install via terminal:  
  ```sh
  sudo gem install cocoapods
  ```
- **Watchman** (recommended for macOS)  
  [Install Watchman](https://facebook.github.io/watchman/docs/install.html)

For detailed environment setup, refer to the [React Native Environment Setup Guide](https://reactnative.dev/docs/environment-setup).

## Installation

Follow these steps to set up and run the project locally:

1. **Clone the repository**
   ```sh
   git clone <your-repository-url>
   cd <project-directory>
   ```

2. **Install project dependencies**
   ```sh
   npm install
   # or
   yarn install
   ```

3. **Start the Metro bundler**
   ```sh
   npm start
   # or
   yarn start
   ```

4. **Run the application**

   - **For Android:**
     - Start an Android emulator or connect a device.
     - In a new terminal window, run:
       ```sh
       npm run android
       # or
       yarn android
       ```

   - **For iOS (macOS only):**
     - Install CocoaPods dependencies:
       ```sh
       cd ios
       pod install
       cd ..
       ```
     - Start an iOS simulator or connect a device.
     - In a new terminal window, run:
       ```sh
       npm run ios
       # or
       yarn ios
       ```

## Support

If you encounter issues during setup or installation, please consult the [React Native Troubleshooting Guide](https://reactnative.dev/docs/troubleshooting) or open an issue in this repository.

---

**Enjoy using the University Facility Helpdesk Mobile Application!**
