import type React from "react"
import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Script from "next/script"

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
})

export const metadata: Metadata = {
  title: "Trace Green - Carbon Footprint Tracker",
  description: "Track, reduce, and offset your carbon footprint with gamified sustainability features",
  generator: "v0.app",
  manifest: "/manifest.json",
}

export const viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={dmSans.variable}>
      <head>
        <link rel="icon" href="/images/trace-green-logo.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TraceGreen" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
        <meta name="msapplication-TileColor" content="#10b981" />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
        <Script id="service-worker" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js', {
                  scope: '/',
                  updateViaCache: 'none'
                }).then(function(registration) {
                  console.log('TraceGreen PWA: SW registered with scope: ', registration.scope);
                  
                  // Check for updates every 60 seconds in development
                  if (process.env.NODE_ENV === 'development') {
                    setInterval(() => {
                      registration.update();
                    }, 60000);
                  }
                  
                  // Check for updates
                  registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('TraceGreen PWA: New content available; please refresh.');
                      }
                    });
                  });
                }, function(err) {
                  console.log('TraceGreen PWA: SW registration failed: ', err);
                });
              });
              
              // Handle PWA installation prompt
              let deferredPrompt;
              let installButton;
              
              window.addEventListener('beforeinstallprompt', (e) => {
                console.log('TraceGreen PWA: Install prompt triggered');
                e.preventDefault();
                deferredPrompt = e;
                
                // Show custom install button or use browser default
                console.log('TraceGreen PWA: Ready for installation');
                
                // You can create a custom install button here
                if (!document.getElementById('pwa-install-button')) {
                  installButton = document.createElement('button');
                  installButton.id = 'pwa-install-button';
                  installButton.innerHTML = '📱 Install TraceGreen App';
                  installButton.style.cssText = \`
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: #10b981;
                    color: white;
                    padding: 12px 16px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                    z-index: 1000;
                    transition: all 0.2s ease;
                  \`;
                  
                  installButton.addEventListener('mouseenter', () => {
                    installButton.style.background = '#059669';
                    installButton.style.transform = 'translateY(-2px)';
                  });
                  
                  installButton.addEventListener('mouseleave', () => {
                    installButton.style.background = '#10b981';
                    installButton.style.transform = 'translateY(0)';
                  });
                  
                  installButton.addEventListener('click', async () => {
                    if (deferredPrompt) {
                      deferredPrompt.prompt();
                      const choiceResult = await deferredPrompt.userChoice;
                      if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                      }
                      deferredPrompt = null;
                      installButton.remove();
                    }
                  });
                  
                  document.body.appendChild(installButton);
                  
                  // Hide button after 10 seconds if not clicked
                  setTimeout(() => {
                    if (installButton && installButton.parentNode) {
                      installButton.remove();
                    }
                  }, 10000);
                }
              });
              
              // Handle successful installation
              window.addEventListener('appinstalled', (evt) => {
                console.log('TraceGreen PWA: App was successfully installed');
                if (installButton && installButton.parentNode) {
                  installButton.remove();
                }
                deferredPrompt = null;
              });
            }
          `}
        </Script>
      </body>
    </html>
  )
}
