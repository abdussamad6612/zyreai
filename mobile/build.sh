#!/bin/bash

# ZYREAI APK Build Script
# Usage: ./build.sh [preview|production]

PROFILE=${1:-preview}

echo "================================================"
echo "  ZYREAI Android APK Builder"
echo "  Profile: $PROFILE"
echo "================================================"

# Check if EXPO_TOKEN is set
if [ -z "$EXPO_TOKEN" ]; then
  echo ""
  echo "ERROR: EXPO_TOKEN environment variable not set!"
  echo ""
  echo "Steps:"
  echo "1. expo.dev pe free account banao"
  echo "2. expo.dev/accounts/YOUR_NAME/settings/access-tokens pe jao"
  echo "3. Token banao aur copy karo"
  echo "4. Is command se run karo:"
  echo "   EXPO_TOKEN=your_token_here ./build.sh"
  echo ""
  exit 1
fi

echo ""
echo "Checking EAS CLI..."
eas --version

echo ""
echo "Starting EAS Build (Android APK)..."
echo "Build Expo dashboard pe track karo: https://expo.dev"
echo ""

cd "$(dirname "$0")"
eas build --platform android --profile "$PROFILE" --non-interactive

echo ""
echo "Build submitted! Expo dashboard pe status check karo."
echo "https://expo.dev"
