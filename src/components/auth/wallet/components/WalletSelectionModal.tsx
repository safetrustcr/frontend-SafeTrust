'use client';

import React, { useState, useEffect } from 'react';
import { ISupportedWallet } from '@creit.tech/stellar-wallets-kit';
import { kit } from '../constants/wallet-kit.constant';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Wallet, 
  CheckCircle, 
  AlertTriangle, 
  Download, 
  ExternalLink,
  RefreshCw,
  QrCode
} from 'lucide-react';

interface WalletSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletSelected: (wallet: ISupportedWallet) => void;
}

interface WalletInfo extends ISupportedWallet {
  isInstalled: boolean;
}

export const WalletSelectionModal: React.FC<WalletSelectionModalProps> = ({
  isOpen,
  onClose,
  onWalletSelected
}) => {
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletInfo | null>(null);

  // Load supported wallets
  const loadWallets = async () => {
    try {
      setLoading(true);
      const supportedWallets = await kit.getSupportedWallets();
      
      console.log('Kit supported wallets:', supportedWallets);
      
      const enhancedWallets = supportedWallets.map(wallet => ({
        ...wallet,
        isInstalled: wallet.isAvailable
      }));
      
      setWallets(enhancedWallets);
    } catch (error) {
      console.error('Error loading wallets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadWallets();
    }
  }, [isOpen]);

  const handleWalletClick = async (wallet: WalletInfo) => {
    if (wallet.isInstalled) {
      onWalletSelected(wallet);
    } else {
      setSelectedWallet(wallet);
    }
  };

  // Detect browser and platform
  const getBrowserInfo = () => {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isChrome = /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor);
    const isFirefox = /Firefox/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && /Apple Computer/.test(navigator.vendor);
    const isEdge = /Edg/.test(userAgent);

    return { isMobile, isChrome, isFirefox, isSafari, isEdge };
  };

  const getInstallationSteps = (wallet: WalletInfo) => {
    const { isMobile, isChrome, isFirefox, isSafari, isEdge } = getBrowserInfo();
    
    const steps = {
      freighter: isMobile ? [
        'Freighter is a browser extension',
        'Please use a desktop browser',
        'Or try Albedo (web wallet)',
        'No installation required for Albedo'
      ] : [
        isChrome ? 'Go to Chrome Web Store' : 
        isFirefox ? 'Go to Firefox Add-ons' :
        isSafari ? 'Go to Mac App Store' :
        'Go to Freighter website',
        'Click "Install Extension"',
        'Add to your browser',
        'Create or import a wallet',
        'Return here and try again'
      ],
      albedo: [
        'Albedo is a web wallet',
        'No installation required',
        'Works on all browsers and devices',
        'Just click connect to continue'
      ],
      lobstr: isMobile ? [
        'LOBSTR is a mobile app',
        'Download from App Store or Google Play',
        'Create or import a wallet',
        'Use WalletConnect to connect'
      ] : [
        isChrome ? 'Go to Chrome Web Store' : 
        isFirefox ? 'Go to Firefox Add-ons' :
        'Go to LOBSTR website',
        'Download the browser extension',
        'Install in your browser',
        'Create or import a wallet',
        'Return here and try again'
      ],
      rabet: isMobile ? [
        'Rabet is a browser extension',
        'Please use a desktop browser',
        'Or try Albedo (web wallet)',
        'No installation required for Albedo'
      ] : [
        isChrome ? 'Go to Chrome Web Store' : 
        isFirefox ? 'Go to Firefox Add-ons' :
        'Go to Rabet website',
        'Click "Install Extension"',
        'Add to your browser',
        'Create or import a wallet',
        'Return here and try again'
      ],
      xbull: [
        'xBull is a mobile wallet',
        'Download from App Store or Google Play',
        'Create or import a wallet',
        'Use WalletConnect to connect'
      ],
      hana: [
        'Hana is a mobile wallet',
        'Download from App Store or Google Play',
        'Create or import a wallet',
        'Use WalletConnect to connect'
      ]
    };

    return steps[wallet.id as keyof typeof steps] || [
      'Visit the wallet website',
      'Follow installation instructions',
      'Create or import a wallet',
      'Return here and try again'
    ];
  };

  const getWalletUrl = (wallet: WalletInfo) => {
    const { isMobile, isChrome, isFirefox, isSafari } = getBrowserInfo();
    
    const urls = {
      freighter: isMobile ? 'https://albedo.link/' : // Redirect to Albedo for mobile
        isChrome ? 'https://chromewebstore.google.com/detail/freighter/bcacfldlkkdogcmkkibnjlakofdplcbk' :
        isFirefox ? 'https://addons.mozilla.org/en-US/firefox/addon/freighter/' :
        isSafari ? 'https://apps.apple.com/app/freighter/id1576157386' :
        'https://freighter.app/',
      albedo: 'https://albedo.link/',
      lobstr: isMobile ? 'https://lobstr.co/app' : // Mobile app page
        isChrome ? 'https://chromewebstore.google.com/detail/lobstr/ldiagbjmlmjiieclmdkagofdjcgodjle' :
        isFirefox ? 'https://addons.mozilla.org/en-US/firefox/addon/lobstr-vault/' :
        'https://lobstr.co',
      rabet: isMobile ? 'https://albedo.link/' : // Redirect to Albedo for mobile
        isChrome ? 'https://chromewebstore.google.com/detail/rabet/hgmoaheomcjnaheggkfafnjilfcefbmo' :
        isFirefox ? 'https://addons.mozilla.org/en-US/firefox/addon/rabet/' :
        'https://rabet.io/',
      xbull: isMobile ? 'https://xbull.app' : 'https://xbull.app',
      hana: isMobile ? 'https://www.hanawallet.io/' : 'https://www.hanawallet.io/'
    };

    return urls[wallet.id as keyof typeof urls] || wallet.url;
  };

  // Generate QR code URL for mobile wallets
  const getQRCodeUrl = (wallet: WalletInfo) => {
    const url = getWalletUrl(wallet);
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`;
  };

  // Check if wallet is mobile-only
  const isMobileWallet = (wallet: WalletInfo) => {
    return ['xbull', 'hana'].includes(wallet.id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Connect Wallet</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[calc(90vh-120px)] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading wallets...</span>
            </div>
          ) : (
            <>
              {selectedWallet && !selectedWallet.isInstalled ? (
                /* Installation Guide */
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={selectedWallet.icon} 
                      alt={selectedWallet.name}
                      className="w-12 h-12 rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = 'https://stellar.creit.tech/wallet-icons/default.png';
                      }}
                    />
                    <div>
                      <h3 className="text-lg font-semibold">{selectedWallet.name}</h3>
                      <p className="text-sm text-gray-600">Installation Guide</p>
                    </div>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Installation Steps</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="space-y-2 text-sm">
                        {getInstallationSteps(selectedWallet).map((step, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>

                  {/* QR Code for mobile wallets */}
                  {isMobileWallet(selectedWallet) && (
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center">
                          <QrCode className="h-4 w-4 mr-2" />
                          Scan to Download
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-center">
                        <img 
                          src={getQRCodeUrl(selectedWallet)} 
                          alt={`QR code for ${selectedWallet.name}`}
                          className="mx-auto mb-3 border rounded-lg"
                        />
                        <p className="text-sm text-gray-600">
                          Scan with your mobile device to download {selectedWallet.name}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex space-x-3">
                    <Button 
                      onClick={() => window.open(getWalletUrl(selectedWallet), '_blank')}
                      className="flex-1"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {isMobileWallet(selectedWallet) ? 'Download App' : 
                       getBrowserInfo().isMobile ? 'Visit Website' : 'Download Extension'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedWallet(null)}
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
                  
                  {wallets.map((wallet) => (
                    <Card 
                      key={wallet.id}
                      className={`cursor-pointer bg-transparent transition-all duration-200 hover:shadow-md ${
                        wallet.isInstalled 
                          ? 'hover:ring-2 hover:ring-green-200' 
                          : 'hover:ring-2 hover:ring-blue-200'
                      }`}
                      onClick={() => handleWalletClick(wallet)}
                    >
                      <CardContent className="!p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <img 
                              src={wallet.icon} 
                              alt={wallet.name}
                              className="w-8 h-8 rounded-lg"
                              onError={(e) => {
                                e.currentTarget.src = 'https://stellar.creit.tech/wallet-icons/default.png';
                              }}
                            />
                            <div>
                              <h3 className="font-semibold">{wallet.name}</h3>
                              {/* <p className="text-sm text-gray-600">{wallet.type}</p> */}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={wallet.isInstalled ? "default" : "secondary"}
                              className={wallet.isInstalled 
                                ? "bg-green-100 text-green-800 hover:bg-green-100" 
                                : "bg-gray-100 text-gray-800"
                              }
                            >
                              {wallet.isInstalled ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Installed
                                </>
                              ) : (
                                <>
                                  <Download className="h-3 w-3 mr-1" />
                                  Install
                                </>
                              )}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
