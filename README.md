# ReachuDemo - eCommerce Mobile Application

This project is a demonstration of a mobile eCommerce application built with React Native that integrates with the Reachu GraphQL API.

## Features

- **Product Catalog**: Browse products with images, prices, and descriptions
- **Shopping Cart**: Full functionality to add, remove, and update products
- **Multi-step Checkout Process**:
  - Cart summary
  - Shipping address form
  - Billing address form
  - Order review
- **Payment Integration**: Multiple payment gateway support (Stripe, Klarna)
- **Modern Design**: Clean and attractive user interface with quality UX

## Technologies

- [React Native](https://reactnative.dev/) - Mobile development framework
- [Apollo Client](https://www.apollographql.com/docs/react/) - GraphQL client for React
- [React Navigation](https://reactnavigation.org/) - Screen navigation
- [React Native Elements](https://reactnativeelements.com/) - UI components
- [React Native Paper](https://callstack.github.io/react-native-paper/) - Additional UI components

## Project Structure

```
/components
  /FooterNavigation     # Bottom navigation bar
  /ProductDetail        # Detailed product view
  /Screens
    /Checkout           # Multi-step checkout process
      /components       # Components for each checkout step
    /Container          # Main container
    /Payment            # Payment screen and gateways
    /Products           # Product listing and grid
/context
  cartContext.js        # Global cart context
/graphql
  /hooks                # Custom GraphQL hooks
  /mutations            # GraphQL mutation definitions
  /queries              # GraphQL query definitions
  /schema_reachu.json   # GraphQL schema
```

## Reachu API

Reachu is a platform that provides a comprehensive GraphQL API for eCommerce:

- Product and variant management
- Shopping cart
- Checkout process
- Multiple payment gateway integration (Stripe, Klarna, Vipps)
- Multi-currency and multi-country support

## Checkout Flow

The implemented checkout process has the following steps:

1. **Cart Summary**: Shows selected products
2. **Shipping Information**: Collects address and contact details
3. **Billing Information**: Option to use the same shipping address or provide a different one
4. **Order Review**: Final confirmation of address, items, and terms
5. **Payment**: Payment method selection (Stripe or Klarna)

## Quick Start Guide

### Prerequisites

- Node.js (>= 14.x)
- Watchman
- Ruby (for iOS)
- Xcode (for iOS)
- Android Studio (for Android)
- JDK (>= 11)

Refer to the [official setup guide](https://reactnative.dev/docs/environment-setup) for detailed instructions.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/reachuDemo.git
   cd reachuDemo
   ```

2. Install dependencies:
   ```bash
   npm install
   # For iOS also run:
   cd ios && pod install && cd ..
   ```

3. Configure environment variables (create a .env file based on .env.example)

### Running the App

To start the Metro server and run the application:

```bash
# Start Metro
npm start

# In another terminal, for iOS:
npm run ios

# Or for Android:
npm run android
```

## Troubleshooting

If you encounter the error `listen EADDRINUSE: address already in use :::8081`, it means Metro is already running. You can:

```bash
# Find the process
lsof -i :8081 | grep node

# Kill it with its PID (replace 12345 with the actual PID)
kill -9 12345
```

To restart completely:

```bash
npm start -- --reset-cache
```

## Customization

The project is designed to be easily customizable:

- To change colors and theme, edit the style files
- To adjust checkout features, modify components in `/Screens/Checkout`
- To add payment methods, implement new components in `/Screens/Payment/components`

## GraphQL Error Handling

The application includes comprehensive logging for GraphQL operations that will help debug API integration issues:

- Detailed request and response logging
- Structured error handling
- Parameter validation

## License

This project is licensed under the MIT License.
