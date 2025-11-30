# Kese - Digital Gold Wallet & Social Savings App

**Kese** (Turkish for "Pouch" or "Purse") is a modern mobile wallet application built with React Native and the Tether Wallet Development Kit (WDK). It bridges traditional savings habits with modern blockchain technology, focusing on Gold (XAUT) and Stablecoins (USDT).

## 🌟 Features

### 1. Digital Wallet
- **Multi-Asset Support:** Securely store, send, and receive **Tether Gold (XAUT)** and **Tether USD (USDT)**.
- **Real-time Valuation:** View your portfolio value in USD with real-time price updates.
- **Transaction History:** Track all your incoming and outgoing transfers with detailed activity logs.

### 2. Gold Day (Altın Günü) 🆕
A digital reimagining of the traditional "Gold Day" (Altın Günü) culture:
- **Create Rooms:** Set up savings groups with friends and family.
- **Flexible Rules:** Choose the asset (Gold or Dollar), contribution amount, and frequency (Weekly/Monthly).
- **Manage Participants:** Invite members via QR codes and track contributions.
- **Rotating Savings:** Automate the collection and distribution of funds (ROSCA model).

### 3. Social Payments (Takı Tak)
- **QR Payments:** Easily send "jewelry" (gold/money) at weddings or events by scanning a QR code.
- **Direct Transfers:** Fast and low-fee peer-to-peer transactions on the blockchain.

## 🛠 Tech Stack

- **Framework:** [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/) (SDK 54)
- **Navigation:** [Expo Router](https://docs.expo.dev/router/introduction/)
- **Blockchain:** [Tether WDK](https://github.com/tetherto/wdk) (Wallet Development Kit)
- **State Management:** Redux Toolkit
- **Styling:** Custom StyleSheet with a centralized Design System
- **Icons:** Lucide React Native
- **Cryptography:** Ethers.js, BIP39

## 🚀 Getting Started

### Prerequisites
- Node.js (LTS recommended)
- npm or yarn
- iOS Simulator (Mac only) or Android Emulator
- Expo Go app (for physical device testing)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd nakit_uygulamasi
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Run on device/emulator:**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan the QR code with Expo Go on your physical device

## 📂 Project Structure

```
src/
├── app/                 # Expo Router screens and navigation
│   ├── gold-day/        # Gold Day feature screens
│   ├── onboarding/      # Wallet creation flow
│   ├── wallet.tsx       # Main dashboard
│   └── ...
├── components/          # Reusable UI components
├── constants/           # Colors, themes, and app constants
├── hooks/               # Custom React hooks (useWallet, etc.)
├── providers/           # Context providers (Wallet, Theme)
├── services/            # Business logic (Pricing, Gold Day)
└── utils/               # Helper functions
```

## 🔐 Security

- **Non-Custodial:** You own your private keys. The app generates a seed phrase that is stored securely on your device.
- **Encryption:** Sensitive data is encrypted using industry-standard libraries.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

*Built with ❤️ using Tether WDK*
