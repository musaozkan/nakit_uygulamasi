# Nakit - The Crypto Cash App 💸

**Nakit** is a next-generation peer-to-peer (P2P) payment application that brings the seamless user experience of Cash App to the blockchain. Powered by **Tether WDK (Wallet Development Kit)**, Nakit enables instant, non-custodial, and borderless transactions using USDT and other cryptocurrencies.

> **Built for the Tether WDK Hackathon** 🚀

## 🌟 Vision

To democratize access to digital finance by making crypto payments as easy as sending a text message. We solve the complexity of crypto addresses and gas fees, offering a familiar "Web2" experience with "Web3" freedom.

## 💡 Key Features

- **Non-Custodial Security**: Users own their keys and funds. Powered by Tether WDK's advanced key management.
- **Instant P2P Payments**: Send USDT to friends using just their username or phone number. No need to copy-paste long wallet addresses.
- **AI-Powered Agents**: Integrated AI agents to handle automated payments, recurring bills, or even "smart" spending limits.
- **Borderless & Low Fee**: Leverage the speed and low cost of blockchain networks (e.g., Tron, Ethereum, Polygon) supported by Tether.
- **Fiat On/Off Ramp**: (Planned) Seamless integration to convert local currency (TRY/USD) to USDT.

## 🛠 Technology Stack

- **Core**: [Tether WDK](https://github.com/tether-wdk) (Wallet Development Kit)
- **Frontend**: React Native / Expo (Mobile First)
- **Backend**: Node.js (for user directory and metadata - *not for holding funds*)
- **Blockchain**: Multi-chain support via WDK
- **AI**: OpenAI API / Local LLM for smart agent features

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Yarn or npm
- iOS Simulator or Android Emulator

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nakit-app.git
   cd nakit-app
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Environment**
   Create a `.env` file in the root directory:
   ```env
   WDK_API_KEY=your_tether_wdk_key
   API_URL=http://localhost:3000
   ```

4. **Run the App**
   ```bash
   npx expo start
   ```

## 📱 How It Works

1. **Create Wallet**: On signup, a non-custodial wallet is generated locally on the device using Tether WDK.
2. **Connect Identity**: Map your wallet address to a unique `$Cashtag` (e.g., `$ozkan`).
3. **Send Money**: Type `$ali` and `10 USDT`. Click send.
4. **Sign & Broadcast**: The app uses WDK to sign the transaction locally and broadcasts it to the blockchain.

## 🔮 Roadmap

- [ ] **Phase 1 (MVP)**: Basic Send/Receive USDT, Wallet Creation via WDK.
- [ ] **Phase 2**: Contact list integration, QR Code support.
- [ ] **Phase 3**: AI Financial Assistant (Smart budgeting).
- [ ] **Phase 4**: Virtual Card issuance for spending crypto anywhere.

## 🤝 Contributing

Contributions are welcome! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.