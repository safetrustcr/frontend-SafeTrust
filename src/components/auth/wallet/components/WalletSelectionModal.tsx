"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ISupportedWallet } from "@creit.tech/stellar-wallets-kit";
import { useWalletOptions } from "@/hooks/useWalletOptions";
import {
  describeNetwork,
  type WalletReadiness,
  type WalletWithReadiness,
} from "@/lib/stellar/wallet-status";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  X,
  CheckCircle,
  Download,
  ExternalLink,
  RefreshCw,
  QrCode,
  Globe,
  Smartphone,
  AlertTriangle,
} from "lucide-react";

interface WalletSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletSelected: (wallet: ISupportedWallet) => void;
}

// States where clicking the row should immediately attempt a connection.
// Everything else (not installed, wrong network, mobile-unsupported) shows
// guidance instead of starting a connection.
const isConnectable = (readiness: WalletReadiness): boolean =>
  readiness.state === "ready" ||
  readiness.state === "not-allowed" ||
  readiness.state === "web-wallet";

export const WalletSelectionModal: React.FC<WalletSelectionModalProps> = ({
  isOpen,
  onClose,
  onWalletSelected,
}) => {
  const { options, loading, refresh } = useWalletOptions(isOpen);
  const [selectedItem, setSelectedItem] = useState<WalletWithReadiness | null>(
    null,
  );

  const handleWalletClick = (item: WalletWithReadiness) => {
    if (isConnectable(item.readiness)) {
      onWalletSelected(item.wallet);
    } else {
      setSelectedItem(item);
    }
  };

  const getBrowserInfo = () => {
    const userAgent = navigator.userAgent;
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent,
      );
    const isChrome =
      /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor);
    const isFirefox = /Firefox/.test(userAgent);
    const isSafari =
      /Safari/.test(userAgent) && /Apple Computer/.test(navigator.vendor);
    const isEdge = /Edg/.test(userAgent);

    return { isMobile, isChrome, isFirefox, isSafari, isEdge };
  };

  const getInstallationSteps = (wallet: ISupportedWallet) => {
    const { isMobile, isChrome, isFirefox, isSafari } = getBrowserInfo();

    const steps = {
      freighter: isMobile
        ? [
            "Freighter is a browser extension",
            "Please use a desktop browser",
            "Or try Albedo (web wallet)",
            "No installation required for Albedo",
          ]
        : [
            isChrome
              ? "Go to Chrome Web Store"
              : isFirefox
                ? "Go to Firefox Add-ons"
                : isSafari
                  ? "Go to Mac App Store"
                  : "Go to Freighter website",
            'Click "Install Extension"',
            "Add to your browser",
            "Create or import a wallet",
            "Return here and try again",
          ],
      albedo: [
        "Albedo is a web wallet",
        "No installation required",
        "Works on all browsers and devices",
        "Just click connect to continue",
      ],
      lobstr: isMobile
        ? [
            "LOBSTR is a mobile app",
            "Download from App Store or Google Play",
            "Create or import a wallet",
            "Use WalletConnect to connect",
          ]
        : [
            isChrome
              ? "Go to Chrome Web Store"
              : isFirefox
                ? "Go to Firefox Add-ons"
                : "Go to LOBSTR website",
            "Download the browser extension",
            "Install in your browser",
            "Create or import a wallet",
            "Return here and try again",
          ],
      rabet: isMobile
        ? [
            "Rabet is a browser extension",
            "Please use a desktop browser",
            "Or try Albedo (web wallet)",
            "No installation required for Albedo",
          ]
        : [
            isChrome
              ? "Go to Chrome Web Store"
              : isFirefox
                ? "Go to Firefox Add-ons"
                : "Go to Rabet website",
            'Click "Install Extension"',
            "Add to your browser",
            "Create or import a wallet",
            "Return here and try again",
          ],
      xbull: [
        "xBull is a mobile wallet",
        "Download from App Store or Google Play",
        "Create or import a wallet",
        "Use WalletConnect to connect",
      ],
      hana: [
        "Hana is a mobile wallet",
        "Download from App Store or Google Play",
        "Create or import a wallet",
        "Use WalletConnect to connect",
      ],
    };

    return (
      steps[wallet.id as keyof typeof steps] || [
        "Visit the wallet website",
        "Follow installation instructions",
        "Create or import a wallet",
        "Return here and try again",
      ]
    );
  };

  const getWalletUrl = (wallet: ISupportedWallet) => {
    const { isMobile, isChrome, isFirefox, isSafari } = getBrowserInfo();

    const urls = {
      freighter: isMobile
        ? "https://albedo.link/" // Redirect to Albedo for mobile
        : isChrome
          ? "https://chromewebstore.google.com/detail/freighter/bcacfldlkkdogcmkkibnjlakofdplcbk"
          : isFirefox
            ? "https://addons.mozilla.org/en-US/firefox/addon/freighter/"
            : isSafari
              ? "https://apps.apple.com/app/freighter/id1576157386"
              : "https://freighter.app/",
      albedo: "https://albedo.link/",
      lobstr: isMobile
        ? "https://lobstr.co/app" // Mobile app page
        : isChrome
          ? "https://chromewebstore.google.com/detail/lobstr/ldiagbjmlmjiieclmdkagofdjcgodjle"
          : isFirefox
            ? "https://addons.mozilla.org/en-US/firefox/addon/lobstr-vault/"
            : "https://lobstr.co",
      rabet: isMobile
        ? "https://albedo.link/" // Redirect to Albedo for mobile
        : isChrome
          ? "https://chromewebstore.google.com/detail/rabet/hgmoaheomcjnaheggkfafnjilfcefbmo"
          : isFirefox
            ? "https://addons.mozilla.org/en-US/firefox/addon/rabet/"
            : "https://rabet.io/",
      xbull: isMobile ? "https://xbull.app" : "https://xbull.app",
      hana: isMobile
        ? "https://www.hanawallet.io/"
        : "https://www.hanawallet.io/",
    };

    return urls[wallet.id as keyof typeof urls] || wallet.url;
  };

  // Generate QR code URL for mobile wallets
  const getQRCodeUrl = (wallet: ISupportedWallet) => {
    const url = getWalletUrl(wallet);
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`;
  };

  // Check if wallet is mobile-only
  const isMobileWallet = (wallet: ISupportedWallet) => {
    return ["xbull", "hana"].includes(wallet.id);
  };

  const getBadge = (readiness: WalletReadiness) => {
    switch (readiness.state) {
      case "ready":
        return {
          label: "Detected",
          icon: <CheckCircle className="h-3 w-3 mr-1" />,
          className: "bg-green-100 text-green-800 hover:bg-green-100",
        };
      case "not-allowed":
        return {
          label: "Detected · will ask permission",
          icon: <CheckCircle className="h-3 w-3 mr-1" />,
          className: "bg-green-100 text-green-800 hover:bg-green-100",
        };
      case "web-wallet":
        return {
          label: "Web wallet · opens albedo.link",
          icon: <Globe className="h-3 w-3 mr-1" />,
          className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
        };
      case "wrong-network":
        return {
          label: `Switch to ${describeNetwork(readiness.expected)}`,
          icon: <AlertTriangle className="h-3 w-3 mr-1" />,
          className: "bg-amber-100 text-amber-800 hover:bg-amber-100",
        };
      case "mobile-unsupported":
        return {
          label: "Use the mobile app",
          icon: <Smartphone className="h-3 w-3 mr-1" />,
          className: "bg-gray-100 text-gray-800",
        };
      case "not-installed":
      default:
        return {
          label: "Not installed",
          icon: <Download className="h-3 w-3 mr-1" />,
          className: "bg-gray-100 text-gray-800",
        };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Connect Wallet</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4 max-h-[calc(90vh-120px)] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading wallets...</span>
            </div>
          ) : (
            <>
              {selectedItem &&
              selectedItem.readiness.state === "wrong-network" ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Image
                      src={
                        selectedItem.wallet.icon ||
                        "https://stellar.creit.tech/wallet-icons/default.png"
                      }
                      alt={selectedItem.wallet.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-lg object-contain"
                      unoptimized
                    />
                    <div>
                      <h3 className="text-lg font-semibold">
                        {selectedItem.wallet.name}
                      </h3>
                      <p className="text-sm text-gray-600">Wrong network</p>
                    </div>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2 text-amber-600" />
                        Switch to{" "}
                        {describeNetwork(selectedItem.readiness.expected)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">
                        {selectedItem.wallet.name} is currently set to{" "}
                        {selectedItem.readiness.actual || "a different network"}
                        , but SafeTrust needs{" "}
                        {describeNetwork(selectedItem.readiness.expected)}.
                      </p>
                      <ol className="space-y-2 text-sm">
                        {[
                          `Open the ${selectedItem.wallet.name} extension`,
                          "Click the network name shown in the extension",
                          `Select ${describeNetwork(selectedItem.readiness.expected)}`,
                          "Return here and try again",
                        ].map((step, index) => (
                          <li
                            key={index}
                            className="flex items-start space-x-2"
                          >
                            <span className="flex-shrink-0 w-5 h-5 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>

                  <div className="flex space-x-3">
                    <Button
                      onClick={async () => {
                        await refresh();
                        setSelectedItem(null);
                      }}
                      className="flex-1"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      I&apos;ve switched networks
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedItem(null)}
                    >
                      Back
                    </Button>
                  </div>
                </div>
              ) : selectedItem ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Image
                      src={
                        selectedItem.wallet.icon ||
                        "https://stellar.creit.tech/wallet-icons/default.png"
                      }
                      alt={selectedItem.wallet.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-lg object-contain"
                      unoptimized
                    />
                    <div>
                      <h3 className="text-lg font-semibold">
                        {selectedItem.wallet.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Installation Guide
                      </p>
                    </div>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Installation Steps
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="space-y-2 text-sm">
                        {getInstallationSteps(selectedItem.wallet).map(
                          (step, index) => (
                            <li
                              key={index}
                              className="flex items-start space-x-2"
                            >
                              <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                                {index + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ),
                        )}
                      </ol>
                    </CardContent>
                  </Card>

                  {/* QR Code for mobile wallets */}
                  {isMobileWallet(selectedItem.wallet) && (
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center">
                          <QrCode className="h-4 w-4 mr-2" />
                          Scan to Download
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-center">
                        <Image
                          src={getQRCodeUrl(selectedItem.wallet)}
                          alt={`QR code for ${selectedItem.wallet.name}`}
                          width={150}
                          height={150}
                          className="mx-auto mb-3 border rounded-lg"
                          unoptimized
                        />
                        <p className="text-sm text-gray-600">
                          Scan with your mobile device to download{" "}
                          {selectedItem.wallet.name}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex space-x-3">
                    <Button
                      onClick={() =>
                        window.open(getWalletUrl(selectedItem.wallet), "_blank")
                      }
                      className="flex-1"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {isMobileWallet(selectedItem.wallet)
                        ? "Download App"
                        : getBrowserInfo().isMobile
                          ? "Visit Website"
                          : "Download Extension"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedItem(null)}
                    >
                      Back
                    </Button>
                  </div>
                </div>
              ) : (
                /* Wallet List */
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Choose a wallet to connect to SafeTrust
                  </p>

                  {options.map((item) => {
                    const badge = getBadge(item.readiness);
                    const connectable = isConnectable(item.readiness);
                    return (
                      <Card
                        key={item.wallet.id}
                        className={`cursor-pointer bg-transparent transition-all duration-200 hover:shadow-md ${
                          connectable
                            ? "hover:ring-2 hover:ring-green-200"
                            : "hover:ring-2 hover:ring-blue-200"
                        }`}
                        onClick={() => handleWalletClick(item)}
                      >
                        <CardContent className="!p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Image
                                src={
                                  item.wallet.icon ||
                                  "https://stellar.creit.tech/wallet-icons/default.png"
                                }
                                alt={item.wallet.name}
                                width={32}
                                height={32}
                                className="w-8 h-8 rounded-lg object-contain"
                                unoptimized
                              />
                              <div>
                                <h3 className="font-semibold">
                                  {item.wallet.name}
                                </h3>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant="default"
                                className={badge.className}
                              >
                                {badge.icon}
                                {badge.label}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
